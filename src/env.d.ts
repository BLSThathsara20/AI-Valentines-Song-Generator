/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUNO_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 