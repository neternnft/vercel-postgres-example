export class SoundManager {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;
  private volumes: Map<string, number> = new Map([
    ['background', 0.2],
    ['jump', 0.2],
    ['score', 0.15],
    ['collision', 0.25],
    ['powerup', 0.2]
  ]);

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => {
        if (!this.audioContext) {
          this.audioContext = new AudioContext();
        }
      }, { once: true });
    }
  }

  private createJumpSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.12, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Higher pitched, shorter "blip" sound
      const frequency = 600 + 200 * Math.sin(2 * Math.PI * 8 * t); // Slight frequency modulation
      const amplitude = Math.exp(-20 * t); // Faster fade-out
      
      // Simpler, cleaner waveform
      data[i] = (
        0.8 * Math.sin(2 * Math.PI * frequency * t) +
        0.2 * Math.sin(4 * Math.PI * frequency * t)
      ) * amplitude * (1 + 0.05 * Math.sin(2 * Math.PI * 30 * t)); // Subtle tremolo
    }
    
    return buffer;
  }

  private createScoreSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.15, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Use more pleasant musical intervals
      const baseFreq = 523.25; // C5
      const freq1 = baseFreq; // C5
      const freq2 = baseFreq * Math.pow(2, 4/12); // E5
      const freq3 = baseFreq * Math.pow(2, 7/12); // G5
      
      const amplitude = Math.exp(-10 * t); // Smoother fade-out
      
      // Create a short chord-like sound
      data[i] = (
        0.4 * Math.sin(2 * Math.PI * freq1 * t) +
        0.3 * Math.sin(2 * Math.PI * freq2 * t) +
        0.3 * Math.sin(2 * Math.PI * freq3 * t)
      ) * amplitude * (1 + 0.1 * Math.sin(2 * Math.PI * 12 * t)); // Gentle shimmer
    }
    
    return buffer;
  }

  private createCollisionSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.15, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      // Create a softer "thud" sound
      const t = i / sampleRate;
      const frequency = 80; // Lower base frequency
      const amplitude = Math.exp(-15 * t); // Quick but smooth fade
      // Add some complexity for a richer sound
      data[i] = (
        0.5 * Math.sin(2 * Math.PI * frequency * t) +
        0.3 * Math.sin(2 * Math.PI * (frequency * 1.5) * t) +
        0.2 * Math.sin(2 * Math.PI * (frequency * 2) * t)
      ) * amplitude;
    }
    
    return buffer;
  }

  private createPowerupSound(): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, sampleRate * 0.25, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      // Create a gentler "sparkle" sound
      const t = i / sampleRate;
      // Use musical frequencies for a more pleasant sound
      const baseFreq = 440; // A4
      const freq1 = baseFreq * Math.pow(2, 4/12); // C#5
      const freq2 = baseFreq * Math.pow(2, 7/12); // E5
      const freq3 = baseFreq * 2; // A5
      
      const amplitude = Math.exp(-6 * t); // Gentle fade-out
      
      // Combine frequencies with gentle amplitude modulation
      data[i] = (
        0.3 * Math.sin(2 * Math.PI * freq1 * t) +
        0.3 * Math.sin(2 * Math.PI * freq2 * t) +
        0.3 * Math.sin(2 * Math.PI * freq3 * t)
      ) * amplitude * (1 + 0.1 * Math.sin(2 * Math.PI * 8 * t));
    }
    
    return buffer;
  }

  public play(name: string): void {
    if (!this.audioContext || this.muted) return;

    try {
      let buffer: AudioBuffer;
      
      // Generate the appropriate sound
      switch (name) {
        case 'jump':
          buffer = this.createJumpSound();
          break;
        case 'score':
          buffer = this.createScoreSound();
          break;
        case 'collision':
          buffer = this.createCollisionSound();
          break;
        case 'powerup':
          buffer = this.createPowerupSound();
          break;
        default:
          return;
      }

      // Play the sound
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volumes.get(name) || 0.2;
      
      // Add a slight fade-in to prevent clicking
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        gainNode.gain.value,
        this.audioContext.currentTime + 0.01
      );
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
    }
  }

  public stop(name: string): void {
    // Not needed for short sounds
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }
} 