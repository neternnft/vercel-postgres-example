import { GAME_CONFIG } from '../config/gameConfig';

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
  }

  private drawObstacle(obstacle: Obstacle): void {
    const obstacleY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - obstacle.height;
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.fillRect(obstacle.x, obstacleY, obstacle.width, obstacle.height);
  }

  private updatePlayerJump(): void {
    if (this.player.jumping) {
      this.player.yVelocity += GAME_CONFIG.PLAYER.GRAVITY;
      this.player.y += this.player.yVelocity;

      const groundY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - this.player.height;
      if (this.player.y > groundY) {
        this.player.y = groundY;
        this.player.jumping = false;
        this.player.yVelocity = 0;
        this.player.landingGracePeriod = 10;
        this.player.jumpCount = 0;
      }
    } else if (this.player.landingGracePeriod > 0) {
      this.player.landingGracePeriod--;
    }
  }

  private checkCollisions(): boolean {
    for (const obstacle of this.obstacles) {
      const obstacleY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - obstacle.height;
      
      if (
        this.player.landingGracePeriod === 0 &&
        this.player.x < obstacle.x + obstacle.width &&
        this.player.x + this.player.width > obstacle.x &&
        this.player.y + this.player.height > obstacleY
      ) {
        return true;
      }
    }
    return false;
  }

  private updateObstacles(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed;

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 1;
        this.onScore();
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

  public update(): void {
    this.frameCount++;
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

    if (this.checkCollisions()) {
      this.stop();
      this.onGameOver();
      return;
    }

    // Draw score
    this.ctx.fillStyle = GAME_CONFIG.COLORS.GROUND;
    this.ctx.font = '20px pixel, Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    this.animationFrameId = requestAnimationFrame(() => this.update());
  }

  public jump(): void {
    if (this.player.jumpCount < GAME_CONFIG.PLAYER.MAX_JUMPS) {
      this.player.jumping = true;
      this.player.yVelocity = GAME_CONFIG.PLAYER.JUMP_VELOCITY;
      this.player.jumpCount++;
    }
  }

  public start(): void {
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