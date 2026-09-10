/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_STATIC_PATH: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_DEV_PROFILE: 'lab' | 'product';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
