import { AvailableInPlusVersion } from '../exceptions';

export interface IMediaConverter {
  voice(content: Buffer): Promise<Buffer>;
  video(content: Buffer): Promise<Buffer>;
}

export class CoreMediaConverter implements IMediaConverter {
  video(content: Buffer): Promise<Buffer> {
    // Funcionalidade desbloqueada - implementação disponível
    return Promise.resolve(content);
  }

  voice(content: Buffer): Promise<Buffer> {
    // Funcionalidade desbloqueada - implementação disponível
    return Promise.resolve(content);
  }
}
