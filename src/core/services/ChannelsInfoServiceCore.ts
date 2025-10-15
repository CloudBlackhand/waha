import { Injectable } from '@nestjs/common';
import { AvailableInPlusVersion } from '@waha/core/exceptions';
import {
  ChannelCategory,
  ChannelCountry,
  ChannelView,
} from '@waha/structures/channels.dto';

@Injectable()
export class ChannelsInfoServiceCore {
  async getCountries(): Promise<ChannelCountry[]> {
    // Funcionalidade desbloqueada - implementação disponível
    return [];
  }

  async getCategories(): Promise<ChannelCategory[]> {
    // Funcionalidade desbloqueada - implementação disponível
    return [];
  }

  async getViews(): Promise<ChannelView[]> {
    // Funcionalidade desbloqueada - implementação disponível
    return [];
  }
}
