import { Scene } from 'phaser';

export class RockSpawner {
  private scene: Scene;
  private rocks: Phaser.Physics.Arcade.Group;
  private nextSpawnTime: number = 0;
  private fallSpeed: number;
  private lanePositions: number[];

  constructor(scene: Scene, initialSpeed: number) {
    this.scene = scene;
    this.fallSpeed = initialSpeed;

    const width = scene.scale.width;
    this.lanePositions = [width * 0.2, width * 0.5, width * 0.8];

    this.rocks = this.scene.physics.add.group({
      allowGravity: false
    });
  }

  getGroup() {
    return this.rocks;
  }

  setSpeed(newSpeed: number) {
    this.fallSpeed = newSpeed;
    this.rocks.getChildren().forEach((child) => {
      const body = child.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(this.fallSpeed);
    });
  }

  update(time: number) {
    if (time > this.nextSpawnTime) {
      this.spawnRock();

      // Quanto mais rápido as pedras caem, menor o intervalo de criação
      const delay = Phaser.Math.Between(500, 1200);
      const speedFactor = 300 / this.fallSpeed;
      this.nextSpawnTime = time + (delay * Math.max(0.4, speedFactor));
    }

    // Destrói pedras que saíram pela parte inferior da tela
    this.rocks.getChildren().forEach((child) => {
      const rock = child as Phaser.Physics.Arcade.Sprite;
      if (rock.y > this.scene.scale.height + 60) {
        rock.destroy();
      }
    });
  }

  private spawnRock() {
    const lane = Phaser.Math.Between(0, 2); // Sorteia uma das 3 faixas
    const x = this.lanePositions[lane];
    const y = -60; // Começa fora da tela (acima)

    const rock = this.rocks.create(x, y, 'rock') as Phaser.Physics.Arcade.Sprite;
    rock.setOrigin(0.5, 0.5);

    // Variação de tamanho para dinamismo
    const scale = Phaser.Math.FloatBetween(0.8, 1.3);
    rock.setScale(scale);

    const body = rock.body as Phaser.Physics.Arcade.Body;
    body.setCircle(rock.width * 0.4); // Hitbox circular para colisões perfeitas
    body.setVelocityY(this.fallSpeed);

    rock.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
    body.setAngularVelocity(Phaser.Math.Between(-150, 150)); // Efeito visual de rolagem
  }
}