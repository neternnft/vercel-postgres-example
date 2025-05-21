import { GAME_CONFIG } from '../config/gameConfig';

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'shield' | 'doubleJump' | 'slowMotion';
  duration: number;
  active: boolean;
  collected: boolean;
  timeLeft?: number;
}

export class PowerUpSystem {
  private powerUps: PowerUp[] = [];
  private ctx: CanvasRenderingContext2D;
  private activePowerUps: Map<string, PowerUp> = new Map();
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  public spawnPowerUp(playerScore: number): void {
    // Spawn power-ups based on score milestones
    if (playerScore > 0 && playerScore % 5 === 0 && this.powerUps.length < 2) {
      const types: Array<'shield' | 'doubleJump' | 'slowMotion'> = ['shield', 'doubleJump', 'slowMotion'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      this.powerUps.push({
        x: this.canvasWidth,
        y: this.canvasHeight - GAME_CONFIG.GROUND_HEIGHT - 100 - Math.random() * 100,
        width: 30,
        height: 30,
        type,
        duration: type === 'shield' ? 10000 : type === 'doubleJump' ? 15000 : 8000,
        active: false,
        collected: false
      });
    }
  }

  public update(deltaTime: number, gameSpeed: number): void {
    // Update power-up positions
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.x -= gameSpeed * (deltaTime / 16);

      if (powerUp.x + powerUp.width < 0) {
        this.powerUps.splice(i, 1);
        continue;
      }

      this.drawPowerUp(powerUp);
    }

    // Update active power-ups
    this.activePowerUps.forEach((powerUp, type) => {
      if (powerUp.timeLeft !== undefined) {
        powerUp.timeLeft -= deltaTime;
        if (powerUp.timeLeft <= 0) {
          this.activePowerUps.delete(type);
        }
      }
    });
  }

  public checkCollision(playerX: number, playerY: number, playerWidth: number, playerHeight: number): PowerUp | null {
    for (const powerUp of this.powerUps) {
      if (!powerUp.collected &&
          playerX < powerUp.x + powerUp.width &&
          playerX + playerWidth > powerUp.x &&
          playerY < powerUp.y + powerUp.height &&
          playerY + playerHeight > powerUp.y) {
        powerUp.collected = true;
        powerUp.active = true;
        powerUp.timeLeft = powerUp.duration;
        this.activePowerUps.set(powerUp.type, powerUp);
        return powerUp;
      }
    }
    return null;
  }

  private drawPowerUp(powerUp: PowerUp): void {
    if (powerUp.collected) return;

    const gradient = this.ctx.createRadialGradient(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      0,
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      powerUp.width / 2
    );

    // Set colors based on power-up type
    switch (powerUp.type) {
      case 'shield':
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#2563eb');
        break;
      case 'doubleJump':
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#16a34a');
        break;
      case 'slowMotion':
        gradient.addColorStop(0, '#f472b6');
        gradient.addColorStop(1, '#db2777');
        break;
    }

    // Draw power-up
    this.ctx.beginPath();
    this.ctx.fillStyle = gradient;
    this.ctx.arc(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      powerUp.width / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw icon
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const icon = powerUp.type === 'shield' ? '🛡️' :
                powerUp.type === 'doubleJump' ? '⚡' : '⏰';
    this.ctx.fillText(
      icon,
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2
    );
  }

  public drawActivePowerUps(): void {
    let y = 60;
    this.activePowerUps.forEach((powerUp) => {
      if (powerUp.timeLeft === undefined) return;
      
      const timeLeft = Math.max(0, Math.ceil(powerUp.timeLeft / 1000));
      const icon = powerUp.type === 'shield' ? '🛡️' :
                  powerUp.type === 'doubleJump' ? '⚡' : '⏰';
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${icon} ${timeLeft}s`, 10, y);
      y += 25;
    });
  }

  public hasPowerUp(type: string): boolean {
    return this.activePowerUps.has(type);
  }

  public clear(): void {
    this.powerUps = [];
    this.activePowerUps.clear();
  }
} 