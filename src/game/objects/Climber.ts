import { Scene } from 'phaser';

export class Climber extends Phaser.Physics.Arcade.Sprite {
  public currentLane: number = 1; // 0 = Esquerda, 1 = Centro, 2 = Direita
  private lanePositions: number[];
  private isMoving: boolean = false;
  public isDead: boolean = false;

  constructor(scene: Scene, y: number) {
    super(scene, 0, y, 'climber');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Calcula dinamicamente o centro das 3 faixas na tela
    const width = scene.scale.width;
    this.lanePositions = [width * 0.2, width * 0.5, width * 0.8];

    // Posição inicial no centro
    this.x = this.lanePositions[this.currentLane];
    this.setOrigin(0.5, 0.5);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 50); // Hitbox levemente menor que o sprite para ser justo
    body.setImmovable(true); // Impede que o personagem seja empurrado pela física
  }

  moveLeft() {
    if (this.currentLane > 0 && !this.isMoving && !this.isDead) {
      this.currentLane--;
      this.animateMove();
    }
  }

  moveRight() {
    if (this.currentLane < 2 && !this.isMoving && !this.isDead) {
      this.currentLane++;
      this.animateMove();
    }
  }

  private animateMove() {
    this.isMoving = true;
    this.scene.tweens.add({
      targets: this,
      x: this.lanePositions[this.currentLane],
      duration: 120, // Transição extremamente rápida e responsiva
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.isMoving = false;
      }
    });
  }

  die() {
    this.isDead = true;
    this.setTint(0xff0000); // Fica vermelho

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(600); // Efeito de queda para o fundo da tela
    body.setAngularVelocity(300); // Gira ao cair
  }
}