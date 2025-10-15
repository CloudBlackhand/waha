import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AppsService,
  IAppsService,
} from '@waha/apps/app_sdk/services/IAppsService';
import { EngineBootstrap } from '@waha/core/abc/EngineBootstrap';
import { GowsEngineConfigService } from '@waha/core/config/GowsEngineConfigService';
import { WebJSEngineConfigService } from '@waha/core/config/WebJSEngineConfigService';
import { WhatsappSessionGoWSCore } from '@waha/core/engines/gows/session.gows.core';
import { WebhookConductor } from '@waha/core/integrations/webhooks/WebhookConductor';
import { MediaStorageFactory } from '@waha/core/media/MediaStorageFactory';
import { DefaultMap } from '@waha/utils/DefaultMap';
import { getPinoLogLevel, LoggerBuilder } from '@waha/utils/logging';
import { promiseTimeout, sleep } from '@waha/utils/promiseTimeout';
import { complete } from '@waha/utils/reactive/complete';
import { SwitchObservable } from '@waha/utils/reactive/SwitchObservable';
import { PinoLogger } from 'nestjs-pino';
import { Observable, retry, share } from 'rxjs';
import { map } from 'rxjs/operators';

import { WhatsappConfigService } from '../config.service';
import {
  WAHAEngine,
  WAHAEvents,
  WAHASessionStatus,
} from '../structures/enums.dto';
import {
  ProxyConfig,
  SessionConfig,
  SessionDetailedInfo,
  SessionDTO,
  SessionInfo,
} from '../structures/sessions.dto';
import { WebhookConfig } from '../structures/webhooks.config.dto';
import { populateSessionInfo, SessionManager } from './abc/manager.abc';
import { SessionParams, WhatsappSession } from './abc/session.abc';
import { EngineConfigService } from './config/EngineConfigService';
import { WhatsappSessionNoWebCore } from './engines/noweb/session.noweb.core';
import { WhatsappSessionWebJSCore } from './engines/webjs/session.webjs.core';
import { DOCS_URL } from './exceptions';
import { getProxyConfig } from './helpers.proxy';
import { MediaManager } from './media/MediaManager';
import { LocalSessionAuthRepository } from './storage/LocalSessionAuthRepository';
import { LocalStoreCore } from './storage/LocalStoreCore';

// Removida a classe OnlyDefaultSessionIsAllowed que impedia múltiplas sessões

enum SessionStatus {
  REMOVED = undefined,
  STOPPED = null,
}

@Injectable()
export class SessionManagerCore extends SessionManager implements OnModuleInit {
  SESSION_STOP_TIMEOUT = 3000;

  // Modificado para suportar múltiplas sessões
  // Map de sessões: nome -> sessão ou status
  private sessions: Map<string, WhatsappSession | SessionStatus> = new Map();
  private sessionConfigs: Map<string, SessionConfig> = new Map();
  DEFAULT = 'default';

  protected readonly EngineClass: typeof WhatsappSession;
  protected events2: DefaultMap<WAHAEvents, SwitchObservable<any>>;
  protected readonly engineBootstrap: EngineBootstrap;

  constructor(
    config: WhatsappConfigService,
    private engineConfigService: EngineConfigService,
    private webjsEngineConfigService: WebJSEngineConfigService,
    gowsConfigService: GowsEngineConfigService,
    log: PinoLogger,
    private mediaStorageFactory: MediaStorageFactory,
    @Inject(AppsService)
    appsService: IAppsService,
  ) {
    super(log, config, gowsConfigService, appsService);
    
    // Inicializa a sessão default como parada
    this.sessions.set(this.DEFAULT, SessionStatus.STOPPED);
    
    const engineName = this.engineConfigService.getDefaultEngineName();
    this.EngineClass = this.getEngine(engineName);
    this.engineBootstrap = this.getEngineBootstrap(engineName);

    this.events2 = new DefaultMap<WAHAEvents, SwitchObservable<any>>(
      (key) =>
        new SwitchObservable((obs$) => {
          return obs$.pipe(retry(), share());
        }),
    );

    this.store = new LocalStoreCore(engineName.toLowerCase());
    this.sessionAuthRepository = new LocalSessionAuthRepository(this.store);
    this.clearStorage().catch((error) => {
      this.log.error({ error }, 'Error while clearing storage');
    });
  }

  protected getEngine(engine: WAHAEngine): typeof WhatsappSession {
    if (engine === WAHAEngine.WEBJS) {
      return WhatsappSessionWebJSCore;
    } else if (engine === WAHAEngine.NOWEB) {
      return WhatsappSessionNoWebCore;
    } else if (engine === WAHAEngine.GOWS) {
      return WhatsappSessionGoWSCore;
    } else {
      throw new NotFoundException(`Unknown whatsapp engine '${engine}'.`);
    }
  }

  // Removido o método onlyDefault que impedia múltiplas sessões

  async beforeApplicationShutdown(signal?: string) {
    // Para todas as sessões ativas
    for (const [name, session] of this.sessions.entries()) {
      if (session && session !== SessionStatus.REMOVED && session !== SessionStatus.STOPPED) {
        await this.stop(name, true);
      }
    }
    this.stopEvents();
    await this.engineBootstrap.shutdown();
  }

  async onApplicationBootstrap() {
    await this.engineBootstrap.bootstrap();
    this.startPredefinedSessions();
  }

  private async clearStorage() {
    const storage = await this.mediaStorageFactory.build(
      'all',
      this.log.logger.child({ name: 'Storage' }),
    );
    await storage.purge();
  }

  //
  // API Methods
  //
  async exists(name: string): Promise<boolean> {
    return this.sessions.has(name) && this.sessions.get(name) !== SessionStatus.REMOVED;
  }

  isRunning(name: string): boolean {
    const session = this.sessions.get(name);
    return session && session !== SessionStatus.REMOVED && session !== SessionStatus.STOPPED;
  }

  async upsert(name: string, config?: SessionConfig): Promise<void> {
    this.sessionConfigs.set(name, config);
    // Se a sessão não existe, cria como parada
    if (!this.sessions.has(name)) {
      this.sessions.set(name, SessionStatus.STOPPED);
    }
  }

  async start(name: string): Promise<SessionDTO> {
    if (this.isRunning(name)) {
      throw new UnprocessableEntityException(
        `Session '${name}' is already started.`,
      );
    }
    
    this.log.info({ session: name }, `Starting session...`);
    const logger = this.log.logger.child({ session: name });
    const sessionConfig = this.sessionConfigs.get(name);
    logger.level = getPinoLogLevel(sessionConfig?.debug);
    const loggerBuilder: LoggerBuilder = logger;

    const storage = await this.mediaStorageFactory.build(
      name,
      loggerBuilder.child({ name: 'Storage' }),
    );
    await storage.init();
    const mediaManager = new MediaManager(
      storage,
      this.config.mimetypes,
      loggerBuilder.child({ name: 'MediaManager' }),
    );

    const webhook = new WebhookConductor(loggerBuilder);
    const proxyConfig = this.getProxyConfig(name);
    const sessionParams: SessionParams = {
      name,
      mediaManager,
      loggerBuilder,
      printQR: this.engineConfigService.shouldPrintQR,
      sessionStore: this.store,
      proxyConfig: proxyConfig,
      sessionConfig: sessionConfig,
      ignore: this.ignoreChatsConfig(sessionConfig),
    };
    if (this.EngineClass === WhatsappSessionWebJSCore) {
      sessionParams.engineConfig = this.webjsEngineConfigService.getConfig();
    } else if (this.EngineClass === WhatsappSessionGoWSCore) {
      sessionParams.engineConfig = this.gowsConfigService.getConfig();
    }
    await this.sessionAuthRepository.init(name);
    // @ts-ignore
    const session = new this.EngineClass(sessionParams);
    this.sessions.set(name, session);
    this.updateSession(name);

    // configure webhooks
    const webhooks = this.getWebhooks(name);
    webhook.configure(session, webhooks);

    // Apps
    await this.configureApps(session);

    // start session
    await session.start();
    logger.info('Session has been started.');
    return {
      name: session.name,
      status: session.status,
      config: session.sessionConfig,
    };
  }

  private updateSession(name: string) {
    const session = this.sessions.get(name);
    if (!session || session === SessionStatus.REMOVED || session === SessionStatus.STOPPED) {
      return;
    }
    
    const whatsappSession: WhatsappSession = session as WhatsappSession;
    for (const eventName in WAHAEvents) {
      const event = WAHAEvents[eventName];
      const stream$ = whatsappSession
        .getEventObservable(event)
        .pipe(map(populateSessionInfo(event, whatsappSession)));
      
      // Para múltiplas sessões, precisamos gerenciar os eventos de forma diferente
      // Cada sessão deve ter seus próprios eventos
      this.events2.get(event).switch(stream$);
    }
  }

  getSessionEvent(session: string, event: WAHAEvents): Observable<any> {
    return this.events2.get(event);
  }

  async stop(name: string, silent: boolean): Promise<void> {
    if (!this.isRunning(name)) {
      this.log.debug({ session: name }, `Session is not running.`);
      return;
    }

    this.log.info({ session: name }, `Stopping session...`);
    try {
      const session = this.getSession(name);
      await session.stop();
    } catch (err) {
      this.log.warn(`Error while stopping session '${name}'`);
      if (!silent) {
        throw err;
      }
    }
    this.log.info({ session: name }, `Session has been stopped.`);
    this.sessions.set(name, SessionStatus.STOPPED);
    this.updateSession(name);
    await sleep(this.SESSION_STOP_TIMEOUT);
  }

  async unpair(name: string) {
    const session = this.sessions.get(name);
    if (!session || session === SessionStatus.REMOVED || session === SessionStatus.STOPPED) {
      return;
    }
    
    const whatsappSession = session as WhatsappSession;
    this.log.info({ session: name }, 'Unpairing the device from account...');
    await whatsappSession.unpair().catch((err) => {
      this.log.warn(`Error while unpairing from device: ${err}`);
    });
    await sleep(1000);
  }

  async logout(name: string): Promise<void> {
    await this.sessionAuthRepository.clean(name);
  }

  async delete(name: string): Promise<void> {
    this.sessions.set(name, SessionStatus.REMOVED);
    this.updateSession(name);
    this.sessionConfigs.delete(name);
  }

  /**
   * Combine per session and global webhooks
   */
  private getWebhooks(sessionName: string) {
    let webhooks: WebhookConfig[] = [];
    const sessionConfig = this.sessionConfigs.get(sessionName);
    if (sessionConfig?.webhooks) {
      webhooks = webhooks.concat(sessionConfig.webhooks);
    }
    const globalWebhookConfig = this.config.getWebhookConfig();
    if (globalWebhookConfig) {
      webhooks.push(globalWebhookConfig);
    }
    return webhooks;
  }

  /**
   * Get either session's or global proxy if defined
   */
  protected getProxyConfig(sessionName: string): ProxyConfig | undefined {
    const sessionConfig = this.sessionConfigs.get(sessionName);
    if (sessionConfig?.proxy) {
      return sessionConfig.proxy;
    }
    
    // Cria um mapa de sessões para o helper de proxy
    const sessions: { [key: string]: WhatsappSession } = {};
    for (const [name, session] of this.sessions.entries()) {
      if (session && session !== SessionStatus.REMOVED && session !== SessionStatus.STOPPED) {
        sessions[name] = session as WhatsappSession;
      }
    }
    
    return getProxyConfig(this.config, sessions, sessionName);
  }

  getSession(name: string): WhatsappSession {
    const session = this.sessions.get(name);
    if (!session || session === SessionStatus.REMOVED || session === SessionStatus.STOPPED) {
      throw new NotFoundException(
        `We didn't find a session with name '${name}'.\n` +
          `Please start it first by using POST /api/sessions/${name}/start request`,
      );
    }
    return session as WhatsappSession;
  }

  async getSessions(all: boolean): Promise<SessionInfo[]> {
    const sessions: SessionInfo[] = [];
    
    for (const [name, session] of this.sessions.entries()) {
      if (session === SessionStatus.REMOVED) {
        if (all) {
          // Sessão removida, não incluir
        }
      } else if (session === SessionStatus.STOPPED) {
        if (all) {
          const config = this.sessionConfigs.get(name);
          sessions.push({
            name,
            status: WAHASessionStatus.STOPPED,
            config: config,
            me: null,
          });
        }
      } else {
        // Sessão ativa
        const whatsappSession = session as WhatsappSession;
        const me = whatsappSession?.getSessionMeInfo();
        const config = this.sessionConfigs.get(name);
        sessions.push({
          name: whatsappSession.name,
          status: whatsappSession.status,
          config: config,
          me: me,
        });
      }
    }
    
    return sessions;
  }

  private async fetchEngineInfo(sessionName: string) {
    const session = this.sessions.get(sessionName);
    // Get engine info
    let engineInfo = {};
    if (session && session !== SessionStatus.REMOVED && session !== SessionStatus.STOPPED) {
      try {
        const whatsappSession = session as WhatsappSession;
        engineInfo = await promiseTimeout(1000, whatsappSession.getEngineInfo());
      } catch (error) {
        this.log.debug(
          { session: sessionName, error: `${error}` },
          'Can not get engine info',
        );
      }
    }
    const whatsappSession = session as WhatsappSession;
    const engine = {
      engine: whatsappSession?.engine,
      ...engineInfo,
    };
    return engine;
  }

  async getSessionInfo(name: string): Promise<SessionDetailedInfo | null> {
    const sessions = await this.getSessions(true);
    const session = sessions.find(s => s.name === name);
    if (!session) {
      return null;
    }
    
    const engine = await this.fetchEngineInfo(name);
    return { ...session, engine: engine };
  }

  protected stopEvents() {
    complete(this.events2);
  }

  async onModuleInit() {
    await this.init();
  }

  async init() {
    await this.store.init();
    const knex = this.store.getWAHADatabase();
    await this.appsService.migrate(knex);
  }
}
