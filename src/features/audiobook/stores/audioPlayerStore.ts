import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAudioService } from '../services/audioService';
import { audiobookApi } from '../services/audiobookApi';
import type {
  Audiobook,
  AudiobookChapter,
  AudioPlayerState,
  PlaybackSpeed,
  SleepTimerOption,
} from '../types';

interface AudioPlayerActions {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  seekForward: (seconds?: number) => Promise<void>;
  seekBackward: (seconds?: number) => Promise<void>;
  nextChapter: () => Promise<void>;
  previousChapter: () => Promise<void>;
  goToChapter: (index: number) => Promise<void>;
  setPlaybackSpeed: (speed: PlaybackSpeed) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setSleepTimer: (option: SleepTimerOption | null) => void;
  clearSleepTimer: () => void;
  loadAudiobook: (audiobook: Audiobook, startChapter?: number, startPosition?: number) => Promise<void>;
  unloadAudiobook: () => Promise<void>;
  minimize: () => void;
  maximize: () => void;
  hide: () => void;
  show: () => void;
  syncProgress: () => Promise<void>;
  updateTime: (currentTime: number, duration: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setBuffering: (isBuffering: boolean) => void;
  setError: (error: string | null) => void;
}

interface AudioPlayerStore extends AudioPlayerState, AudioPlayerActions {}

let progressSyncTimeout: ReturnType<typeof setTimeout> | null = null;
let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;

export const useAudioPlayerStore = create<AudioPlayerStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      audiobook: null,
      currentChapter: null,
      chapterIndex: 0,
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      currentTime: 0,
      duration: 0,
      playbackSpeed: 1.0 as PlaybackSpeed,
      volume: 1,
      isMinimized: false,
      isVisible: false,
      sleepTimer: null,
      sleepTimerEndTime: null,
      error: null,

      // Internal state updates
      updateTime: (currentTime: number, duration: number) => {
        set((state) => {
          state.currentTime = currentTime;
          state.duration = duration;
        });

        // Check sleep timer
        const { sleepTimerEndTime } = get();
        if (sleepTimerEndTime && Date.now() >= sleepTimerEndTime) {
          get().pause();
          set((state) => {
            state.sleepTimer = null;
            state.sleepTimerEndTime = null;
          });
        }

        // Debounced progress sync
        if (progressSyncTimeout) {
          clearTimeout(progressSyncTimeout);
        }
        progressSyncTimeout = setTimeout(() => {
          get().syncProgress();
        }, 5000);
      },

      setPlaying: (isPlaying: boolean) => {
        set((state) => {
          state.isPlaying = isPlaying;
          state.isLoading = false;
        });
      },

      setLoading: (isLoading: boolean) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },

      setBuffering: (isBuffering: boolean) => {
        set((state) => {
          state.isBuffering = isBuffering;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
          state.isLoading = false;
          state.isPlaying = false;
        });
      },

      // Playback controls
      play: async () => {
        const audioService = getAudioService();
        try {
          await audioService.play();
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      pause: async () => {
        const audioService = getAudioService();
        await audioService.pause();
      },

      togglePlay: async () => {
        const audioService = getAudioService();
        try {
          await audioService.togglePlay();
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      seek: async (time: number) => {
        const audioService = getAudioService();
        await audioService.seek(time);
        set((state) => {
          state.currentTime = time;
        });
      },

      seekForward: async (seconds = 15) => {
        const audioService = getAudioService();
        await audioService.seekForward(seconds);
      },

      seekBackward: async (seconds = 15) => {
        const audioService = getAudioService();
        await audioService.seekBackward(seconds);
      },

      // Chapter navigation
      nextChapter: async () => {
        const { audiobook, chapterIndex, playbackSpeed, sleepTimer } = get();
        if (!audiobook) return;

        const nextIndex = chapterIndex + 1;
        if (nextIndex >= audiobook.chapters.length) {
          set((state) => {
            state.isPlaying = false;
          });
          get().syncProgress();
          return;
        }

        // Check if we should stop at end of chapter
        if (sleepTimer === 'end_of_chapter') {
          set((state) => {
            state.sleepTimer = null;
            state.sleepTimerEndTime = null;
            state.isPlaying = false;
          });
          return;
        }

        const nextChapter = audiobook.chapters[nextIndex];
        set((state) => {
          state.chapterIndex = nextIndex;
          state.currentChapter = nextChapter;
          state.currentTime = 0;
          state.isLoading = true;
        });

        const audioService = getAudioService();
        try {
          await audioService.load(nextChapter.audioUrl);
          await audioService.setPlaybackSpeed(playbackSpeed);
          await audioService.play();
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.isLoading = false;
          });
        }
      },

      previousChapter: async () => {
        const { audiobook, chapterIndex, playbackSpeed, currentTime } = get();
        if (!audiobook) return;

        // If more than 3 seconds in, restart current chapter
        if (currentTime > 3) {
          get().seek(0);
          return;
        }

        const prevIndex = chapterIndex - 1;
        if (prevIndex < 0) return;

        const prevChapter = audiobook.chapters[prevIndex];
        set((state) => {
          state.chapterIndex = prevIndex;
          state.currentChapter = prevChapter;
          state.currentTime = 0;
          state.isLoading = true;
        });

        const audioService = getAudioService();
        try {
          await audioService.load(prevChapter.audioUrl);
          await audioService.setPlaybackSpeed(playbackSpeed);
          await audioService.play();
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.isLoading = false;
          });
        }
      },

      goToChapter: async (index: number) => {
        const { audiobook, playbackSpeed, isPlaying } = get();
        if (!audiobook || index < 0 || index >= audiobook.chapters.length) return;

        const chapter = audiobook.chapters[index];
        set((state) => {
          state.chapterIndex = index;
          state.currentChapter = chapter;
          state.currentTime = 0;
          state.isLoading = true;
        });

        const audioService = getAudioService();
        try {
          await audioService.load(chapter.audioUrl);
          await audioService.setPlaybackSpeed(playbackSpeed);
          if (isPlaying) {
            await audioService.play();
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.isLoading = false;
          });
        }
      },

      // Settings
      setPlaybackSpeed: async (speed: PlaybackSpeed) => {
        const audioService = getAudioService();
        await audioService.setPlaybackSpeed(speed);
        set((state) => {
          state.playbackSpeed = speed;
        });
      },

      setVolume: async (volume: number) => {
        const audioService = getAudioService();
        await audioService.setVolume(volume);
        set((state) => {
          state.volume = volume;
        });
      },

      // Sleep timer
      setSleepTimer: (option: SleepTimerOption | null) => {
        if (sleepTimerInterval) {
          clearInterval(sleepTimerInterval);
          sleepTimerInterval = null;
        }

        if (option === null) {
          set((state) => {
            state.sleepTimer = null;
            state.sleepTimerEndTime = null;
          });
          return;
        }

        if (option === 'end_of_chapter') {
          set((state) => {
            state.sleepTimer = option;
            state.sleepTimerEndTime = null;
          });
        } else {
          const endTime = Date.now() + option * 60 * 1000;
          set((state) => {
            state.sleepTimer = option;
            state.sleepTimerEndTime = endTime;
          });
        }
      },

      clearSleepTimer: () => {
        if (sleepTimerInterval) {
          clearInterval(sleepTimerInterval);
          sleepTimerInterval = null;
        }
        set((state) => {
          state.sleepTimer = null;
          state.sleepTimerEndTime = null;
        });
      },

      // Audiobook management
      loadAudiobook: async (audiobook: Audiobook, startChapter = 0, startPosition = 0) => {
        const { playbackSpeed } = get();
        const chapter = audiobook.chapters[startChapter] || audiobook.chapters[0];

        set((state) => {
          state.audiobook = audiobook;
          state.currentChapter = chapter;
          state.chapterIndex = startChapter;
          state.currentTime = startPosition;
          state.duration = chapter.duration;
          state.isVisible = true;
          state.isMinimized = false;
          state.error = null;
          state.isLoading = true;
        });

        const audioService = getAudioService();

        // Setup event listeners
        audioService.on('play', () => get().setPlaying(true));
        audioService.on('pause', () => get().setPlaying(false));
        audioService.on('ended', () => get().nextChapter());
        audioService.on('loadstart', () => get().setLoading(true));
        audioService.on('canplay', () => get().setLoading(false));
        audioService.on('buffering', () => get().setBuffering(true));
        audioService.on('timeupdate', (currentTime: number, duration: number) => {
          get().updateTime(currentTime, duration);
          get().setBuffering(false);
        });
        audioService.on('error', (error: Error) => get().setError(error.message));

        try {
          await audioService.load(chapter.audioUrl);
          await audioService.setPlaybackSpeed(playbackSpeed);
          if (startPosition > 0) {
            await audioService.seek(startPosition);
          }
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.isLoading = false;
          });
        }
      },

      unloadAudiobook: async () => {
        const audioService = getAudioService();
        await audioService.pause();

        // Sync final progress before unloading
        await get().syncProgress();

        await audioService.unload();

        if (progressSyncTimeout) {
          clearTimeout(progressSyncTimeout);
          progressSyncTimeout = null;
        }

        set((state) => {
          state.audiobook = null;
          state.currentChapter = null;
          state.chapterIndex = 0;
          state.isPlaying = false;
          state.isLoading = false;
          state.isBuffering = false;
          state.currentTime = 0;
          state.duration = 0;
          state.isVisible = false;
          state.isMinimized = false;
          state.sleepTimer = null;
          state.sleepTimerEndTime = null;
          state.error = null;
        });
      },

      // UI
      minimize: () => set((state) => { state.isMinimized = true; }),
      maximize: () => set((state) => { state.isMinimized = false; }),
      hide: () => set((state) => { state.isVisible = false; }),
      show: () => set((state) => { state.isVisible = true; }),

      // Progress sync
      syncProgress: async () => {
        const { audiobook, chapterIndex, currentTime, playbackSpeed } = get();
        if (!audiobook) return;

        try {
          await audiobookApi.updateProgress(audiobook.id, {
            chapterIndex,
            positionSeconds: Math.floor(currentTime),
            playbackSpeed,
          });
        } catch (error) {
          console.error('Failed to sync audiobook progress:', error);
        }
      },
    })),
    {
      name: 'audio-player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playbackSpeed: state.playbackSpeed,
        volume: state.volume,
      }),
    }
  )
);

// Helper functions
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
