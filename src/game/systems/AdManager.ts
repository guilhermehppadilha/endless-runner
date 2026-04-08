import { EventBus, GameEvents } from '../events/EventBus';
import { PokiService } from './PokiService';
// Nota: Em produção, instale: npm install @capacitor-community/admob
// import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

export enum AdPlatform { POKI = 'POKI', PLAY_STORE = 'PLAY_STORE', NONE = 'NONE' }

export class AdManager {
  private static platform: AdPlatform = AdPlatform.NONE;
  private static _isRewardedReady: boolean = false;

  public static async init(): Promise<void> {
    if (window.location.hostname.includes('poki')) {
      this.platform = AdPlatform.POKI;
      await PokiService.init();
      this.setRewardedReady(true);
    } else {
      this.platform = AdPlatform.PLAY_STORE;
      // Inicialização AdMob (Capacitor)
      // await AdMob.initialize();
      this.setRewardedReady(true); // Simulação
      this.showBanner();
    }
  }

  public static async showBanner() {
    if (this.platform === AdPlatform.PLAY_STORE) {
      console.log("Exibindo Banner AdMob no rodapé");
      /* Exemplo de implementação real:
      await AdMob.showBanner({
          adId: 'YOUR_ANDROID_BANNER_ID',
          position: BannerAdPosition.BOTTOM_CENTER,
          size: BannerAdSize.BANNER
      }); */
    }
  }

  public static async showCommercial(): Promise<void> {
    if (this.platform === AdPlatform.POKI) {
      await PokiService.commercialBreak();
    } else {
      console.log("Exibindo Interstitial AdMob");
      // await AdMob.showInterstitial({ adId: 'YOUR_INTERSTITIAL_ID' });
    }
  }

  public static async showRewarded(): Promise<boolean> {
    if (this.platform === AdPlatform.POKI) {
      return await PokiService.rewardedBreak();
    } else {
      console.log("Exibindo Rewarded AdMob");
      // const reward = await AdMob.showRewardedAd({ adId: 'YOUR_REWARDED_ID' });
      // return !!reward;
      return true;
    }
  }

  private static setRewardedReady(ready: boolean) {
    this._isRewardedReady = ready;
    EventBus.emit(GameEvents.AD_AVAILABILITY_CHANGED, ready);
  }

  public static get isRewardedReady(): boolean { return this._isRewardedReady; }
}