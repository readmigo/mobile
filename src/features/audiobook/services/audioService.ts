import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import type { PlaybackSpeed } from '../types';

type AudioEventCallback = (...args: any[]) => void;

class AudioService {
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private currentUrl: string | null = null;
  private eventListeners: Map<string, Set<AudioEventCallback>> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });

    this.isInitialized = true;
  }

  on(event: string, callback: AudioEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: AudioEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]): void {
    this.eventListeners.get(event)?.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in audio event listener (${event}):`, error);
      }
    });
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) {
      if (status.error) {
        this.emit('error', new Error(status.error));
      }
      return;
    }

    // Buffering state
    if (status.isBuffering && !status.isPlaying) {
      this.emit('buffering');
    }

    // Time update
    const currentTime = status.positionMillis / 1000;
    const duration = (status.durationMillis ?? 0) / 1000;
    this.emit('timeupdate', currentTime, duration);

    // Playback state
    if (status.isPlaying) {
      this.emit('play');
    } else if (!status.isPlaying && !status.didJustFinish) {
      this.emit('pause');
    }

    // Track ended
    if (status.didJustFinish) {
      this.emit('ended');
    }
  };

  async load(url: string): Promise<void> {
    await this.initialize();

    // Unload previous sound if exists
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }

    this.currentUrl = url;
    this.emit('loadstart');

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.emit('canplay');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    await this.sound.playAsync();
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    await this.sound.pauseAsync();
  }

  async togglePlay(): Promise<void> {
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await this.pause();
      } else {
        await this.play();
      }
    }
  }

  async seek(timeSeconds: number): Promise<void> {
    if (!this.sound) return;
    await this.sound.setPositionAsync(timeSeconds * 1000);
  }

  async seekForward(seconds: number = 15): Promise<void> {
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      const newPosition = Math.min(
        status.positionMillis + seconds * 1000,
        status.durationMillis ?? status.positionMillis
      );
      await this.sound.setPositionAsync(newPosition);
    }
  }

  async seekBackward(seconds: number = 15): Promise<void> {
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      const newPosition = Math.max(0, status.positionMillis - seconds * 1000);
      await this.sound.setPositionAsync(newPosition);
    }
  }

  async setPlaybackSpeed(speed: PlaybackSpeed): Promise<void> {
    if (!this.sound) return;
    await this.sound.setRateAsync(speed, true);
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.sound) return;
    await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
  }

  async getCurrentPosition(): Promise<number> {
    if (!this.sound) return 0;

    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      return status.positionMillis / 1000;
    }
    return 0;
  }

  async getDuration(): Promise<number> {
    if (!this.sound) return 0;

    const status = await this.sound.getStatusAsync();
    if (status.isLoaded) {
      return (status.durationMillis ?? 0) / 1000;
    }
    return 0;
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentUrl = null;
    }
  }

  isLoaded(): boolean {
    return this.sound !== null;
  }
}

// Singleton instance
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

export { AudioService };
