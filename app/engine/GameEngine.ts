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
  private trailPoints: Array<{
    x: number,
    y: number,
    alpha: number,
    rotation: number,
    color: string
  }> = [];
  private readonly MAX_TRAIL_POINTS = 8;
  private readonly TRAIL_FADE_SPEED = 0.1;
  private parallaxLayers: Array<{
    x: number;
    speed: number;
    elements: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      shape: 'circle' | 'square' | 'star';
      yOffset?: number;
      ySpeed?: number;
    }>;
  }> = [];

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

    // Initialize speed with consistent scaling
    this.baseSpeed = Math.min(canvas.width / 160, 8);  // Base speed calculation
    this.speed = this.baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER;  // Using same multiplier for all screens

    // Initialize player with safe starting position
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

    // Initialize parallax layers
    this.initParallaxLayers();

    // Start background music
    this.sounds.play('background');
  }

  private initParallaxLayers(): void {
    const layers = [
      { 
        count: 30, 
        speed: 0.05, 
        size: { min: 1, max: 2 }, 
        colors: ['rgba(84, 202, 155, 0.3)']  // Theme green stars
      },
      { 
        count: 20, 
        speed: 0.1, 
        size: { min: 2, max: 3 }, 
        colors: ['rgba(74, 144, 226, 0.3)']  // Theme blue stars
      },
      { 
        count: 15, 
        speed: 0.15, 
        size: { min: 2.5, max: 3.5 }, 
        colors: ['rgba(196, 113, 237, 0.3)']  // Theme purple stars
      }
    ];

    layers.forEach((layer, index) => {
      const elements = Array.from({ length: layer.count }, () => {
        const x = Math.random() * this.canvas.width;
        const heightRange = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT;
        const y = Math.random() * heightRange * 0.9;
        
        return {
          x,
          y,
          size: layer.size.min + Math.random() * (layer.size.max - layer.size.min),
          color: layer.colors[Math.floor(Math.random() * layer.colors.length)],
          shape: Math.random() > 0.7 ? 'star' as const : 'circle' as const,
          yOffset: 0,
          ySpeed: (0.05 + Math.random() * 0.05) * (Math.random() < 0.5 ? 1 : -1)
        };
      });

      this.parallaxLayers.push({
        x: 0,
        speed: layer.speed,
        elements
      });
    });
  }

  private drawStar(x: number, y: number, size: number): void {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(pointX, pointY);
      else this.ctx.lineTo(pointX, pointY);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawParallaxLayers(): void {
    this.parallaxLayers.forEach((layer, layerIndex) => {
      // Move elements from right to left (opposite to player's movement)
      layer.x -= this.speed * layer.speed * (this.deltaTime / 16);
      
      layer.elements.forEach(element => {
        // Update vertical position for subtle floating movement
        if ('yOffset' in element) {
          element.yOffset = (element.yOffset || 0) + (element.ySpeed || 0) * (this.deltaTime / 16);
          // Reverse direction at bounds
          if (Math.abs(element.yOffset) > 5) {
            element.ySpeed = -(element.ySpeed || 0);
          }
        }

        this.ctx.fillStyle = element.color;
        
        // Calculate wrapped x position
        let xPos = (element.x - layer.x) % this.canvas.width;
        if (xPos < 0) xPos += this.canvas.width;

        // Calculate y position with offset
        const yPos = element.y + (element.yOffset || 0);

        // Draw element with subtle glow effect for closer layers
        if (layerIndex > 0) {
          this.ctx.shadowColor = element.color;
          this.ctx.shadowBlur = layerIndex * 2;
        }

        // Draw main element
        this.ctx.beginPath();
        this.ctx.arc(xPos, yPos, element.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Reset shadow for efficiency
        if (layerIndex > 0) {
          this.ctx.shadowBlur = 0;
        }

        // Draw wrapped element if it's near the right edge
        if (xPos > this.canvas.width - element.size * 2) {
          const wrappedX = xPos - this.canvas.width;
          this.ctx.beginPath();
          this.ctx.arc(wrappedX, yPos, element.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
    });
  }

  private drawBackground(): void {
    // Create a pure black background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw parallax layers
    this.drawParallaxLayers();

    // Add futuristic grid effect
    this.ctx.strokeStyle = 'rgba(84, 202, 155, 0.1)';  // Theme green
    this.ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Add atmospheric glow at the top
    const glowGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
    glowGradient.addColorStop(0, 'rgba(84, 202, 155, 0.15)');  // Theme green glow
    glowGradient.addColorStop(1, 'rgba(84, 202, 155, 0)');
    this.ctx.fillStyle = glowGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);

    // Draw ground with futuristic effect
    const groundGradient = this.ctx.createLinearGradient(
      0, 
      this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 
      0, 
      this.canvas.height
    );
    groundGradient.addColorStop(0, 'rgba(84, 202, 155, 0.2)');  // Theme green
    groundGradient.addColorStop(1, '#000000');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(
      0, 
      this.canvas.height - GAME_CONFIG.GROUND_HEIGHT, 
      this.canvas.width, 
      GAME_CONFIG.GROUND_HEIGHT
    );

    // Add ground line effect
    this.ctx.strokeStyle = '#54CA9B';  // Theme green
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - GAME_CONFIG.GROUND_HEIGHT);
    this.ctx.stroke();
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
    
    // Create obstacle gradient
    const gradient = this.ctx.createLinearGradient(
      obstacle.x,
      obstacleY,
      obstacle.x,
      obstacleY + obstacle.height
    );
    gradient.addColorStop(0, 'rgba(84, 202, 155, 0.8)');  // Theme green
    gradient.addColorStop(1, 'rgba(74, 144, 226, 0.8)');  // Theme blue

    // Draw obstacle with futuristic style
    this.ctx.save();
    this.ctx.beginPath();
    const radius = 2;  // Sharper corners for futuristic look
    this.ctx.moveTo(obstacle.x + radius, obstacleY);
    this.ctx.lineTo(obstacle.x + obstacle.width - radius, obstacleY);
    this.ctx.arcTo(obstacle.x + obstacle.width, obstacleY, obstacle.x + obstacle.width, obstacleY + radius, radius);
    this.ctx.lineTo(obstacle.x + obstacle.width, obstacleY + obstacle.height - radius);
    this.ctx.arcTo(obstacle.x + obstacle.width, obstacleY + obstacle.height, obstacle.x + obstacle.width - radius, obstacleY + obstacle.height, radius);
    this.ctx.lineTo(obstacle.x + radius, obstacleY + obstacle.height);
    this.ctx.arcTo(obstacle.x, obstacleY + obstacle.height, obstacle.x, obstacleY + obstacle.height - radius, radius);
    this.ctx.lineTo(obstacle.x, obstacleY + radius);
    this.ctx.arcTo(obstacle.x, obstacleY, obstacle.x + radius, obstacleY, radius);
    this.ctx.closePath();

    // Add glow effect
    this.ctx.shadowColor = '#54CA9B';  // Theme green glow
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Fill with gradient
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Add circuit-like lines
    this.ctx.strokeStyle = 'rgba(84, 202, 155, 0.5)';  // Theme green
    this.ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = obstacleY; y < obstacleY + obstacle.height; y += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(obstacle.x, y);
      this.ctx.lineTo(obstacle.x + obstacle.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();

    // Draw ground shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';  // Lighter ground shadow
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
      
      // Fixed timestep for more consistent physics
      const fixedDeltaTime = Math.min(this.deltaTime, 32) / 16;
      this.player.yVelocity += gravity * fixedDeltaTime;
      this.player.y += this.player.yVelocity * fixedDeltaTime;

      const groundY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - this.player.height;
      if (this.player.y > groundY) {
        this.player.y = groundY;
        this.player.jumping = false;
        this.player.yVelocity = 0;
        this.player.landingGracePeriod = 5; // Reduced from 10 to 5 for more responsive jumps
        this.player.jumpCount = 0;
        
        this.particles.createJumpParticles(
          this.player.x,
          this.player.y + this.player.height
        );
      }
    } else if (this.player.landingGracePeriod > 0) {
      this.player.landingGracePeriod--;
    }

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
    // Don't spawn obstacles immediately at game start
    if (this.frameCount < 30) { // Reduced from 60 to 30 for faster start
      this.frameCount++;
      return;
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.speed * (this.deltaTime / 16);

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 1;
        this.onScore();
        
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
      // Ensure first obstacle is far enough away
      const startingX = this.obstacles.length === 0 
        ? this.canvas.width * 1.5 // Place first obstacle further away
        : this.canvas.width;

      this.obstacles.push({
        x: startingX,
        y: this.canvas.height - GAME_CONFIG.GROUND_HEIGHT,
        width: GAME_CONFIG.OBSTACLE.MIN_WIDTH + Math.random() * GAME_CONFIG.OBSTACLE.MAX_WIDTH_ADDITION,
        height: GAME_CONFIG.OBSTACLE.MIN_HEIGHT + Math.random() * GAME_CONFIG.OBSTACLE.MAX_HEIGHT_ADDITION,
        type: 'cactus',
      });
    }
  }

  private updateTrail(): void {
    const colorIndex = Math.floor(this.frameCount / 5) % GAME_CONFIG.COLORS.DISCO.length;
    const currentColor = GAME_CONFIG.COLORS.DISCO[colorIndex];

    // Add new trail point with velocity-based properties
    const velocityFactor = Math.abs(this.player.yVelocity) / 10;
    this.trailPoints.unshift({
      x: this.player.x,
      y: this.player.y,
      alpha: 0.5, // Increased initial alpha
      rotation: this.player.rotation,
      color: currentColor,
    });

    // Remove excess points
    if (this.trailPoints.length > this.MAX_TRAIL_POINTS) {
      this.trailPoints.pop();
    }

    // Update alpha of existing points with smooth curve
    for (let i = 0; i < this.trailPoints.length; i++) {
      const progress = i / this.trailPoints.length;
      this.trailPoints[i].alpha = Math.max(0, 0.5 * (1 - Math.pow(progress, 2)));
    }
  }

  private drawTrail(): void {
    for (let i = this.trailPoints.length - 1; i >= 0; i--) {
      const point = this.trailPoints[i];
      const size = this.player.width * (1 - i / this.trailPoints.length * 0.5); // Trail gets smaller
      
      this.ctx.save();
      this.ctx.globalAlpha = point.alpha;
      this.ctx.translate(
        point.x + this.player.width / 2,
        point.y + this.player.height / 2
      );
      this.ctx.rotate(point.rotation);

      // Draw trail with glow effect
      this.ctx.shadowColor = point.color;
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = point.color;
      
      // Draw with rounded corners
      this.ctx.beginPath();
      const radius = 5 * (1 - i / this.trailPoints.length * 0.3); // Dynamic corner radius
      const width = size;
      const height = this.player.height * (1 - i / this.trailPoints.length * 0.3);
      
      this.ctx.moveTo(-width/2 + radius, -height/2);
      this.ctx.lineTo(width/2 - radius, -height/2);
      this.ctx.arcTo(width/2, -height/2, width/2, -height/2 + radius, radius);
      this.ctx.lineTo(width/2, height/2 - radius);
      this.ctx.arcTo(width/2, height/2, width/2 - radius, height/2, radius);
      this.ctx.lineTo(-width/2 + radius, height/2);
      this.ctx.arcTo(-width/2, height/2, -width/2, height/2 - radius, radius);
      this.ctx.lineTo(-width/2, -height/2 + radius);
      this.ctx.arcTo(-width/2, -height/2, -width/2 + radius, -height/2, radius);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  public update(currentTime: number = 0): void {
    this.deltaTime = Math.min(currentTime - this.lastTime, 32);
    this.lastTime = currentTime;

    // Update speed with consistent progression
    const speedIncrease = Math.min(this.score * 0.15, 8);
    this.speed = this.baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER + speedIncrease;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();

    // Update and draw trail before player
    this.updateTrail();
    this.drawTrail();

    // Update and draw power-ups
    this.powerUps.update(this.deltaTime, this.speed);
    this.powerUps.drawActivePowerUps();

    this.powerUps.spawnPowerUp(this.score);

    this.drawPlayer();
    this.updatePlayerJump();
    this.updateObstacles();

    for (const obstacle of this.obstacles) {
      this.drawObstacle(obstacle);
    }

    this.particles.update();

    if (this.checkCollisions()) {
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

    // Draw score with white color and shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.fillStyle = '#FFFFFF';  // White color
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.shadowBlur = 0;

    this.animationFrameId = requestAnimationFrame((time) => this.update(time));
  }

  public jump(): void {
    const maxJumps = this.powerUps.hasPowerUp('doubleJump') ? 3 : 2;
    
    if (this.player.jumpCount < maxJumps) {
      // Reduced jump cooldown for more responsive controls
      const now = performance.now();
      if (!this._lastJumpTime || now - this._lastJumpTime > 50) { // Reduced from 100 to 50ms
        this.player.jumping = true;
        this.player.yVelocity = GAME_CONFIG.PLAYER.JUMP_VELOCITY;
        this.player.jumpCount++;
        this._lastJumpTime = now;
        
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
    // Clear any existing game state
    this.obstacles = [];
    this.score = 0;
    this.frameCount = 0;
    this.trailPoints = []; // Clear trail points
    
    // Reset player to safe position
    this.player.y = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - GAME_CONFIG.PLAYER.HEIGHT;
    this.player.jumping = false;
    this.player.yVelocity = 0;
    this.player.jumpCount = 0;
    this.player.rotation = 0;
    
    // Reset parallax layers
    this.parallaxLayers = [];
    this.initParallaxLayers();
    
    // Clear power-ups
    this.powerUps.clear();
    
    setTimeout(() => {
      this.lastTime = performance.now();
      this.update();
    }, 500);
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public resize(): void {
    // Update speed with consistent scaling
    this.baseSpeed = Math.min(this.canvas.width / 160, 8);  // Base speed calculation
    this.speed = this.baseSpeed * GAME_CONFIG.MOBILE_SPEED_MULTIPLIER;  // Using same multiplier for all screens
  }
} 