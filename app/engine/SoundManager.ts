export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // Create audio elements
    const jump = new Audio('/sounds/jump.mp3');
    const score = new Audio('/sounds/score.mp3');
    const collision = new Audio('/sounds/collision.mp3');
    const background = new Audio('/sounds/background.mp3');

    // Configure background music
    background.loop = true;
    background.volume = 0.3;

    // Store sounds
    this.sounds.set('jump', jump);
    this.sounds.set('score', score);
    this.sounds.set('collision', collision);
    this.sounds.set('background', background);
  }

  public play(soundName: string): void {
    if (this.muted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      // For one-shot sounds, reset and play
      if (soundName !== 'background') {
        sound.currentTime = 0;
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

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.sounds.forEach(sound => {
      if (this.muted) {
        sound.pause();
      } else if (sound === this.sounds.get('background')) {
        sound.play().catch(console.error);
      }
    });
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }
} 