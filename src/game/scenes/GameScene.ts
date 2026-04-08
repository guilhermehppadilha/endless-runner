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
        // 1. Reset de Estado Inicial
        this.isGameOver = false;
        this.hasUsedRevive = false;
        this.score = 0;
        this.gameSpeed = 300;

        // 2. Setup Visual e Objetos
        this.generateTextures();
        const { width, height } = this.scale;

        this.mountainBg = this.add.tileSprite(width / 2, height / 2, width, height, 'mountain');
        this.climber = new Climber(this, height - 150);
        this.spawner = new RockSpawner(this, this.gameSpeed);

        // 3. Física e Colisões
        this.physics.add.overlap(
            this.climber,
            this.spawner.getGroup(),
            this.handleGameOver,
            undefined,
            this
        );

        // 4. Input e Eventos
        this.setupInputs();
        this.setupEventListeners();

        EventBus.on(GameEvents.PAUSE_GAME, this.handlePause, this);
        EventBus.on(GameEvents.RESUME_GAME, this.handleResume, this);

        // Limpeza ao encerrar a cena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off(GameEvents.PAUSE_GAME, this.handlePause, this);
            EventBus.off(GameEvents.RESUME_GAME, this.handleResume, this);
        });

        PokiService.gameplayStart();
        EventBus.emit(GameEvents.SCENE_READY, this);

        // 5. Ciclo de Vida do Provedor (Poki)
        PokiService.gameplayStart();
        EventBus.emit(GameEvents.SCENE_READY, this);
    }

    private handlePause() {
        this.isGameOver = true; // Trava o método update()
        this.physics.pause();   // Para o motor de física (colisões e gravidade)
    }

    private handleResume() {
        this.isGameOver = false; // Libera o método update()
        this.physics.resume();   // Retoma a física
    }

    private setupEventListeners() {
        // Listeners de UI -> Engine
        EventBus.on(GameEvents.REQUEST_RESTART, this.restartGame, this);
        EventBus.on(GameEvents.REQUEST_REVIVE, this.reviveGame, this);

        EventBus.on(GameEvents.PAUSE_GAME, this.pauseGame, this);
        EventBus.on(GameEvents.RESUME_GAME, this.resumeGame, this);

        EventBus.on(GameEvents.QUIT_TO_MENU, this.quitToMenu, this);

        // LIMPEZA CRÍTICA: Remove todos os listeners quando a cena é destruída/reiniciada
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off(GameEvents.REQUEST_RESTART, this.restartGame, this);
            EventBus.off(GameEvents.REQUEST_REVIVE, this.reviveGame, this);
            EventBus.off(GameEvents.PAUSE_GAME, this.pauseGame, this);
            EventBus.off(GameEvents.RESUME_GAME, this.resumeGame, this);
            EventBus.off(GameEvents.QUIT_TO_MENU, this.quitToMenu, this);
        });
    }

    private setupInputs() {
        const keyboard = this.input.keyboard;
        if (keyboard) {
            keyboard.on('keydown-LEFT', () => this.climber.moveLeft());
            keyboard.on('keydown-A', () => this.climber.moveLeft());
            keyboard.on('keydown-RIGHT', () => this.climber.moveRight());
            keyboard.on('keydown-D', () => this.climber.moveRight());
        }

        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.pointerDownX = p.x;
            this.pointerDownY = p.y;
        });

        this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
            if (this.isGameOver) return;
            const deltaX = p.x - this.pointerDownX;
            const deltaY = p.y - this.pointerDownY;

            // Filtro de Swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
                if (deltaX < 0) this.climber.moveLeft();
                else this.climber.moveRight();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.isGameOver) return;

        // Movimento do fundo e obstáculos
        this.mountainBg.tilePositionY -= (this.gameSpeed * delta) / 1000;
        this.spawner.update(time);

        // Progressão de Score
        this.score += delta * 0.015;
        EventBus.emit(GameEvents.SCORE_UPDATED, { score: Math.floor(this.score) } as IScorePayload);

        // Dificuldade progressiva
        this.gameSpeed += delta * 0.005;
        this.spawner.setSpeed(this.gameSpeed);
    }

    // --- Handlers de Estado ---

    private pauseGame() {
        this.isGameOver = true;
        this.physics.pause();
    }

    private resumeGame() {
        this.isGameOver = false;
        this.physics.resume();
    }

    private quitToMenu() {
        this.scene.start('MainMenu');
    }

    private handleGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.physics.pause();
        this.climber.die();
        PokiService.gameplayStop();

        EventBus.emit(GameEvents.GAME_OVER, {
            score: Math.floor(this.score),
            canRevive: !this.hasUsedRevive
        });
    }

    // --- Handlers Assíncronos (Anúncios) ---

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

            // Reset físico do personagem para posição de segurança
            const body = this.climber.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            body.setAngularVelocity(0);
            this.climber.rotation = 0;
            this.climber.y = this.scale.height - 150;

            // Limpa obstáculos atuais para evitar "spawn kill"
            this.spawner.getGroup().clear(true, true);
            this.physics.resume();
            PokiService.gameplayStart();
        }
    }

    private generateTextures() {
        // Geração de placeholders visuais
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