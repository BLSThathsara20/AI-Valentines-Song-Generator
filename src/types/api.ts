export interface ApidogModel {
    config?: Config;
    input: Input;
    model: Model;
    task_type: TaskType;
}

export interface Config {
    service_mode: 'public';
    webhook_config?: WebhookConfig;
}

export interface WebhookConfig {
    endpoint?: string;
    secret?: string;
}

export interface Input {
    gpt_description_prompt?: string;
    lyrics_type: LyricsType;
    make_instrumental?: boolean;
    negative_tags?: string;
    prompt?: string;
    seed?: number;
    tags?: string;
    title?: string;
}

export enum LyricsType {
    Generate = "generate",
    Instrumental = "instrumental",
    User = "user",
}

export enum Model {
    MusicS = "music-s",
    MusicU = "music-u",
}

export enum TaskType {
    GenerateMusic = "generate_music",
    GenerateMusicCustom = "generate_music_custom",
}

export interface ApiResponse {
    task_id: string;
    status: string;
}

export interface Song {
  id: string;
  title: string;
  image_path: string;
  lyrics: string;
  prompt: string;
  song_path: string;
  duration: number;
  finished: boolean;
  tags: string[];
  error_type: string | null;
  error_code: string | null;
  error_detail: string | null;
}

export interface TaskResponse {
  code: number;
  data: {
    task_id: string;
    status: 'pending' | 'completed' | 'failed';
    error?: {
      message: string;
      code?: string;
    };
    output: {
      generation_id?: string;
      songs?: Song[];
    };
    meta?: {
      created_at: string;
      started_at: string;
      ended_at: string;
      usage: {
        type: string;
        frozen: number;
        consume: number;
      };
    };
  };
  message: string;
}

export type GenerationHistoryItem = {
  id: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  completedAt?: number;
  songs?: Song[];
  error?: string;
  tags?: string;
};

export type HistoryItemInput = Omit<GenerationHistoryItem, 'completedAt'> & {
  completedAt?: number;
};

export interface TaskOutput {
  songs?: Array<{
    url: string;
    duration: number;
  }>;
}

export interface MusicOptions {
  genre: string;
  voiceType: string;
  mood: string;
  era: string;
} 