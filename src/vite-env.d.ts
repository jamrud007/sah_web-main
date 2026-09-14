/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_BASEURL: string;
  // tambahkan variabel VITE_ lain di sini...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
