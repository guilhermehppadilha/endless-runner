import { EventBus, GameEvents } from '@/game/events/EventBus';
import { PokiService } from '@/game/systems/PokiService';

export enum AdPlatform {
  POKI = 'POKI',
  PLAY_STORE = 'PLAY_STORE',
  NONE = 'NONE'
}

export class AdManager {
  private static platform: AdPlatform = AdPlatform.NONE;
  private static _isRewardedReady: boolean = false;

  public static async init(): Promise<void> {
    // Lógica de detecção de plataforma
    if (window.location.hostname.includes('poki')) {
      this.platform = AdPlatform.POKI;
      await PokiService.init();
    } else {
      // Futura implementação para Play Store/AdMob
      this.platform = AdPlatform.PLAY_STORE;
    }

    // Simulação de verificação de disponibilidade
    this.checkAvailability();
  }

  private static checkAvailability() {
    // No Poki, se o SDK inicializou, geralmente o anúncio está disponível
    // Em outras plataformas, aqui você consultaria o carregamento do AdMob
    const ready = this.platform === AdPlatform.POKI ? true : false; // Ajustar conforme provedor
    this.setRewardedReady(ready);
  }

  private static setRewardedReady(ready: boolean) {
    if (this._isRewardedReady !== ready) {
      this._isRewardedReady = ready;
      EventBus.emit(GameEvents.AD_AVAILABILITY_CHANGED, ready);
    }
  }

  public static async showCommercial(): Promise<void> {
    if (this.platform === AdPlatform.POKI) {
      await PokiService.commercialBreak();
    } else {
      console.log("Log: Exibindo anúncio Play Store");
      // Lógica do AdMob aqui
    }
  }

  public static async showRewarded(): Promise<boolean> {
    if (this.platform === AdPlatform.POKI) {
      const success = await PokiService.rewardedBreak();
      return success;
    } else {
      console.log("Log: Exibindo recompensado Play Store");
      return true; // Simulação de sucesso
    }
  }

  public static get isRewardedReady(): boolean {
    return this._isRewardedReady;
  }
}