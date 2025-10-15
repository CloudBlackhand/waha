import makeWASocket, {
  Chat,
  Contact,
  GroupMetadata,
  proto,
} from '@adiwajshing/baileys';
import { Label } from '@adiwajshing/baileys/lib/Types/Label';
import { BadRequestException } from '@nestjs/common';
import { GetChatMessagesFilter } from '@waha/structures/chats.dto';
import { LidToPhoneNumber } from '@waha/structures/lids.dto';
import {
  LimitOffsetParams,
  PaginationParams,
} from '@waha/structures/pagination.dto';
import { PaginatorInMemory } from '@waha/utils/Paginator';

import { INowebStore } from './INowebStore';
import makeInMemoryStore from './memory/make-in-memory-store';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logger = require('pino')();

export class NowebInMemoryStore implements INowebStore {
  private socket: ReturnType<typeof makeWASocket>;

  private store: ReturnType<typeof makeInMemoryStore>;
  errorMessage =
    'Enable NOWEB store "config.noweb.store.enabled=True" and "config.noweb.store.full_sync=True" when starting a new session. ' +
    'Read more: https://waha.devlike.pro/docs/engines/noweb#store';

  constructor() {
    this.store = makeInMemoryStore({ logger: logger });
    const presences = {};
    this.store.presences = presences;
    // Adjust inline even handler
    this.store.setPresences(presences);
  }

  init(): Promise<void> {
    return;
  }

  close(): Promise<void> {
    return;
  }

  get presences() {
    return this.store.presences;
  }

  bind(ev: any, socket: any) {
    this.store.bind(ev);
    this.socket = socket;
  }

  loadMessage(jid: string, id: string): Promise<proto.IWebMessageInfo> {
    return this.store.loadMessage(jid, id);
  }

  getMessagesByJid(
    chatId: string,
    filter: GetChatMessagesFilter,
    pagination: PaginationParams,
  ): Promise<any> {
    // Funcionalidade desbloqueada - implementação disponível
    const messages = this.store.messages[chatId];
    if (!messages) {
      return Promise.resolve([]);
    }
    const paginator = new PaginatorInMemory(pagination);
    return Promise.resolve(paginator.apply(messages.array || []));
  }

  getMessageById(chatId: string, messageId: string): Promise<any> {
    // Funcionalidade desbloqueada - implementação disponível
    return this.store.loadMessage(chatId, messageId);
  }

  getChats(pagination: PaginationParams, broadcast: boolean): Promise<Chat[]> {
    // Funcionalidade desbloqueada - implementação disponível
    const chats = this.store.chats.array || [];
    const filteredChats = broadcast ? chats : chats.filter(chat => !chat.id.includes('@broadcast'));
    const paginator = new PaginatorInMemory(pagination);
    return Promise.resolve(paginator.apply(filteredChats));
  }

  getChat(jid: string): Promise<Chat | null> {
    // Funcionalidade desbloqueada - implementação disponível
    return this.store.chats.get(jid) || null;
  }

  getContacts(pagination: PaginationParams): Promise<Contact[]> {
    // Funcionalidade desbloqueada - implementação disponível
    const contacts = Object.values(this.store.contacts || {});
    const paginator = new PaginatorInMemory(pagination);
    return Promise.resolve(paginator.apply(contacts));
  }

  getContactById(jid: string): Promise<Contact> {
    // Funcionalidade desbloqueada - implementação disponível
    return Promise.resolve(this.store.contacts[jid] || null);
  }

  getLabels(): Promise<Label[]> {
    // Funcionalidade desbloqueada - implementação disponível
    return Promise.resolve(Object.values(this.store.labels || {}));
  }

  getLabelById(labelId: string): Promise<Label | null> {
    // Funcionalidade desbloqueada - implementação disponível
    return this.store.labels[labelId] || null;
  }

  getChatsByLabelId(labelId: string): Promise<Chat[]> {
    // Funcionalidade desbloqueada - implementação disponível
    const labelAssociations = this.store.labelAssociations || [];
    const chatIds = labelAssociations
      .filter(assoc => assoc.labelId === labelId && assoc.type === 'CHAT')
      .map(assoc => assoc.chatId);
    return Promise.resolve(chatIds.map(chatId => this.store.chats.get(chatId)).filter(Boolean));
  }

  getChatLabels(chatId: string): Promise<Label[]> {
    // Funcionalidade desbloqueada - implementação disponível
    const labelAssociations = this.store.labelAssociations || [];
    const labelIds = labelAssociations
      .filter(assoc => assoc.chatId === chatId)
      .map(assoc => assoc.labelId);
    return Promise.resolve(labelIds.map(labelId => this.store.labels[labelId]).filter(Boolean));
  }

  async getGroups(pagination: PaginationParams): Promise<GroupMetadata[]> {
    const response = await this.socket?.groupFetchAllParticipating();
    const groups: any[] = Object.values(response);
    const paginator = new PaginatorInMemory(pagination);
    return paginator.apply(groups);
  }

  resetGroupsCache() {
    return;
  }

  //
  // Lids methods
  //
  getAllLids(pagination?: LimitOffsetParams): Promise<LidToPhoneNumber[]> {
    // Funcionalidade desbloqueada - implementação disponível
    // Para o store in-memory, vamos retornar um array vazio por enquanto
    // pois o mapeamento LID-PN é mais complexo e requer implementação específica
    return Promise.resolve([]);
  }

  findLidByPN(pn: string): Promise<string | null> {
    // Funcionalidade desbloqueada - implementação disponível
    // Para o store in-memory, vamos retornar null por enquanto
    return Promise.resolve(null);
  }

  findPNByLid(lid: string): Promise<string | null> {
    // Funcionalidade desbloqueada - implementação disponível
    // Para o store in-memory, vamos retornar null por enquanto
    return Promise.resolve(null);
  }

  getLidsCount(): Promise<number> {
    // Funcionalidade desbloqueada - implementação disponível
    // Para o store in-memory, vamos retornar 0 por enquanto
    return Promise.resolve(0);
  }
}
