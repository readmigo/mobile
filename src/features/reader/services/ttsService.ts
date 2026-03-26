import { ttsApi, CloudVoice, TTSGenerateResponse } from '@/services/api/tts';

class TTSService {
  private voices: CloudVoice[] = [];
  private selectedVoiceId: string | null = null;
  private speed: number = 1.0;

  async loadVoices(): Promise<CloudVoice[]> {
    if (this.voices.length > 0) return this.voices;
    try {
      const response = await ttsApi.getVoices();
      this.voices = response.data;
      return this.voices;
    } catch {
      return [];
    }
  }

  getVoices(): CloudVoice[] {
    return this.voices;
  }

  setVoice(voiceId: string) {
    this.selectedVoiceId = voiceId;
  }

  getSelectedVoiceId(): string | null {
    return this.selectedVoiceId;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  async generateSpeech(text: string): Promise<TTSGenerateResponse | null> {
    if (!this.selectedVoiceId) return null;
    try {
      const response = await ttsApi.generateSpeech({
        text,
        voiceId: this.selectedVoiceId,
        speed: this.speed,
        includeTimestamps: true,
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async generateChapterSpeech(bookId: string, chapterId: string): Promise<TTSGenerateResponse | null> {
    if (!this.selectedVoiceId) return null;
    try {
      const response = await ttsApi.generateChapterSpeech({
        bookId,
        chapterId,
        voiceId: this.selectedVoiceId,
        speed: this.speed,
        includeTimestamps: true,
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async getUsage() {
    return ttsApi.getUsage();
  }
}

export const ttsService = new TTSService();
