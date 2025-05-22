import { GAME_CONFIG } from '../config/gameConfig';
import { ParticleSystem } from './ParticleSystem';

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
  collectionAnimation?: {
    scale: number;
    alpha: number;
    rotation: number;
  };
}

export class PowerUpSystem {
  private powerUps: PowerUp[] = [];
  private activePowerUps: PowerUp[] = [];
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private particles: ParticleSystem;
  private _lastSpawnTime: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particles = new ParticleSystem(ctx);
  }

  public spawnPowerUp(playerScore: number): void {
    // Don't spawn power-ups before score 5 to give player time to get used to the game
    if (playerScore < 5) return;

    // Random chance to spawn power-ups, with consistent probability
    const spawnChance = 0.01; // 1% chance per update

    // Add minimum spawn time gap to prevent power-ups spawning too close together
    const now = Date.now();
    if (!this._lastSpawnTime) this._lastSpawnTime = now;
    const timeSinceLastSpawn = now - this._lastSpawnTime;
    
    // Increase minimum time between spawns to 5 seconds
    const minSpawnGap = 5000;

    // Force spawn if it's been too long without a power-up (15 seconds)
    const forceSpawnTime = 15000;
    const shouldForceSpawn = timeSinceLastSpawn > forceSpawnTime;
    
    if (this.powerUps.length < 2 && timeSinceLastSpawn > minSpawnGap && 
        (shouldForceSpawn || Math.random() < spawnChance)) {
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
      
      this._lastSpawnTime = now;
    }
  }

  public checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): PowerUp | null {
    for (const powerUp of this.powerUps) {
      if (powerUp.collected) continue;

      const collision =
        playerX < powerUp.x + powerUp.width &&
        playerX + playerWidth > powerUp.x &&
        playerY < powerUp.y + powerUp.height &&
        playerY + playerHeight > powerUp.y;

      if (collision) {
        powerUp.collected = true;
        powerUp.active = true;
        powerUp.timeLeft = powerUp.duration;
        powerUp.collectionAnimation = {
          scale: 1,
          alpha: 1,
          rotation: 0
        };
        
        // Create collection particles
        this.particles.createPowerUpCollectionParticles(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          powerUp.type
        );

        this.activePowerUps.push(powerUp);
        return powerUp;
      }
    }
    return null;
  }

  private drawPowerUp(powerUp: PowerUp): void {
    if (powerUp.collected) {
      if (powerUp.collectionAnimation) {
        // Update collection animation
        powerUp.collectionAnimation.scale += 0.2;
        powerUp.collectionAnimation.alpha -= 0.1;
        powerUp.collectionAnimation.rotation += 0.2;

        if (powerUp.collectionAnimation.alpha <= 0) {
          powerUp.collectionAnimation = undefined;
          return;
        }

        this.ctx.save();
        this.ctx.globalAlpha = powerUp.collectionAnimation.alpha;
        this.ctx.translate(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2
        );
        this.ctx.rotate(powerUp.collectionAnimation.rotation);
        this.ctx.scale(
          powerUp.collectionAnimation.scale,
          powerUp.collectionAnimation.scale
        );

        // Draw expanding ring
        this.ctx.beginPath();
        this.ctx.arc(0, 0, powerUp.width / 2, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.getPowerUpColors(powerUp.type)[0];
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
      }
      return;
    }

    const gradient = this.ctx.createRadialGradient(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      0,
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      powerUp.width / 2
    );

    const colors = this.getPowerUpColors(powerUp.type);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    // Draw power-up with pulsing effect
    const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    
    this.ctx.save();
    this.ctx.translate(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2
    );
    this.ctx.scale(pulseScale, pulseScale);

    // Draw glow effect
    const glowSize = powerUp.width * 0.7;
    const glowGradient = this.ctx.createRadialGradient(
      0, 0, 0,
      0, 0, glowSize
    );
    glowGradient.addColorStop(0, colors[0] + '40');
    glowGradient.addColorStop(1, colors[0] + '00');
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw main power-up
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, powerUp.width / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw icon
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const icon = this.getPowerUpIcon(powerUp.type);
    this.ctx.fillText(icon, 0, 0);

    this.ctx.restore();
  }

  private getPowerUpColors(type: string): [string, string] {
    switch (type) {
      case 'shield':
        return ['#60a5fa', '#2563eb'];
      case 'doubleJump':
        return ['#34d399', '#16a34a'];
      case 'slowMotion':
        return ['#f472b6', '#db2777'];
      default:
        return ['#ffffff', '#999999'];
    }
  }

  private getPowerUpIcon(type: string): string {
    switch (type) {
      case 'shield':
        return '🛡️';
      case 'doubleJump':
        return '⚡';
      case 'slowMotion':
        return '⏰';
      default:
        return '❓';
    }
  }

  public drawActivePowerUps(): void {
    let y = 60;
    this.activePowerUps.forEach((powerUp) => {
      if (powerUp.timeLeft === undefined) return;
      
      const timeLeft = Math.max(0, Math.ceil(powerUp.timeLeft / 1000));
      const icon = this.getPowerUpIcon(powerUp.type);
      const colors = this.getPowerUpColors(powerUp.type);
      
      // Draw background bar
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(10, y - 10, 100, 20);
      
      // Draw progress bar
      const progress = (powerUp.timeLeft / powerUp.duration) * 100;
      const gradient = this.ctx.createLinearGradient(10, 0, 110, 0);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(10, y - 10, progress, 20);
      
      // Draw icon and time
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${icon} ${timeLeft}s`, 15, y + 2);
      
      y += 25;
    });
  }

  public update(deltaTime: number, gameSpeed: number): void {
    // Update active power-ups
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.activePowerUps[i];
      if (powerUp.timeLeft !== undefined) {
        powerUp.timeLeft -= deltaTime;
        if (powerUp.timeLeft <= 0) {
          powerUp.active = false;
          this.activePowerUps.splice(i, 1);
        }
      }
    }

    // Update power-up positions
    for (const powerUp of this.powerUps) {
      if (!powerUp.collected) {
        powerUp.x -= gameSpeed * (deltaTime / 16);
      }
    }

    // Remove off-screen power-ups
    this.powerUps = this.powerUps.filter(
      powerUp => powerUp.x + powerUp.width > 0 || powerUp.active
    );

    // Draw all power-ups
    this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
  }

  public hasPowerUp(type: string): boolean {
    return this.activePowerUps.some(p => p.type === type && p.active);
  }

  public clear(): void {
    this.powerUps = [];
    this.activePowerUps = [];
  }
} 