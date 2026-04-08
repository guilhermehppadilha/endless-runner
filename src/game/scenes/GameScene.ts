import { Scene } from 'phaser';
import { EventBus, GameEvents, IScorePayload } from '@/game/events/EventBus';
import { PokiService } from '@/game/systems/PokiService';
import { Climber } from '@/game/objects/Climber';
import { RockSpawner } from '@/game/objects/RockSpawner';
import { AdManager } from '../systems/AdManager';

export class GameScene extends Scene {
    private climber!: Climber;
    private spawner!: RockSpawner;
    private mountainBg!: Phaser.GameObjects.TileSprite;

    private score: number = 0;
    private gameSpeed: number = 300;
    private isGameOver: boolean = false;
    private hasUsedRevive: boolean = false;

    private pointerDownX: number = 0;
    private pointerDownY: number = 0;

    constructor() {
        super('GameScene');
    }

    create() {
        this.isGameOver = false;
        this.hasUsedRevive = false;
        this.score = 0;
        this.gameSpeed = 300;

        this.generateTextures();

        const { width, height } = this.scale;

        // Fundo infinito
        this.mountainBg = this.add.tileSprite(width / 2, height / 2, width, height, 'mountain');

        // Inicialização dos objetos
        this.climber = new Climber(this, height - 150);
        this.spawner = new RockSpawner(this, this.gameSpeed);

        // Configuração de Colisão
        this.physics.add.overlap(
            this.climber,
            this.spawner.getGroup(),
            this.handleGameOver,
            undefined,
            this
        );

        this.setupInputs();

        EventBus.on(GameEvents.REQUEST_RESTART, this.restartGame, this);

        EventBus.on(GameEvents.REQUEST_REVIVE, this.reviveGame, this);

        EventBus.on(GameEvents.PAUSE_GAME, () => {
            this.isGameOver = true;
            this.physics.pause();
        });

        EventBus.on(GameEvents.RESUME_GAME, () => {
            this.isGameOver = false;
            this.physics.resume();
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off(GameEvents.PAUSE_GAME);
            EventBus.off(GameEvents.RESUME_GAME);
            EventBus.off(GameEvents.REQUEST_RESTART, this.restartGame, this);
            EventBus.off(GameEvents.REQUEST_REVIVE, this.reviveGame, this);
        });


        PokiService.gameplayStart();
        EventBus.emit(GameEvents.SCENE_READY, this);
    }

    private setupInputs() {
        // Teclado
        this.input.keyboard?.on('keydown-LEFT', () => this.climber.moveLeft());
        this.input.keyboard?.on('keydown-A', () => this.climber.moveLeft());
        this.input.keyboard?.on('keydown-RIGHT', () => this.climber.moveRight());
        this.input.keyboard?.on('keydown-D', () => this.climber.moveRight());

        // Touch/Swipe
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.pointerDownX = p.x;
            this.pointerDownY = p.y;
        });

        this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (this.isGameOver) return;
            const deltaX = p.x - this.pointerDownX;
            const deltaY = p.y - this.pointerDownY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
                if (deltaX < 0) this.climber.moveLeft();
                else this.climber.moveRight();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        this.mountainBg.tilePositionY -= (this.gameSpeed * delta) / 1000;
        this.spawner.update(time);

        this.score += delta * 0.015;
        EventBus.emit(GameEvents.SCORE_UPDATED, { score: Math.floor(this.score) } as IScorePayload);

        this.gameSpeed += delta * 0.005;
        this.spawner.setSpeed(this.gameSpeed);
    }

    private handleGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.physics.pause();
        this.climber.die();
        PokiService.gameplayStop();

        EventBus.emit(GameEvents.GAME_OVER, {
            score: Math.floor(this.score),
            canRevive: !this.hasUsedRevive && AdManager.isRewardedReady
        });
    }

    private async restartGame() {
        await AdManager.showCommercial();
        this.scene.restart();
    }

    private async reviveGame() {
        const success = await AdManager.showRewarded();
        if (success) {
            this.hasUsedRevive = true;
            this.isGameOver = false;
            this.climber.isDead = false;
            this.climber.clearTint();

            const body = this.climber.body as Phaser.Physics.Arcade.Body;
            body.setVelocityY(0);
            body.setAngularVelocity(0);
            this.climber.rotation = 0;
            this.climber.y = this.scale.height - 150;

            this.spawner.getGroup().clear(true, true);
            this.physics.resume();
            PokiService.gameplayStart();
        }
    }

    private generateTextures() {
        if (!this.textures.exists('climber')) {
            const g = this.add.graphics();
            g.lineStyle(2, 0x00ff00);
            g.strokeRect(1, 1, 28, 48);
            g.generateTexture('climber', 30, 50);
            g.destroy();
        }
        if (!this.textures.exists('rock')) {
            const g = this.add.graphics();
            g.lineStyle(2, 0xff0000);
            g.strokeCircle(20, 20, 19);
            g.generateTexture('rock', 40, 40);
            g.destroy();
        }
        if (!this.textures.exists('mountain')) {
            const g = this.add.graphics();
            g.fillStyle(0x111111);
            g.fillRect(0, 0, 512, 512);
            g.generateTexture('mountain', 512, 512);
            g.destroy();
        }
    }
}