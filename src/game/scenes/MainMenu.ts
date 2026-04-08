import { Scene } from 'phaser';
import { EventBus, GameEvents } from '../events/EventBus';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Notifica o React que o Menu está pronto para ser exibido
        EventBus.emit(GameEvents.SCENE_READY, this);

        // IMPORTANTE: Só troca de cena quando o botão "JOGAR" é clicado no React
        EventBus.on(GameEvents.START_GAME, () => {
            this.scene.start('GameScene');
        });

        // Limpa o evento ao sair para evitar execuções duplicadas no futuro
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off(GameEvents.START_GAME);
        });

        // Coloque um fundo estático aqui para o menu
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'mountain').setAlpha(0.5);
    }
}