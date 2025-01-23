/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUNO_API_KEY: string;
  readonly VITE_APP_ENABLED: string;
  readonly VITE_MAINTENANCE_MESSAGE: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
  // SMS API Environment Variables
  readonly VITE_SMS_API_USERNAME: string;
  readonly VITE_SMS_API_PASSWORD: string;
  readonly VITE_SMS_API_SOURCE_ADDRESS: string;
  readonly VITE_SMS_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 