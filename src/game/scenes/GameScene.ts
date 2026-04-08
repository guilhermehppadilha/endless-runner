import { Scene } from 'phaser';
import { EventBus, GameEvents, IScorePayload } from '@/game/events/EventBus';
import { PokiService } from '@/game/systems/PokiService';
import { Climber } from '../objects/Climber';
import { RockSpawner } from '../objects/RockSpawner';

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

        // Fundo com Parallax
        this.mountainBg = this.add.tileSprite(width / 2, height / 2, width, height, 'mountain');

        // Instancia os elementos do jogo
        this.climber = new Climber(this, height - 150);
        this.spawner = new RockSpawner(this, this.gameSpeed);

        // Colisão principal (Alpinista vs Pedras)
        this.physics.add.overlap(this.climber, this.spawner.getGroup(), this.handleGameOver, undefined, this);

        this.setupInputs();

        // Escuta comandos da UI (React -> Phaser)
        EventBus.on(GameEvents.REQUEST_RESTART, this.restartGame, this);
        EventBus.on(GameEvents.REQUEST_REVIVE, this.reviveGame, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off(GameEvents.REQUEST_RESTART, this.restartGame, this);
            EventBus.off(GameEvents.REQUEST_REVIVE, this.reviveGame, this);
        });

        // Notifica o Poki e a UI que a cena está pronta
        PokiService.gameplayStart();
        EventBus.emit(GameEvents.SCENE_READY, this);
    }

    private setupInputs() {
        const cursors = this.input.keyboard?.createCursorKeys();
        cursors?.left.on('down', () => this.climber.moveLeft());
        cursors?.right.on('down', () => this.climber.moveRight());
        this.input.keyboard?.on('keydown-A', () => this.climber.moveLeft());
        this.input.keyboard?.on('keydown-D', () => this.climber.moveRight());

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.pointerDownX = pointer.x;
            this.pointerDownY = pointer.y;
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isGameOver) return;
            const deltaX = pointer.x - this.pointerDownX;
            const deltaY = pointer.y - this.pointerDownY;
            const swipeThreshold = 40;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) this.climber.moveLeft();
                else this.climber.moveRight();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        this.mountainBg.tilePositionY -= (this.gameSpeed * delta) / 1000;
        this.spawner.update(time);

        // Atualização de Score enviada para o React
        this.score += delta * 0.015;
        const scorePayload: IScorePayload = { score: Math.floor(this.score) };
        EventBus.emit(GameEvents.SCORE_UPDATED, scorePayload);

        // Progressão de dificuldade
        this.gameSpeed += delta * 0.005;
        this.spawner.setSpeed(this.gameSpeed);
    }

    private handleGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.physics.pause();
        this.climber.die();

        PokiService.gameplayStop();

        // Abre o menu no React
        EventBus.emit(GameEvents.GAME_OVER, {
            score: Math.floor(this.score),
            canRevive: !this.hasUsedRevive
        });
    }

    private async restartGame() {
        await PokiService.commercialBreak();
        this.scene.restart();
    }

    private async reviveGame() {
        const success = await PokiService.rewardedBreak();

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
        } else {
            // Caso o vídeo falhe, mantém a tela de Game Over
            EventBus.emit(GameEvents.GAME_OVER, {
                score: Math.floor(this.score),
                canRevive: false
            });
        }
    }

    private generateTextures() {
        // Marcadores de Hitbox Simplificados
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