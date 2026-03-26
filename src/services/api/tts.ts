import { apiClient, ApiResponse } from './client';

export interface AudioWordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
  charStart: number;
  charEnd: number;
}

export interface TimestampSegment {
  segmentId: number;
  startTime: number;
  endTime: number;
  text: string;
  charStart: number;
  charEnd: number;
  confidence: number;
  words?: AudioWordTimestamp[];
}

export interface ChapterTimestamps {
  version: number;
  generatedAt: string;
  method: string;
  language: string;
  duration: number;
  segments: TimestampSegment[];
}

export interface CloudVoice {
  voiceId: string;
  displayName: string;
  gender: string;
  accent: string;
  quality: 'premium' | 'standard';
  minPlan: string;
  provider: string;
  sampleUrl?: string;
  available: boolean;
}

export interface TTSGenerateResponse {
  audioUrl: string;
  duration: number;
  cached: boolean;
  wordTimestamps?: AudioWordTimestamp[];
  timestampsUrl?: string;
}

export interface TTSUsage {
  usedSeconds: number;
  limitSeconds: number;
  isGuest: boolean;
}

export const ttsApi = {
  getChapterTimestamps: async (
    audiobookId: string,
    chapterNumber: number,
  ): Promise<ApiResponse<ChapterTimestamps>> => {
    const response = await apiClient.get(
      `/audiobooks/${audiobookId}/chapters/${chapterNumber}/timestamps`,
    );
    return response.data;
  },

  generateSpeech: async (data: {
    text: string;
    voiceId: string;
    speed: number;
    includeTimestamps: boolean;
  }): Promise<ApiResponse<TTSGenerateResponse>> => {
    const response = await apiClient.post('/tts/generate', data);
    return response.data;
  },

  generateChapterSpeech: async (data: {
    bookId: string;
    chapterId: string;
    voiceId: string;
    speed: number;
    includeTimestamps: boolean;
  }): Promise<ApiResponse<TTSGenerateResponse>> => {
    const response = await apiClient.post('/tts/generate/batch', data);
    return response.data;
  },

  getVoices: async (): Promise<ApiResponse<CloudVoice[]>> => {
    const response = await apiClient.get('/tts/voices');
    return response.data;
  },

  getUsage: async (): Promise<ApiResponse<TTSUsage>> => {
    const response = await apiClient.get('/tts/usage');
    return response.data;
  },
};
