// src/constants/sahNav.ts
// Shared icons, navigation definitions, and status chips from SAH Web Admin (standalone).html

export const I = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  box: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  users: 'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M22 20v-2a4 4 0 0 0-3-3.9',
  mosque: 'M12 3c2 2 3 3.4 3 5H9c0-1.6 1-3 3-5M5 21V11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10M3 21h18M10 21v-5a2 2 0 0 1 4 0v5',
  fork: 'M4 3v7a3 3 0 0 0 6 0V3M7 10v11M17 3c-1.5 1.5-2 3-2 5v4h4V8c0-2-.5-3.5-2-5M17 12v9',
  chart: 'M3 3v18h18M7 15v3M12 10v8M17 6v12',
  ads: 'M3 11v3a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1M19 9a3 3 0 0 1 0 6',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.9-5.2 2.9 1-5.9L3.5 9.7l5.9-.8z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  camera: 'M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
};

export interface StatusChipDef {
  id: string;
  en: string;
  g: string;
  gc: string;
  bg: string;
  bd: string;
}

export const CH: Record<string, StatusChipDef> = {
  verified: { id: 'Terverifikasi', en: 'Verified', g: '●', gc: 'var(--sah-blue-strong)', bg: 'var(--sah-mist-soft)', bd: 'var(--sah-mist)' },
  unverified: { id: 'Belum terverifikasi', en: 'Not verified', g: '○', gc: 'var(--sah-muted)', bg: 'var(--sah-sand)', bd: 'var(--sah-line)' },
  community: { id: 'Rekomendasi komunitas', en: 'Community recommendation', g: '◐', gc: 'var(--sah-copper-dark)', bg: 'var(--sah-copper-pale)', bd: 'var(--sah-line)' },
  ok: { id: 'Aktif', en: 'Active', g: '●', gc: 'var(--sah-blue-strong)', bg: 'var(--sah-mist-soft)', bd: 'var(--sah-mist)' },
  wait: { id: 'Menunggu', en: 'Pending', g: '○', gc: 'var(--sah-copper)', bg: 'var(--sah-copper-pale)', bd: 'var(--sah-line)' },
  draft: { id: 'Draf', en: 'Draft', g: '○', gc: 'var(--sah-muted)', bg: 'rgba(23,36,58,.05)', bd: 'var(--sah-line)' },
  bad: { id: 'Ditolak', en: 'Rejected', g: '●', gc: 'var(--danger)', bg: 'rgba(168,95,79,.12)', bd: 'var(--sah-line)' },
};

export const ROLES = [
  { v: 'US-02', n: 'US-02 Administrator Konten' },
  { v: 'US-04', n: 'US-04 Administrator Sistem' },
  { v: 'US-05', n: 'US-05 Analis' }
];

export const ME: Record<string, string> = {
  'US-02': 'Rizky Ananda',
  'US-04': 'Budi Santoso',
  'US-05': 'Lestari Wulandari'
};

export interface ModuleDef {
  id: string;
  en: string;
  roles: string[];
  rw?: string[];
  icon: string;
}

export const MODS: Record<string, ModuleDef> = {
  home: { id: 'Beranda', en: 'Home', roles: ['US-02', 'US-04', 'US-05'], icon: I.home },
  katalog: { id: 'Katalog Produk', en: 'Product Catalog', roles: ['US-02', 'US-04', 'US-05'], rw: ['US-02'], icon: I.box },
};

export const NAVORDER = ['home', 'katalog'];

export interface ScreenDef {
  h: string;
  c: string;
  id: string;
  en: string;
  m: string;
  v: string;
  p: string;
}

export const SCREENS: ScreenDef[] = [
  { h: '/masuk', c: 'SCR-WEB-01', id: 'Masuk Admin', en: 'Admin Sign-in', m: 'akun', v: 'login', p: 'Autentikasi pengguna internal' },
  { h: '/beranda', c: 'SCR-WEB-02', id: 'Beranda Admin', en: 'Admin Home', m: 'home', v: 'home', p: 'Ringkasan operasional & navigasi' },
  { h: '/produk', c: 'SCR-WEB-03', id: 'Daftar Produk', en: 'Product List', m: 'katalog', v: 'table', p: 'Menelusuri katalog' },
  { h: '/produk/form', c: 'SCR-WEB-04', id: 'Form SKU', en: 'SKU Form', m: 'katalog', v: 'form', p: 'Mendaftarkan / menyunting produk' },
  { h: '/produk/foto', c: 'SCR-WEB-05', id: 'Foto Referensi & Editor', en: 'Reference Photos & Editor', m: 'katalog', v: 's05', p: 'Mengunggah dan menyunting foto' },
  { h: '/produk/detail', c: 'SCR-WEB-06', id: 'Detail Produk', en: 'Product Detail', m: 'katalog', v: 's06', p: 'Melihat & mengelola satu SKU' },
];

export const GAPS: Record<string, string> = {};

export const L = {
  id: {
    search: 'Cari produk, masjid, restoran…',
    roleLbl: 'Peran',
    stateDemo: 'State:',
    shortcuts: 'Pintasan modul',
    loading: 'Memuat data…',
    emptyT: 'Belum ada data',
    errorT: 'Gagal memuat data',
    errorD: 'Permintaan ke layanan tidak berhasil. Coba lagi atau hubungi administrator sistem.',
    retry: 'Coba lagi',
    deniedT: 'Tidak ada izin akses',
    toHome: 'Ke Beranda Admin',
    save: 'Simpan',
    cancel: 'Batal',
    saveT: 'Tindakan',
    stD: 'Data',
    stK: 'Kosong',
    stL: 'Memuat',
    stG: 'Galat'
  },
  en: {
    search: 'Search products, mosques, restaurants…',
    roleLbl: 'Role',
    stateDemo: 'State:',
    shortcuts: 'Module shortcuts',
    loading: 'Loading data…',
    emptyT: 'No data yet',
    errorT: 'Failed to load data',
    errorD: 'The request to the service did not succeed. Retry or contact the system administrator.',
    retry: 'Retry',
    deniedT: 'No access permission',
    toHome: 'To admin home',
    save: 'Save',
    cancel: 'Cancel',
    saveT: 'Actions',
    stD: 'Data',
    stK: 'Empty',
    stL: 'Loading',
    stG: 'Error'
  }
};
