export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volumes: Map<string, number> = new Map([
    ['background', 0.3],
    ['jump', 0.5],
    ['score', 0.4],
    ['collision', 0.6],
    ['powerup', 0.5]
  ]);

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // Create audio elements
    const jump = new Audio('/sounds/jump.mp3');
    const score = new Audio('/sounds/score.mp3');
    const collision = new Audio('/sounds/collision.mp3');
    const background = new Audio('/sounds/background.mp3');
    const powerup = new Audio('/sounds/powerup.mp3');

    // Configure background music
    background.loop = true;

    // Set volumes
    jump.volume = this.volumes.get('jump') || 0.5;
    score.volume = this.volumes.get('score') || 0.4;
    collision.volume = this.volumes.get('collision') || 0.6;
    background.volume = this.volumes.get('background') || 0.3;
    powerup.volume = this.volumes.get('powerup') || 0.5;

    // Store sounds
    this.sounds.set('jump', jump);
    this.sounds.set('score', score);
    this.sounds.set('collision', collision);
    this.sounds.set('background', background);
    this.sounds.set('powerup', powerup);
  }

  public play(soundName: string): void {
    if (this.muted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // For one-shot sounds, reset and play
      if (soundName !== 'background') {
        sound.currentTime = 0;
      }
      
      // Add a small random pitch variation for one-shot sounds
      if (soundName !== 'background') {
        const playbackRate = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
        sound.playbackRate = playbackRate;
      }

      sound.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }
  }

  public stop(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  public setVolume(soundName: string, volume: number): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      volume = Math.max(0, Math.min(1, volume));
      sound.volume = volume;
      this.volumes.set(soundName, volume);
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.sounds.forEach((sound, name) => {
      if (this.muted) {
        sound.pause();
      } else {
        if (name === 'background') {
          sound.play().catch(console.error);
        }
        sound.volume = this.volumes.get(name) || 0.5;
      }
    });
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public fadeOut(soundName: string, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const sound = this.sounds.get(soundName);
      if (!sound) {
        resolve();
        return;
      }

      const originalVolume = this.volumes.get(soundName) || 0.5;
      const startTime = performance.now();
      
      const fadeStep = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sound.volume = originalVolume * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          sound.pause();
          sound.volume = originalVolume;
          resolve();
        }
      };

      fadeStep();
    });
  }

  public fadeIn(soundName: string, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const sound = this.sounds.get(soundName);
      if (!sound) {
        resolve();
        return;
      }

      const targetVolume = this.volumes.get(soundName) || 0.5;
      sound.volume = 0;
      sound.play().catch(console.error);
      
      const startTime = performance.now();
      
      const fadeStep = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sound.volume = targetVolume * progress;
        
        if (progress < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          resolve();
        }
      };

      fadeStep();
    });
  }
} 