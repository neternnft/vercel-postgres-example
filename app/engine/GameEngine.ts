import { GAME_CONFIG } from '../config/gameConfig';
import { ParticleSystem } from './ParticleSystem';
import { SoundManager } from './SoundManager';
import { PowerUpSystem, PowerUp } from './PowerUpSystem';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player extends GameObject {
  jumping: boolean;
  yVelocity: number;
  landingGracePeriod: number;
  jumpCount: number;
  rotation: number;
}

interface Obstacle extends GameObject {
  type: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private obstacles: Obstacle[];
  private frameCount: number;
  private score: number;
  private speed: number;
  private baseSpeed: number;
  private animationFrameId?: number;
  private onScore: () => void;
  private onGameOver: () => void;
  private particles: ParticleSystem;
  private sounds: SoundManager;
  private powerUps: PowerUpSystem;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private _lastJumpTime?: number;

  constructor(
    canvas: HTMLCanvasElement,
    onScore: () => void,
    onGameOver: () => void
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.onScore = onScore;
    this.onGameOver = onGameOver;
    this.frameCount = 0;
    this.score = 0;
    this.obstacles = [];
    this.particles = new ParticleSystem(ctx);
    this.sounds = new SoundManager();
    this.powerUps = new PowerUpSystem(ctx, canvas.width, canvas.height);

    // Initialize speed based on screen size
    this.baseSpeed = canvas.width / 160;
    this.speed = window.innerWidth <= 768
      ? this.baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER
      : this.baseSpeed * GAME_CONFIG.DESKTOP_SPEED_MULTIPLIER;

    // Initialize player
    this.player = {
      x: GAME_CONFIG.PLAYER.INITIAL_X,
      y: canvas.height - GAME_CONFIG.GROUND_HEIGHT - GAME_CONFIG.PLAYER.HEIGHT,
      width: GAME_CONFIG.PLAYER.WIDTH,
      height: GAME_CONFIG.PLAYER.HEIGHT,
      jumping: false,
      yVelocity: 0,
      landingGracePeriod: 0,
      jumpCount: 0,
      rotation: 0
    };

    // Start background music
    this.sounds.play('background');
  }

  private drawBackground(): void {
    // Create a modern gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a1a');  // Dark top
    gradient.addColorStop(0.5, '#2d2d2d'); // Slightly lighter middle
    gradient.addColorStop(1, '#1a1a1a');   // Dark bottom

    // Fill background
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add subtle pattern
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const patternSize = 20;
    for (let x = 0; x < this.canvas.width; x += patternSize) {
      for (let y = 0; y < this.canvas.height; y += patternSize) {
        if ((x + y) % (patternSize * 2) === 0) {
          this.ctx.fillRect(x, y, patternSize, patternSize);
        }
      }
    }

    // Add a subtle glow at the top
    const glowGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.4);
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = glowGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.4);

    // Draw ground
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.fillRect(0, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, this.canvas.width, GAME_CONFIG.GROUND_HEIGHT);

    // Add subtle ground texture
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.fillRect(x, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 20, GAME_CONFIG.GROUND_HEIGHT);
    }
  }

  private drawPlayer(): void {
    this.ctx.save();
    
    // Translate to player center for rotation
    this.ctx.translate(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );
    
    // Rotate based on vertical velocity
    const targetRotation = this.player.yVelocity * 0.05;
    this.player.rotation += (targetRotation - this.player.rotation) * 0.1;
    this.ctx.rotate(this.player.rotation);

    // Draw player
    this.frameCount++;
    const colorIndex = Math.floor(this.frameCount / 5) % GAME_CONFIG.COLORS.DISCO.length;
    this.ctx.fillStyle = GAME_CONFIG.COLORS.DISCO[colorIndex];
    
    // Draw with rounded corners
    this.ctx.beginPath();
    const radius = 5;
    this.ctx.moveTo(-this.player.width/2 + radius, -this.player.height/2);
    this.ctx.lineTo(this.player.width/2 - radius, -this.player.height/2);
    this.ctx.arcTo(this.player.width/2, -this.player.height/2, this.player.width/2, -this.player.height/2 + radius, radius);
    this.ctx.lineTo(this.player.width/2, this.player.height/2 - radius);
    this.ctx.arcTo(this.player.width/2, this.player.height/2, this.player.width/2 - radius, this.player.height/2, radius);
    this.ctx.lineTo(-this.player.width/2 + radius, this.player.height/2);
    this.ctx.arcTo(-this.player.width/2, this.player.height/2, -this.player.width/2, this.player.height/2 - radius, radius);
    this.ctx.lineTo(-this.player.width/2, -this.player.height/2 + radius);
    this.ctx.arcTo(-this.player.width/2, -this.player.height/2, -this.player.width/2 + radius, -this.player.height/2, radius);
    this.ctx.fill();

    // Draw shield effect if active
    if (this.powerUps.hasPowerUp('shield')) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.player.width * 0.7, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#60a5fa';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Draw player shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(
      this.player.x + this.player.width / 2,
      this.canvas.height - GAME_CONFIG.GROUND_HEIGHT + 5,
      this.player.width / 2,
      5,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  private drawObstacle(obstacle: Obstacle): void {
    const obstacleY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - obstacle.height;
    
    // Draw obstacle
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.fillRect(obstacle.x, obstacleY, obstacle.width, obstacle.height);

    // Draw obstacle shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(
      obstacle.x + obstacle.width / 2,
      this.canvas.height - GAME_CONFIG.GROUND_HEIGHT + 5,
      obstacle.width / 2,
      5,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  private updatePlayerJump(): void {
    if (this.player.jumping) {
      const gravity = this.powerUps.hasPowerUp('slowMotion') 
        ? GAME_CONFIG.PLAYER.GRAVITY * 0.5 
        : GAME_CONFIG.PLAYER.GRAVITY;
      
      this.player.yVelocity += gravity * (this.deltaTime / 16);
      this.player.y += this.player.yVelocity;

      const groundY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - this.player.height;
      if (this.player.y > groundY) {
        this.player.y = groundY;
        this.player.jumping = false;
        this.player.yVelocity = 0;
        this.player.landingGracePeriod = 10;
        this.player.jumpCount = 0;
        
        // Create landing particles
        this.particles.createJumpParticles(
          this.player.x,
          this.player.y + this.player.height
        );
      }
    } else if (this.player.landingGracePeriod > 0) {
      this.player.landingGracePeriod--;
    }

    // Ensure player stays within canvas bounds
    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.yVelocity = 0;
    }
  }

  private checkCollisions(): boolean {
    // Check power-up collisions
    const powerUp = this.powerUps.checkCollision(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    if (powerUp) {
      this.sounds.play('powerup');
      this.particles.createScoreParticles(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2
      );
    }

    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      const obstacleY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - obstacle.height;
      
      // Simple rectangle collision detection
      const collision = 
        this.player.x < obstacle.x + obstacle.width &&
        this.player.x + this.player.width > obstacle.x &&
        this.player.y + this.player.height > obstacleY &&
        this.player.y < obstacleY + obstacle.height;

      if (collision && !this.powerUps.hasPowerUp('shield')) {
        return true;
      }
    }
    return false;
  }

  private updateObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed * (this.deltaTime / 16);

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 1;
        this.onScore();
        
        // Create score particles
        this.particles.createScoreParticles(10, 30);
        this.sounds.play('score');
      }
    }

    const minObstacleDistance = this.canvas.width / 2;
    if (
      this.obstacles.length === 0 ||
      (this.canvas.width - this.obstacles[this.obstacles.length - 1].x > minObstacleDistance &&
        Math.random() < GAME_CONFIG.OBSTACLE.SPAWN_CHANCE)
    ) {
      this.obstacles.push({
        x: this.canvas.width,
        y: this.canvas.height - GAME_CONFIG.GROUND_HEIGHT,
        width: GAME_CONFIG.OBSTACLE.MIN_WIDTH + Math.random() * GAME_CONFIG.OBSTACLE.MAX_WIDTH_ADDITION,
        height: GAME_CONFIG.OBSTACLE.MIN_HEIGHT + Math.random() * GAME_CONFIG.OBSTACLE.MAX_HEIGHT_ADDITION,
        type: 'cactus',
      });
    }
  }

  public update(currentTime: number = 0): void {
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game speed based on score
    const speedIncrease = Math.min(this.score * 0.1, 5);
    this.speed = (this.powerUps.hasPowerUp('slowMotion') ? 0.5 : 1) * 
                 (this.baseSpeed + speedIncrease);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background with parallax
    this.drawBackground();

    // Update and draw power-ups
    this.powerUps.update(this.deltaTime, this.speed);
    this.powerUps.drawActivePowerUps();

    // Spawn power-ups based on score
    this.powerUps.spawnPowerUp(this.score);

    this.drawPlayer();
    this.updatePlayerJump();
    this.updateObstacles();

    for (const obstacle of this.obstacles) {
      this.drawObstacle(obstacle);
    }

    // Update and draw particles
    this.particles.update();

    if (this.checkCollisions()) {
      // Create collision particles
      this.particles.createCollisionParticles(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2
      );
      this.sounds.play('collision');
      this.sounds.stop('background');
      this.stop();
      this.onGameOver();
      return;
    }

    // Draw score with shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.shadowBlur = 0;

    this.animationFrameId = requestAnimationFrame((time) => this.update(time));
  }

  public jump(): void {
    const maxJumps = this.powerUps.hasPowerUp('doubleJump') ? 3 : 2;
    
    if (this.player.jumpCount < maxJumps) {
      // Add a small delay between jumps to prevent super-fast double jumps
      const now = performance.now();
      if (!this._lastJumpTime || now - this._lastJumpTime > 100) {
        this.player.jumping = true;
        this.player.yVelocity = GAME_CONFIG.PLAYER.JUMP_VELOCITY;
        this.player.jumpCount++;
        this._lastJumpTime = now;
        
        // Create jump particles
        this.particles.createJumpParticles(
          this.player.x,
          this.player.y + this.player.height
        );
        this.sounds.play('jump');
      }
    }
  }

  public toggleMute(): boolean {
    return this.sounds.toggleMute();
  }

  public start(): void {
    this.lastTime = performance.now();
    this.powerUps.clear();
    this.update();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public resize(): void {
    this.baseSpeed = this.canvas.width / 160;
    this.speed = window.innerWidth <= 768
      ? this.baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER
      : this.baseSpeed * GAME_CONFIG.DESKTOP_SPEED_MULTIPLIER;
  }
} 