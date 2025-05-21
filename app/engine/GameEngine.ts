import { GAME_CONFIG } from '../config/gameConfig';
import { ParticleSystem } from './ParticleSystem';
import { SoundManager } from './SoundManager';

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
  private animationFrameId?: number;
  private onScore: () => void;
  private onGameOver: () => void;
  private particles: ParticleSystem;
  private sounds: SoundManager;
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

    // Initialize speed based on screen size
    const baseSpeed = canvas.width / 160;
    this.speed = window.innerWidth <= 768
      ? baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER
      : baseSpeed * GAME_CONFIG.DESKTOP_SPEED_MULTIPLIER;

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
    };

    // Start background music
    this.sounds.play('background');
  }

  private drawPlayer(): void {
    this.frameCount++;
    const colorIndex = Math.floor(this.frameCount / 5) % GAME_CONFIG.COLORS.DISCO.length;
    this.ctx.fillStyle = GAME_CONFIG.COLORS.DISCO[colorIndex];
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

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
      this.player.yVelocity += GAME_CONFIG.PLAYER.GRAVITY * (this.deltaTime / 16);
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
    // Don't use landingGracePeriod for collision detection
    for (const obstacle of this.obstacles) {
      const obstacleY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - obstacle.height;
      
      // Simple rectangle collision detection
      const collision = 
        this.player.x < obstacle.x + obstacle.width &&
        this.player.x + this.player.width > obstacle.x &&
        this.player.y + this.player.height > obstacleY &&
        this.player.y < obstacleY + obstacle.height;

      if (collision) {
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

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.fillRect(
      0,
      this.canvas.height - GAME_CONFIG.GROUND_HEIGHT,
      this.canvas.width,
      GAME_CONFIG.GROUND_HEIGHT
    );

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

    // Draw score
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.font = '20px pixel, Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    this.animationFrameId = requestAnimationFrame((time) => this.update(time));
  }

  public jump(): void {
    if (this.player.jumpCount < GAME_CONFIG.PLAYER.MAX_JUMPS) {
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
    this.update();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public resize(): void {
    const baseSpeed = this.canvas.width / 160;
    this.speed = window.innerWidth <= 768
      ? baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER
      : baseSpeed * GAME_CONFIG.DESKTOP_SPEED_MULTIPLIER;
  }
} 