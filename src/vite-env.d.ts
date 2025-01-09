/// <reference types="vite/client" />

declare module 'bad-words' {
  class Filter {
    constructor(options?: any);
    clean(text: string): string;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
  }
  export default Filter;
}

interface ImportMetaEnv {
  readonly VITE_SUNO_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_APP_ENABLED: string;
  readonly VITE_MAINTENANCE_MESSAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
