
/**
 * Simple Audio Utility using Web Audio API
 * Generates procedural sound effects without external assets.
 * 
 * Also supports custom uploaded audio files configured in NoCode settings.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private audioElements: Record<string, HTMLAudioElement> = {};

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  private getCustomConfig() {
    try {
      const saved = localStorage.getItem('pilearn_nocode_layout_config');
      if (saved) {
        const config = JSON.parse(saved);
        return config?.systemSettings?.audioSettings || {};
      }
    } catch(e) {}
    return {};
  }

  private async playCustomAudio(effectName: string, customEffect: {url?: string, volume?: number}, masterVolume: number): Promise<boolean> {
    if (!customEffect || !customEffect.url) return false;
    
    try {
      let audio = this.audioElements[effectName];
      if (!audio) {
        audio = new Audio(customEffect.url);
        this.audioElements[effectName] = audio;
      } else if (audio.src !== customEffect.url) {
        audio.src = customEffect.url;
      }

      // Calculate volume
      const baseVol = typeof customEffect.volume === 'number' ? customEffect.volume : 100;
      const finalVol = (baseVol / 100) * (masterVolume / 100);
      
      audio.volume = Math.max(0, Math.min(1, finalVol));
      audio.currentTime = 0;
      await audio.play();
      return true;
    } catch (e) {
      console.warn(`Failed to play custom audio for ${effectName}`, e);
      return false; // Fallback to synthetic
    }
  }

  async playClick() {
    const config = this.getCustomConfig();
    if (await this.playCustomAudio('click', config.click, config.masterVolume ?? 100)) return;

    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  async playSuccess() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('success', config.success, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, now, 0.1); // C5
      playNote(659.25, now + 0.1, 0.1); // E5
      playNote(783.99, now + 0.2, 0.3); // G5
    } catch (e) {}
  }

  async playError() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('error', config.error, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  async playLevelUp() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('levelUp', config.levelUp, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, start: number, duration: number, vol = 0.1) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(261.63, now, 0.1); // C4
      playNote(329.63, now + 0.1, 0.1); // E4
      playNote(392.00, now + 0.2, 0.1); // G4
      playNote(523.25, now + 0.3, 0.5, 0.15); // C5
    } catch (e) {}
  }

  async playXp() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('xp', config.xp, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  async playHooray() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('hooray', config.hooray, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.08, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.2);
      });
    } catch (e) {}
  }

  async playRunCode() {
    const config = this.getCustomConfig();
    const finalMasterVol = config.masterVolume ?? 100;
    if (await this.playCustomAudio('runCode', config.runCode, finalMasterVol)) return;

    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  async playSwordClash() {
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      
      // Weapon slash sound (high pitch to low pitch)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1500, now);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // High metal clash noise
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3000, now);
      osc2.frequency.linearRampToValueAtTime(2500, now + 0.08);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.08);
    } catch (e) {}
  }

  async playHurt() {
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.25);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const audioService = new AudioService();
