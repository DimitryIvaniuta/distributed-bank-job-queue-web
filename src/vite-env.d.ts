/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_MAX_REQUEST_BYTES?: string;
  readonly VITE_API_MAX_RESPONSE_BYTES?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_DEV_BACKEND_URL?: string;
  readonly VITE_ENVIRONMENT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
