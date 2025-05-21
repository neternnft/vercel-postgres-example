import { GAME_CONFIG } from '../config/gameConfig';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'square' | 'star' | 'trail';
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  private createParticle(
    x: number,
    y: number,
    type: 'circle' | 'square' | 'star' | 'trail',
    color: string,
    velocity: { min: number; max: number } = { min: -5, max: 5 }
  ): Particle {
    return {
      x,
      y,
      vx: velocity.min + Math.random() * (velocity.max - velocity.min),
      vy: velocity.min + Math.random() * (velocity.max - velocity.min),
      size: 2 + Math.random() * 4,
      color,
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.1 + Math.random() * 0.2,
      type,
      life: 1,
      maxLife: 1 + Math.random() * 0.5
    };
  }

  private drawStar(x: number, y: number, size: number, rotation: number): void {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const pointX = Math.cos(angle) * radius;
      const pointY = Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(pointX, pointY);
      else this.ctx.lineTo(pointX, pointY);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  public createJumpParticles(x: number, y: number): void {
    const colors = ['#60a5fa', '#34d399', '#818cf8'];
    const count = 15;
    
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star';
      const particle = this.createParticle(x, y, type, color, { min: -3, max: 3 });
      particle.vy = -2 - Math.random() * 3; // Upward velocity
      this.particles.push(particle);
    }
  }

  public createCollisionParticles(x: number, y: number): void {
    const colors = ['#ef4444', '#f59e0b', '#f43f5e'];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star';
      
      const particle = this.createParticle(x, y, type, color);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.maxLife = 1 + Math.random();
      this.particles.push(particle);
    }
  }

  public createScoreParticles(x: number, y: number): void {
    const colors = ['#34d399', '#60a5fa', '#818cf8', '#f59e0b'];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star';
      const particle = this.createParticle(x, y, type, color, { min: -4, max: 4 });
      particle.vy = -2 - Math.random() * 4;
      particle.maxLife = 1.5 + Math.random();
      this.particles.push(particle);
    }
  }

  public createPowerUpCollectionParticles(x: number, y: number, powerUpType: string): void {
    const colors = powerUpType === 'shield' ? ['#60a5fa', '#2563eb'] :
                  powerUpType === 'doubleJump' ? ['#34d399', '#16a34a'] :
                  ['#f472b6', '#db2777'];
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = ['circle', 'star'][Math.floor(Math.random() * 2)] as 'circle' | 'star';
      
      const particle = this.createParticle(x, y, type, color);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.maxLife = 2 + Math.random();
      particle.size = 3 + Math.random() * 4;
      this.particles.push(particle);
    }

    // Add a burst effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const color = colors[0];
      const particle = this.createParticle(x, y, 'star', color);
      particle.vx = Math.cos(angle) * 6;
      particle.vy = Math.sin(angle) * 6;
      particle.size = 6 + Math.random() * 4;
      particle.maxLife = 1.5;
      this.particles.push(particle);
    }
  }

  public update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity and drag
      particle.vy += 0.1;
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed;
      
      // Update life and alpha
      particle.life -= 0.016; // Roughly 1/60 for 60fps
      particle.alpha = particle.life / particle.maxLife;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      
      switch (particle.type) {
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case 'square':
          this.ctx.save();
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation);
          this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
          this.ctx.restore();
          break;
        case 'star':
          this.drawStar(particle.x, particle.y, particle.size, particle.rotation);
          break;
        case 'trail':
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          break;
      }
      
      this.ctx.restore();
    }
  }
} 