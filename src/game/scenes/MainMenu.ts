import { Scene } from 'phaser';
import { EventBus, GameEvents } from '@/game/events/EventBus';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        EventBus.emit(GameEvents.SCENE_READY, this);

        EventBus.off(GameEvents.START_GAME);

        EventBus.on(GameEvents.START_GAME, () => {
            if (this.scene.key === 'MainMenu') {
                this.scene.start('GameScene');
            }
        });

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5).setOrigin(0);
    }
}