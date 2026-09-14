
const I = {
  home:'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  box:'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  file:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  users:'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M22 20v-2a4 4 0 0 0-3-3.9',
  mosque:'M12 3c2 2 3 3.4 3 5H9c0-1.6 1-3 3-5M5 21V11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10M3 21h18M10 21v-5a2 2 0 0 1 4 0v5',
  fork:'M4 3v7a3 3 0 0 0 6 0V3M7 10v11M17 3c-1.5 1.5-2 3-2 5v4h4V8c0-2-.5-3.5-2-5M17 12v9',
  chart:'M3 3v18h18M7 15v3M12 10v8M17 6v12',
  ads:'M3 11v3a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1M19 9a3 3 0 0 1 0 6',
  star:'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.9-5.2 2.9 1-5.9L3.5 9.7l5.9-.8z',
  user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  layers:'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5',
  camera:'M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7.5V12l3 2',
  img:'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1M3 16l5-4 4 3 3-2 6 4M9.5 9a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4',
  shield:'M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z',
  coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M9.5 9.5A2.5 2.5 0 0 1 12 8h1M9 12h5M9 14.5h4.5'
};

const CH = {
  verified:{id:'Terverifikasi',en:'Verified',g:'\u25cf',gc:'var(--sah-blue-strong)',bg:'var(--sah-mist-soft)',bd:'var(--sah-mist)'},
  unverified:{id:'Belum terverifikasi',en:'Not verified',g:'\u25cb',gc:'var(--sah-muted)',bg:'var(--sah-sand)',bd:'var(--sah-line)'},
  community:{id:'Rekomendasi komunitas',en:'Community recommendation',g:'\u25d0',gc:'var(--sah-copper-dark)',bg:'var(--sah-copper-pale)',bd:'var(--sah-line)'},
  ok:{id:'Aktif',en:'Active',g:'\u25cf',gc:'var(--sah-blue-strong)',bg:'var(--sah-mist-soft)',bd:'var(--sah-mist)'},
  wait:{id:'Menunggu',en:'Pending',g:'\u25cb',gc:'var(--sah-copper)',bg:'var(--sah-copper-pale)',bd:'var(--sah-line)'},
  draft:{id:'Draf',en:'Draft',g:'\u25cb',gc:'var(--sah-muted)',bg:'rgba(23,36,58,.05)',bd:'var(--sah-line)'},
  bad:{id:'Ditolak',en:'Rejected',g:'\u25cf',gc:'var(--danger)',bg:'rgba(168,95,79,.12)',bd:'var(--sah-line)'}
};

const ROLES = [
  {v:'US-02',n:'US-02 Administrator Konten'},{v:'US-04',n:'US-04 Administrator Sistem'},{v:'US-05',n:'US-05 Analis'}
];

const RBAC_MODS = [
  'Katalog produk','Riwayat pemindaian','Konten (kisah, berita, banner, statis)','Iklan & sponsor',
  'Akun pengguna internal','Akun konsumen','Data masjid','Klaim kepengurusan masjid','Agenda kajian',
  'Direktori restoran','Check-in restoran','Catatan & badge pengamatan','Aturan Poin Amal',
  'Percakapan AI','Dashboard analitik'
];
const RBAC_DEFAULT = {
  'US-02':[[1,1,1,1,null],[null,1,null,null,null],[1,1,1,1,1],[1,1,1,1,1],[0,0,0,0,null],[0,1,0,0,null],
    [1,1,1,1,null],[null,1,null,null,1],[null,1,1,1,1],[1,1,1,1,1],[null,1,null,1,null],[null,1,1,1,1],
    [null,0,0,null,null],[null,0,null,null,null],[null,0,null,null,null]],
  'US-04':[[0,0,0,0,null],[null,1,null,null,null],[0,0,0,0,0],[0,0,0,0,1],[1,1,1,1,null],[1,1,1,1,null],
    [1,1,1,1,null],[null,1,null,null,0],[null,1,0,0,0],[0,1,0,0,0],[null,1,null,0,null],[null,0,0,0,0],
    [null,1,1,null,null],[null,0,null,null,null],[null,1,null,null,null]],
  'US-05':[[null,1,null,null,null],[null,1,null,null,null],[null,1,null,null,null],[null,0,null,null,0],
    [null,0,null,null,null],[null,0,null,null,null],[null,0,null,null,null],[null,0,null,null,0],
    [null,0,null,null,0],[null,1,null,null,0],[null,1,null,0,null],[null,1,null,null,0],
    [null,0,null,null,null],[null,1,null,null,null],[null,1,null,null,null]]
};
const RBAC_NOTES = {'US-05':{'11-1':'agregat','13-1':'agregat'}};
const ME = {'US-02':'Rizky Ananda','US-04':'Budi Santoso','US-05':'Lestari Wulandari'};

const L = {
  id:{search:'Cari produk, masjid, restoran…',roleLbl:'Peran',stateDemo:'State:',shortcuts:'Pintasan modul',loading:'Memuat data…',emptyT:'Belum ada data',errorT:'Gagal memuat data',errorD:'Permintaan ke layanan tidak berhasil. Coba lagi atau hubungi administrator sistem.',retry:'Coba lagi',deniedT:'Tidak ada izin akses',toHome:'Ke Beranda Admin',save:'Simpan',cancel:'Batal',saveT:'Tindakan',stD:'Data',stK:'Kosong',stL:'Memuat',stG:'Galat'},
  en:{search:'Search products, mosques, restaurants…',roleLbl:'Role',stateDemo:'State:',shortcuts:'Module shortcuts',loading:'Loading data…',emptyT:'No data yet',errorT:'Failed to load data',errorD:'The request to the service did not succeed. Retry or contact the system administrator.',retry:'Retry',deniedT:'No access permission',toHome:'To admin home',save:'Save',cancel:'Cancel',saveT:'Actions',stD:'Data',stK:'Empty',stL:'Loading',stG:'Error'}
};

const MODS = {
  home:{id:'Beranda',en:'Home',roles:['US-02','US-04','US-05'],icon:I.home},
  katalog:{id:'Katalog Produk',en:'Product Catalog',roles:['US-02','US-04','US-05'],rw:['US-02'],icon:I.box},
  konten:{id:'Konten & Banner',en:'Content & Banners',roles:['US-02','US-05'],rw:['US-02'],icon:I.file},
  pengguna:{id:'Pengguna',en:'Users',roles:['US-04','US-02'],rw:['US-04'],icon:I.users},
  masjid:{id:'Masjid & Kajian',en:'Mosques & Study Sessions',roles:['US-04','US-02'],rw:['US-02','US-04'],icon:I.mosque},
  restoran:{id:'Restoran & Kurasi',en:'Restaurants & Curation',roles:['US-04','US-05','US-02'],rw:['US-02'],icon:I.fork},
  analitik:{id:'Analitik',en:'Analytics',roles:['US-04','US-05'],rw:['US-04','US-05'],icon:I.chart},
  iklan:{id:'Iklan & Sponsor',en:'Ads & Sponsors',roles:['US-02'],rw:['US-02'],icon:I.ads},
  komunitas:{id:'Review & Poin',en:'Reviews & Points',roles:['US-04','US-02'],rw:['US-02','US-04'],icon:I.star},
  akun:{id:'Akun',en:'Account',roles:['US-02','US-04','US-05'],icon:I.user}
};

const GAPS = {
  '#/pengguna/konsumen':'[GAP PRD: matriks RBAC §3.3 memberi US-07 Kurator hak R pada akun konsumen, namun tidak menyebut siapa yang berhak memproses permintaan penghapusan akun — di sini diasumsikan hanya US-04.]',
  '#/masjid/klaim':'[GAP PRD: tenggat keputusan klaim kepengurusan belum ditetapkan (isu #15, LM-10). Kolom "Usia pengajuan" memakai ambang sementara 5 hari kerja untuk penanda melewati tenggat.]',
  '#/iklan':'[GAP PRD: modul Iklan tercantum pada matriks RBAC §3.3 yang sudah ditata ulang, dipetakan ke US-02 Administrator Konten (BR-33: brand didaftarkan sebagai pengiklan; tingkat menentukan klasifikasi materi saja, penempatan tayang diatur aplikasi mobile).]',
  '#/komunitas/poin':'[GAP PRD: FR-PTS-02 tidak menetapkan siapa yang berhak mengubah nilai poin. Diasumsikan US-04 Sistem, dengan jejak audit ENT-29.]'
};

const SCREENS = [
  {h:'#/masuk',c:'SCR-WEB-01',id:'Masuk Admin',en:'Admin Sign-in',m:'akun',v:'login',p:'Autentikasi pengguna internal'},
  {h:'#/beranda',c:'SCR-WEB-02',id:'Beranda Admin',en:'Admin Home',m:'home',v:'home',p:'Ringkasan operasional & navigasi'},
  {h:'#/produk',c:'SCR-WEB-03',id:'Daftar Produk',en:'Product List',m:'katalog',v:'table',p:'Menelusuri katalog'},
  {h:'#/produk/form',c:'SCR-WEB-04',id:'Form SKU',en:'SKU Form',m:'katalog',v:'form',p:'Mendaftarkan / menyunting produk'},
  {h:'#/produk/foto',c:'SCR-WEB-05',id:'Foto Referensi & Editor',en:'Reference Photos & Editor',m:'katalog',v:'s05',p:'Mengunggah dan menyunting foto'},
  {h:'#/produk/detail',c:'SCR-WEB-06',id:'Detail Produk',en:'Product Detail',m:'katalog',v:'s06',p:'Melihat & mengelola satu SKU'},
  {h:'#/produk/pemindaian',c:'SCR-WEB-07',id:'Riwayat Pemindaian',en:'Scan History',m:'katalog',v:'table',p:'Rujukan operasional'},
  {h:'#/konten',c:'SCR-WEB-08',id:'Daftar Konten',en:'Content List',m:'konten',v:'table',p:'Mengelola materi'},
  {h:'#/konten/editor',c:'SCR-WEB-09',id:'Editor Konten',en:'Content Editor',m:'konten',v:'s09',p:'Menyusun & menerbitkan'},
  {h:'#/konten/banner',c:'SCR-WEB-10',id:'Kelola Banner',en:'Manage Banners',m:'konten',v:'s10',p:'Mengatur carousel dashboard'},
  {h:'#/pengguna',c:'SCR-WEB-11',id:'Daftar Pengguna Internal',en:'Internal Users',m:'pengguna',v:'table',p:'Mengelola akun staf'},
  {h:'#/pengguna/form',c:'SCR-WEB-12',id:'Form Pengguna & Peran',en:'User & Role Form',m:'pengguna',v:'form',p:'Menetapkan hak akses'},
  {h:'#/pengguna/konsumen',c:'SCR-WEB-13',id:'Daftar Akun Konsumen',en:'Consumer Accounts',m:'pengguna',v:'table',p:'Mengelola akun pengguna aplikasi'},
  {h:'#/pengguna/hak-akses',c:'SCR-WEB-34',id:'Peran & Hak Akses',en:'Roles & Permissions',m:'pengguna',v:'s34',p:'Menyunting matriks hak akses per peran'},
  {h:'#/masjid/klaim',c:'SCR-WEB-14',id:'Antrean Klaim Kepengurusan',en:'Mosque Claim Queue',m:'masjid',v:'table',p:'Memproses klaim pengurus masjid'},
  {h:'#/masjid/keputusan',c:'SCR-WEB-15',id:'Keputusan Klaim',en:'Claim Decision',m:'masjid',v:'s15',p:'Menyetujui / menolak klaim'},
  {h:'#/masjid',c:'SCR-WEB-16',id:'Daftar Masjid',en:'Mosque List',m:'masjid',v:'table',p:'Data induk masjid'},
  {h:'#/masjid/form',c:'SCR-WEB-17',id:'Form Masjid',en:'Mosque Form',m:'masjid',v:'form',p:'Menambah / menyunting masjid'},
  {h:'#/masjid/kajian',c:'SCR-WEB-18',id:'Moderasi Kajian',en:'Study Session Moderation',m:'masjid',v:'s18',p:'Meninjau agenda kajian'},
  {h:'#/kurasi',c:'SCR-WEB-19',id:'Antrean Kurasi Restoran & Laporan',en:'Restaurant Curation & Reports Queue',m:'restoran',v:'table',p:'Memproses kontribusi & laporan'},
  {h:'#/kurasi/keputusan',c:'SCR-WEB-20',id:'Keputusan Kurasi Restoran',en:'Restaurant Curation Decision',m:'restoran',v:'s20',p:'Memutuskan status restoran'},
  {h:'#/restoran',c:'SCR-WEB-21',id:'Daftar Restoran',en:'Restaurant List',m:'restoran',v:'table',p:'Data induk restoran'},
  {h:'#/analitik/eksposur',c:'SCR-WEB-24',id:'Analitik — Eksposur Produk',en:'Analytics — Product Exposure',m:'analitik',v:'table',p:'Papan peringkat eksposur berbasis sesi'},
  {h:'#/analitik/tren',c:'SCR-WEB-25',id:'Analitik — Tren Pemindaian',en:'Analytics — Scan Trend',m:'analitik',v:'s25',p:'Volume menurut waktu'},
  {h:'#/analitik/berdampingan',c:'SCR-WEB-26',id:'Analitik — Produk Berdampingan',en:'Analytics — Co-occurring Products',m:'analitik',v:'s26',p:'Produk yang muncul bersama'},
  {h:'#/analitik/kualitas',c:'SCR-WEB-27',id:'Analitik — Kualitas Pengenalan',en:'Analytics — Recognition Quality',m:'analitik',v:'table',p:'Mengidentifikasi kemasan sulit dikenali'},
  {h:'#/akun',c:'SCR-WEB-28',id:'Profil & Kata Sandi',en:'Profile & Password',m:'akun',v:'s28',p:'Akun sendiri'},
  {h:'#/iklan',c:'SCR-WEB-29',id:'Kelola Iklan & Sponsor',en:'Manage Ads & Sponsors',m:'iklan',v:'table',p:'Menyusun materi iklan menurut tingkat sponsorship'},
  {h:'#/iklan/form',c:'SCR-WEB-29',id:'Materi Iklan — Tambah/Sunting',en:'Ad Material — Add/Edit',m:'iklan',v:'form',p:'Menambah atau menyunting materi iklan'},
  {h:'#/iklan/performa',c:'SCR-WEB-30',id:'Laporan Performa Iklan',en:'Ad Performance Report',m:'iklan',v:'table',p:'Mengukur tayang & klik'},
  {h:'#/komunitas/catatan',c:'SCR-WEB-31',id:'Moderasi Catatan & Badge',en:'Notes & Badge Moderation',m:'komunitas',v:'s31',p:'Menjaga mutu kontribusi'},
  {h:'#/komunitas/poin',c:'SCR-WEB-32',id:'Aturan Poin Amal',en:'Charity Point Rules',m:'komunitas',v:'s32',p:'Menetapkan perolehan poin'}
];

const KAJIAN = [
  {n:'Kajian Tafsir Ba’da Maghrib',m:'Masjid Istiqlal, Jakarta Pusat',p:'Ustaz Hilmi Abdurrahman',w:'Setiap Selasa · 18:30',note:'Berulang · 2 pengecualian tanggal',
   desc:'Kajian tafsir Surah Al-Baqarah, terbuka untuk umum. Peserta diminta membawa mushaf sendiri. Disiarkan juga melalui kanal masjid.',
   flags:['Judul dan penceramah terisi','Jadwal berulang beserta pengecualian tanggal terisi','Tidak memuat konten komersial','Masjid sudah memiliki pengurus terverifikasi']},
  {n:'Kelas Tahsin Pemula',m:'Masjid Salman ITB, Bandung',p:'Ustazah Nabila Hasna',w:'Setiap Sabtu · 08:00',note:'Berulang',
   desc:'Kelas tahsin untuk pemula, dibatasi 30 peserta per angkatan. Pendaftaran melalui pengurus masjid.',
   flags:['Judul dan penceramah terisi','Jadwal berulang terisi','Tidak memuat konten komersial','Masjid sudah memiliki pengurus terverifikasi']},
  {n:'Kajian Fikih Muamalah',m:'Masjid Raya Bandung',p:'Ustaz Rahmat Hidayat',w:'20 Apr 2026 · 19:30',note:'Sekali',
   desc:'Pembahasan fikih muamalah kontemporer. Sesi tanya jawab pada 30 menit terakhir.',
   flags:['Judul dan penceramah terisi','Jadwal sekali terisi','Tidak memuat konten komersial','Masjid sudah memiliki pengurus terverifikasi']},
  {n:'Halaqah Subuh Ahad',m:'Masjid Nasional Al-Akbar, Surabaya',p:'Ustaz Zainal Arifin',w:'Setiap Ahad · 05:30',note:'Berulang',
   desc:'Halaqah rutin ba’da Subuh. Materi mengikuti kurikulum takmir masjid.',
   flags:['Judul dan penceramah terisi','Jadwal berulang terisi','Tidak memuat konten komersial','Masjid belum memiliki pengurus terverifikasi']},
  {n:'Kajian Bahasa Arab Dasar',m:'Masjid Sultan, Singapura',p:'Ustaz Faisal Rahim',w:'Setiap Rabu · 20:00',note:'Berulang',
   desc:'Kelas bahasa Arab dasar dua bahasa (Indonesia & Inggris) untuk komunitas perantau.',
   flags:['Judul dan penceramah terisi','Jadwal berulang terisi','Tidak memuat konten komersial','Masjid sudah memiliki pengurus terverifikasi']},
  {n:'Pengajian Pekanan Ibu-Ibu',m:'Masjid Pusdai Jawa Barat, Bandung',p:'Ustazah Sri Mulyani',w:'Setiap Kamis · 15:30',note:'Draf pengurus',
   desc:'Pengajian pekanan. Deskripsi masih berupa draf dan belum mencantumkan lokasi ruang.',
   flags:['Judul dan penceramah terisi','Jadwal berulang terisi','Deskripsi belum lengkap','Masjid nonaktif pada data induk']}
];

const NAVORDER = ['home','katalog','konten','pengguna','masjid','restoran','analitik','iklan','komunitas','akun'];

class Component extends DCLogic {
  state = {route:'#/masuk', role:'US-04', lang:'id', ds:'data', toast:null,
    ph:{num:'',time:'',name:'',concl:''}, reason:'', ev:'', evNote:'', locked:false, kajian:0,
    iklanLevel:'wait', iklanCategory:'food', iklanAction:'internal', iklanHalalCert:null, iklanHalalErr:false,
    rbacTab:'US-02', rbac:JSON.parse(JSON.stringify(RBAC_DEFAULT))};

  setPh(k,v){ this.setState(s=>({ph:Object.assign({},s.ph,{[k]:v})})); }

  componentDidMount(){
    const sync = () => {
      const h = location.hash || '#/masuk';
      this.setState({route:h, ds:'data'});
    };
    window.addEventListener('hashchange', sync);
    this._sync = sync; sync();
  }
  componentWillUnmount(){ window.removeEventListener('hashchange', this._sync); }

  fire(msg){ clearTimeout(this._tt); this.setState({toast:msg}); this._tt = setTimeout(()=>this.setState({toast:null}), 2600); }
  toggleRbac(row,col){
    this.setState(s=>{
      const copy = JSON.parse(JSON.stringify(s.rbac));
      if (copy[s.rbacTab][row][col]===null) return s;
      copy[s.rbacTab][row][col] = copy[s.rbacTab][row][col] ? 0 : 1;
      return {rbac:copy};
    });
  }
  resetRbacTab(){
    this.setState(s=>{
      const copy = JSON.parse(JSON.stringify(s.rbac));
      copy[s.rbacTab] = JSON.parse(JSON.stringify(RBAC_DEFAULT[s.rbacTab]));
      return {rbac:copy};
    });
    this.fire('Dikembalikan ke status bawaan.');
  }
  submitIklan(){
    if (this.state.iklanCategory==='food' && !this.state.iklanHalalCert){ this.setState({iklanHalalErr:true}); return; }
    this.setState({iklanHalalErr:false});
    this.fire('Materi diajukan untuk persetujuan.');
  }
  nav(h){ location.hash = h; this.setState({route:h, ds:'data'}); }

  cur(){ return SCREENS.find(s=>s.h===this.state.route) || SCREENS[1]; }
  allowed(s){ const m = MODS[s.m]; return !m || m.roles.indexOf(this.state.role) >= 0; }
  chip(kind, label){ const d = CH[kind]||CH.draft; return {isChip:true,isText:false,al:'left',text:label||d[this.state.lang],g:d.g,gc:d.gc,bg:d.bg,bd:d.bd}; }
  cell(raw){
    if (raw && typeof raw === 'object') return Object.assign({isChip:false,isText:true,al:'left',fg:'var(--sah-navy)',fw:'400',ff:"'DM Sans'",fs:'13px'}, raw);
    const s = String(raw==null?'':raw);
    if (s.charAt(0)==='@'){ const i = s.indexOf(':'); return this.chip(s.slice(1,i<0?s.length:i), i<0?null:s.slice(i+1)); }
    if (s.charAt(0)==='!') return {isChip:false,isText:true,al:'left',text:s.slice(1),fg:'var(--sah-navy)',fw:'600',ff:"'Plus Jakarta Sans'",fs:'13.5px'};
    if (s.charAt(0)==='~') return {isChip:false,isText:true,al:'left',text:s.slice(1),fg:'var(--sah-muted)',fw:'400',ff:"'DM Sans'",fs:'12.5px'};
    if (s.charAt(0)==='#') return {isChip:false,isText:true,al:'right',text:s.slice(1),fg:'var(--sah-navy)',fw:'600',ff:"'Plus Jakarta Sans'",fs:'13.5px'};
    return {isChip:false,isText:true,al:'left',text:s,fg:'var(--sah-navy)',fw:'400',ff:"'DM Sans'",fs:'13px'};
  }

  tables(){
    const g = (h,l)=>({label:l,go:()=>this.nav(h)});
    return {
      '#/iklan':{ph:'Cari nama materi atau brand…',filters:['Tingkat','Status persetujuan','Negara–kota'],actions:[{label:'+ Materi Baru',bg:'var(--sah-copper)',fg:'var(--sah-white)',bd:'var(--sah-copper)',go:()=>this.nav('#/iklan/form')}],
        cols:[['Materi','auto'],['Brand pengiklan','160px'],['Tingkat','110px'],['Jadwal tayang','160px'],['Penargetan','170px'],['Status persetujuan','150px'],['Sertifikat halal','150px'],['','100px','right']],
        rows:[
          ['!Bango — Resep Nusantara','Bango','@ok:Diamond','1–31 Mar 2026','Indonesia · semua kota','@ok:Disetujui','@verified:Aktif'],
          ['!Sania — Dapur Sehat','Sania','@wait:Gold','1–31 Mar 2026','Semua wilayah','@wait:Diajukan','@verified:Aktif'],
          ['!Wong Solo — Ayam Bakar','Wong Solo','@draft:Silver','1–30 Apr 2026','Indonesia · Jakarta','@draft:Draf','@bad:Tidak ada'],
          ['!Kapal Api — Pagi Bersama','Kapal Api','@ok:Diamond','1–31 Mar 2026','Semua wilayah','@ok:Disetujui','~—'],
          ['!Frisian Flag — Tumbuh Kuat','Frisian Flag','@wait:Gold','1–30 Apr 2026','Indonesia · semua kota','@ok:Disetujui','@verified:Aktif'],
          ['!Roma — Bekal Sekolah','Roma','@bad:Bronze','1–31 Mar 2026','Indonesia · Bandung','@bad:Ditolak','@bad:Tidak ada'],
          ['!Maimunah — Rasa Singapura','Maimunah','@draft:Silver','1–30 Apr 2026','Singapura','@wait:Diajukan','@verified:Aktif'],
          ['!ABC — Pedas Seimbang','ABC','@bad:Bronze','1–31 Mar 2026','Indonesia · semua kota','@draft:Draf','@verified:Aktif']
        ],
        acts:[g('#/iklan/form','Sunting')], total:'8', empty:'Belum ada materi iklan. Klik "+ Materi Baru" untuk menambahkan.',
        note:'Tingkat menentukan klasifikasi materi iklan saja. Kapan & di mana iklan tayang ditentukan aturan aplikasi mobile, bukan dikonfigurasi di sini (BR-33).'},

      '#/produk':{ph:'Cari SKU, nama produk, produsen…',filters:['Status halal','Status indeks','Produsen'],actions:[{label:'+ Tambah SKU',bg:'var(--sah-copper)',fg:'var(--sah-white)',bd:'var(--sah-copper)',go:()=>this.nav('#/produk/form')}],
        cols:[['Kode SKU','150px'],['Produk','auto'],['Produsen','200px'],['Status halal','170px'],['Status indeks','160px'],['','120px','right']],
        rows:[
          ['!SKU-100241',{text:'Kecap Manis Bango 275 ml',sub:'Terdaftar 12 Jan 2026'},'Unilever Indonesia','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100258',{text:'Indomie Goreng Rendang',sub:'Terdaftar 14 Jan 2026'},'Indofood CBP','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100311',{text:'Teh Kotak Jasmine 300 ml',sub:'Terdaftar 21 Jan 2026'},'Ultrajaya Milk','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100377',{text:'Biskuit Roma Kelapa 300 g',sub:'Terdaftar 2 Feb 2026'},'Mayora Indah','@verified:Halal terverifikasi','@wait:Menunggu indeks'],
          ['!SKU-100402',{text:'Minyak Goreng Sania 2 L',sub:'Terdaftar 9 Feb 2026'},'Wilmar Nabati','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100455',{text:'Susu Bendera UHT 1 L',sub:'Terdaftar 17 Feb 2026'},'Frisian Flag Indonesia','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100488',{text:'Sambal ABC Extra Pedas 335 ml',sub:'Terdaftar 24 Feb 2026'},'Heinz ABC Indonesia','@verified:Halal terverifikasi','@bad:Galat ekstraksi'],
          ['!SKU-100503',{text:'Wafer Richeese Nabati 50 g',sub:'Terdaftar 3 Mar 2026'},'Kaldu Sari Nabati','@wait:Sertifikat diperbarui','@wait:Menunggu indeks'],
          ['!SKU-100544',{text:'Kopi Kapal Api Special 165 g',sub:'Terdaftar 11 Mar 2026'},'Santos Jaya Abadi','@verified:Halal terverifikasi','@ok:Terindeks'],
          ['!SKU-100577',{text:'Sari Roti Tawar Spesial',sub:'Terdaftar 18 Mar 2026'},'Nippon Indosari Corpindo','@verified:Halal terverifikasi','@ok:Terindeks']
        ],
        acts:[g('#/produk/detail','Detail'),g('#/produk/form','Sunting')], total:'1.284', empty:'Katalog masih kosong. Daftarkan SKU pertama melalui Form SKU (FR-CAT-02).'},

      '#/produk/pemindaian':{ph:'Cari SKU atau kode sesi…',filters:['Periode','Skor kemiripan','Sertakan data uji'],actions:[{label:'Ekspor CSV',bg:'var(--sah-white)',fg:'var(--sah-navy)',bd:'var(--sah-line)',go:()=>this.fire('Ekspor riwayat pemindaian disiapkan.')}],
        cols:[['Gambar kueri','130px'],['Sesi','130px'],['Produk cocok','auto'],['Skor','90px','right'],['Waktu','170px'],['','110px','right']],
        rows:[
          [{text:'Kueri #A-8812',grad:1},'!SES-20260412-31','Kecap Manis Bango 275 ml','#0,94','12 Apr 2026 · 08:14'],
          [{text:'Kueri #A-8813'},'!SES-20260412-31','Indomie Goreng Rendang','#0,91','12 Apr 2026 · 08:15'],
          [{text:'Kueri #A-8830'},'!SES-20260412-44','Teh Kotak Jasmine 300 ml','#0,88','12 Apr 2026 · 09:02'],
          [{text:'Kueri #A-8841'},'!SES-20260412-51','Wafer Richeese Nabati 50 g','#0,71','12 Apr 2026 · 09:47'],
          [{text:'Kueri #A-8855'},'!SES-20260412-58','~Tidak ada kandidat di atas ambang','#0,42','12 Apr 2026 · 10:20'],
          [{text:'Kueri #A-8871'},'!SES-20260412-63','Minyak Goreng Sania 2 L','#0,96','12 Apr 2026 · 11:03'],
          [{text:'Kueri #A-8888'},'!SES-20260412-70','Susu Bendera UHT 1 L','#0,90','12 Apr 2026 · 11:38'],
          [{text:'Kueri #A-8902'},'!SES-20260412-77','Sambal ABC Extra Pedas 335 ml','#0,84','12 Apr 2026 · 12:15'],
          [{text:'Kueri #A-8917'},'!SES-20260412-82','Kopi Kapal Api Special 165 g','#0,93','12 Apr 2026 · 13:04']
        ],
        acts:[g('#/produk/detail','Produk')], total:'92.417', empty:'Belum ada pemindaian pada periode ini.'},

      '#/konten':{ph:'Cari judul konten…',filters:['Jenis','Status','Penulis'],actions:[{label:'+ Konten baru',bg:'var(--sah-copper)',fg:'var(--sah-white)',bd:'var(--sah-copper)',go:()=>this.nav('#/konten/editor')}],
        cols:[['Judul','auto'],['Jenis','150px'],['Status','140px'],['Penulis','180px'],['Diubah','160px'],['','120px','right']],
        rows:[
          [{text:'Mengenal Logo Halal Indonesia',sub:'Kisah · kategori Berita'},'Kisah','@ok:Terbit','Dinar Prameswari','12 Apr 2026 · 09:10'],
          [{text:'Panduan Membaca Nomor Sertifikat'},'Artikel edukasi','@ok:Terbit','Ratna Dewi','10 Apr 2026 · 16:44'],
          [{text:'Restoran Halal di Tokyo: Catatan Perjalanan'},'Kisah','@draft:Draf','Dinar Prameswari','9 Apr 2026 · 11:02'],
          [{text:'Kebijakan Privasi'},'Halaman statis','@ok:Terbit · v4','Budi Santoso','2 Apr 2026 · 08:30'],
          [{text:'Syarat & Ketentuan'},'Halaman statis','@ok:Terbit · v6','Budi Santoso','2 Apr 2026 · 08:28'],
          [{text:'Tanya Jawab Pindai Ingredient'},'FAQ','@wait:Menunggu tinjauan','Ratna Dewi','28 Mar 2026 · 14:19'],
          [{text:'Agenda Ramadan 1447 H'},'Kisah','@wait:Terjadwal 18 Apr','Dinar Prameswari','26 Mar 2026 · 10:55'],
          [{text:'Adab Berbagi Informasi Halal'},'Artikel keagamaan','@draft:Draf','Tim konten klien','20 Mar 2026 · 09:12']
        ],
        acts:[g('#/konten/editor','Sunting')], total:'146', empty:'Belum ada materi. Susun konten pertama melalui Editor Konten.'},

      '#/pengguna':{ph:'Cari nama atau email…',filters:['Peran','Status'],actions:[{label:'+ Tambah pengguna',bg:'var(--sah-copper)',fg:'var(--sah-white)',bd:'var(--sah-copper)',go:()=>this.nav('#/pengguna/form')}],
        cols:[['Nama','auto'],['Email kerja','250px'],['Peran','190px'],['Status','130px'],['Masuk terakhir','170px'],['','120px','right']],
        rows:[
          ['!Budi Santoso','budi.santoso@sahabathalal.id','US-04 Administrator Sistem','@ok:Aktif','12 Apr 2026 · 07:58'],
          ['!Rizky Ananda','rizky.ananda@sahabathalal.id','US-02 Administrator Konten','@ok:Aktif','12 Apr 2026 · 08:12'],
          ['!Dinar Prameswari','dinar.p@sahabathalal.id','US-02 Administrator Konten','@ok:Aktif','12 Apr 2026 · 09:05'],
          ['!Lestari Wulandari','lestari.w@sahabathalal.id','US-05 Analis','@ok:Aktif','11 Apr 2026 · 15:30'],
          ['!Arif Rahman','arif.rahman@sahabathalal.id','US-02 Administrator Konten','@ok:Aktif','12 Apr 2026 · 08:40'],
          ['!Nadia Puspita','nadia.p@sahabathalal.id','US-02 Administrator Konten','@ok:Aktif','12 Apr 2026 · 08:44'],
          ['!Fajar Nugroho','fajar.n@sahabathalal.id','US-02 Administrator Konten','@draft:Nonaktif','2 Feb 2026 · 13:21'],
          ['!Ratna Dewi','ratna.dewi@sahabathalal.id','US-02 Administrator Konten','@ok:Aktif','10 Apr 2026 · 16:50']
        ],
        acts:[g('#/pengguna/form','Sunting')], total:'14', empty:'Belum ada akun internal selain administrator awal.'},

      '#/pengguna/konsumen':{ph:'Cari email atau nama tampilan…',filters:['Status akun','Verifikasi email','Permintaan hapus'],actions:[],
        cols:[['Nama tampilan','auto'],['Email','250px'],['Verifikasi','150px'],['Status akun','160px'],['Terdaftar','150px'],['','200px','right']],
        rows:[
          ['!Ahmad Fauzi','ahmad.fauzi@mail.com','@ok:Terverifikasi','@ok:Aktif','4 Jan 2026'],
          ['!Rina Kartika','rina.kartika@mail.com','@ok:Terverifikasi','@ok:Aktif','11 Jan 2026'],
          ['!Bayu Prasetyo','bayu.p@mail.com','@wait:Menunggu','@ok:Aktif','19 Jan 2026'],
          ['!Dwi Lestari','dwi.lestari@mail.com','@ok:Terverifikasi','@bad:Ditangguhkan','2 Feb 2026'],
          ['!Hendra Gunawan','hendra.g@mail.com','@ok:Terverifikasi','@ok:Aktif','14 Feb 2026'],
          ['!Nur Aisyah','nur.aisyah@mail.com','@ok:Terverifikasi','@wait:Permintaan hapus','20 Feb 2026'],
          ['!Teguh Wibowo','teguh.w@mail.com','@ok:Terverifikasi','@ok:Aktif','1 Mar 2026'],
          ['!Maya Anggraini','maya.a@mail.com','@wait:Menunggu','@ok:Aktif','9 Mar 2026'],
          ['!Yusuf Hamdani','yusuf.h@mail.com','@ok:Terverifikasi','@ok:Aktif','22 Mar 2026']
        ],
        acts:[{label:'Tangguhkan',go:()=>this.fire('Akun konsumen ditangguhkan. Jejak audit dicatat (ENT-29).')},{label:'Proses hapus',go:()=>this.fire('Permintaan penghapusan akun diteruskan (FR-AUT-09).')}],
        total:'48.930', empty:'Belum ada akun konsumen terdaftar.',
        note:'Akun internal dan akun konsumen adalah dua realm terpisah (BR-36) — tidak ada kolom penghubung antar keduanya.'},

      '#/masjid/klaim':{ph:'Cari nama pengaju atau masjid…',filters:['Status','Usia pengajuan','Kota'],actions:[],
        cols:[['Pengaju','auto'],['Masjid diklaim','230px'],['Usia pengajuan','160px'],['Bukti','170px'],['Status','170px'],['','130px','right']],
        rows:[
          ['!Ahmad Fauzi','Masjid Istiqlal, Jakarta Pusat','@bad:8 hari · lewat tenggat','SK pengurus + KTP','@wait:Menunggu keputusan'],
          ['!Teguh Wibowo','Masjid Raya Bandung','@wait:5 hari','Surat tugas DKM','@wait:Menunggu keputusan'],
          ['!Nur Aisyah','Masjid Al-Akbar, Surabaya','~3 hari','SK pengurus','@wait:Menunggu keputusan'],
          ['!Hendra Gunawan','Masjid Sunda Kelapa, Jakarta','~2 hari','Foto papan pengurus','@wait:Menunggu keputusan'],
          ['!Rina Kartika','Masjid Salman ITB, Bandung','~1 hari','SK pengurus + KTP','@wait:Menunggu keputusan'],
          ['!Bayu Prasetyo','Masjid Cheng Ho, Surabaya','~1 hari','Keterangan takmir','@wait:Menunggu keputusan'],
          ['!Yusuf Hamdani','Masjid Sultan, Singapura','~6 hari','Surat MUIS','@ok:Disetujui'],
          ['!Maya Anggraini','Masjid Pusdai, Bandung','~9 hari','Tanpa lampiran','@bad:Ditolak'],
          ['!Dwi Lestari','Tokyo Camii, Tokyo','~11 hari','Surat pengurus','@ok:Disetujui']
        ],
        acts:[g('#/masjid/keputusan','Putuskan')], total:'23', empty:'Tidak ada klaim menunggu keputusan.'},

      '#/masjid':{ph:'Cari nama masjid atau alamat…',filters:['Kota','Status aktif','Penanda duplikat'],actions:[{label:'+ Tambah masjid',bg:'var(--sah-copper)',fg:'var(--sah-white)',bd:'var(--sah-copper)',go:()=>this.nav('#/masjid/form')}],
        cols:[['Nama masjid','auto'],['Alamat','260px'],['place_id','170px'],['Pengurus','160px'],['Status','150px'],['','120px','right']],
        rows:[
          ['!Masjid Istiqlal',{text:'Jl. Taman Wijaya Kusuma, Jakarta Pusat'},'~ChIJ…3f21','1 disetujui','@ok:Aktif'],
          ['!Masjid Raya Bandung',{text:'Jl. Dalem Kaum No. 14, Bandung'},'~ChIJ…9a04','1 disetujui','@ok:Aktif'],
          ['!Masjid Nasional Al-Akbar',{text:'Jl. Masjid Agung Timur, Surabaya'},'~ChIJ…5c77','—','@ok:Aktif'],
          ['!Masjid Sunda Kelapa',{text:'Jl. Taman Sunda Kelapa, Jakarta Pusat'},'~ChIJ…1b58','—','@ok:Aktif'],
          ['!Masjid Salman ITB',{text:'Jl. Ganesha No. 7, Bandung'},'~ChIJ…7e13','1 disetujui','@ok:Aktif'],
          ['!Masjid Cheng Ho Surabaya',{text:'Jl. Gading No. 2, Surabaya'},'~ChIJ…2d90','—','@wait:Duplikat terdeteksi'],
          ['!Masjid Sultan',{text:'3 Muscat St, Singapura'},'~ChIJ…8f42','1 disetujui','@ok:Aktif'],
          ['!Tokyo Camii',{text:'1-19 Oyamacho, Shibuya, Tokyo'},'~ChIJ…6b21','1 disetujui','@ok:Aktif'],
          ['!Masjid Agung Al-Azhar',{text:'Jl. Sisingamangaraja, Jakarta Selatan'},'~ChIJ…4a09','—','@ok:Aktif'],
          ['!Masjid Pusdai Jawa Barat',{text:'Jl. Diponegoro No. 63, Bandung'},'~ChIJ…0c66','—','@draft:Nonaktif']
        ],
        acts:[g('#/masjid/form','Sunting')], total:'812', empty:'Belum ada masjid tersimpan sebagai data rujukan.',
        note:'Atribut tempat tidak dipersistensi di luar cache singkat nama & koordinat (ENT-14, BR-21).'},

      '#/kurasi':{ph:'Cari restoran atau pelapor…',filters:['Jenis: pengajuan / laporan','Kurator penanggung jawab','Usia'],actions:[],
        cols:[['Entri','auto'],['Jenis','150px'],['Kota','150px'],['Usia','150px'],['Kurator','160px'],['Status','170px'],['','130px','right']],
        rows:[
          ['!Sop Buntut Bogor Cafe','Pengajuan baru','Jakarta Pusat','@bad:7 hari · lewat tenggat','Arif Rahman','@wait:Menunggu kurasi'],
          ['!Ramen Kobo Naruto','Pengajuan baru','Jakarta Selatan','@wait:4 hari','Nadia Puspita','@wait:Menunggu kurasi'],
          ['!Gyumon Halal Yakiniku','Pengajuan baru','Tokyo','~2 hari','Belum ditugaskan','@wait:Menunggu kurasi'],
          ['!Tanjong Rhu Prata House','Laporan konsumen','Singapura','~2 hari','Arif Rahman','@wait:Perlu tinjauan lanjut'],
          ['!Kedai Kopi Toko Djawa','Ambang check-in tercapai','Bandung','~1 hari','Otomatis','@community:Rekomendasi komunitas'],
          ['!Ayam Bakar Wong Solo','Pengajuan baru','Surabaya','~1 hari','Nadia Puspita','@wait:Menunggu kurasi'],
          ['!Warung Sate Maranggi','Pengajuan baru','Bandung','~1 hari','Arif Rahman','@wait:Pengajuan sendiri · terkunci'],
          ['!Hjh Maimunah Restaurant','Laporan konsumen','Singapura','~5 hari','Nadia Puspita','@ok:Selesai · terverifikasi'],
          ['!Naritaya Halal Ramen','Pengajuan baru','Tokyo','~6 hari','Arif Rahman','@ok:Selesai · terverifikasi'],
          ['!Bakmi Non Halal Sudirman','Laporan konsumen','Jakarta Selatan','~8 hari','Nadia Puspita','@bad:Ditolak · alasan tercatat']
        ],
        acts:[g('#/kurasi/keputusan','Putuskan')], total:'37', empty:'Antrean kurasi bersih. Tidak ada pengajuan atau laporan tertunda.'},

      '#/restoran':{ph:'Cari nama restoran…',filters:['Tingkat status','Negara','Jenis bukti'],actions:[],
        cols:[['Restoran','auto'],['Kota / Negara','190px'],['Tingkat status','230px'],['Jenis bukti tercatat','230px'],['Check-in unik','140px','right'],['','160px','right']],
        rows:[
          ['!Bebek Tepi Sawah','Jakarta Selatan · ID','@verified:Terverifikasi','Sertifikat halal resmi (BPJPH)','#41'],
          ['!Warung Nasi Ampera','Bandung · ID','@verified:Terverifikasi','Sertifikat halal resmi (BPJPH)','#63'],
          ['!Rumah Makan Sederhana','Surabaya · ID','@verified:Terverifikasi','Sertifikat halal resmi (BPJPH)','#58'],
          ['!Ayam Bakar Wong Solo','Surabaya · ID','@verified:Terverifikasi','Sertifikat halal resmi (BPJPH)','#37'],
          ['!Hjh Maimunah Restaurant','Singapura · SG','@verified:Terverifikasi','Sertifikat otoritas setempat (MUIS)','#88'],
          ['!Naritaya Halal Ramen','Tokyo · JP','@verified:Terverifikasi','Foto signage "100% Halal"','#24'],
          ['!Kedai Kopi Toko Djawa','Bandung · ID','@community:Rekomendasi komunitas','Ambang 10 check-in unik','#12'],
          ['!Tanjong Rhu Prata House','Singapura · SG','@community:Rekomendasi komunitas','Keputusan kurator langsung','#19'],
          ['!Sop Buntut Bogor Cafe','Jakarta Pusat · ID','@unverified:Belum terverifikasi','Belum ada bukti tercatat','#6'],
          ['!Ramen Kobo Naruto','Jakarta Selatan · ID','@unverified:Belum terverifikasi','Keterangan pemilik (belum cukup)','#3'],
          ['!Gyumon Halal Yakiniku','Tokyo · JP','@unverified:Belum terverifikasi','Belum ada bukti tercatat','#2']
        ],
        acts:[g('#/kurasi/keputusan','Tinjau'),{label:'Cabut verifikasi',go:()=>this.fire('Status terverifikasi dicabut — penanda hilang seketika di mobile (FR-MOD-08).')}],
        total:'1.106', empty:'Belum ada entri restoran pada direktori.',
        note:'Tiga tingkat status wajib dibedakan secara visual dan tekstual (BR-28). Entri belum terverifikasi tidak boleh disajikan sebagai restoran halal.'},

      '#/analitik/eksposur':{ph:'Cari produk…',filters:['Periode: 30 hari','Sertakan data uji: tidak','Platform'],actions:[{label:'Ekspor CSV',bg:'var(--sah-white)',fg:'var(--sah-navy)',bd:'var(--sah-line)',go:()=>this.fire('Ekspor papan peringkat eksposur disiapkan.')}],
        cols:[['#','60px'],['Produk','auto'],['Produsen','200px'],['Sesi eksposur','160px','right'],['Pangsa sesi','150px','right'],['Tren','120px'],['','110px','right']],
        rows:[
          [{text:'01',ff:"'Cormorant Garamond'",fs:'19px',fw:'600',fg:'var(--sah-copper-dark)'},'!Indomie Goreng Rendang','Indofood CBP','#8.412','#9,1%','@ok:Naik'],
          [{text:'02',ff:"'Cormorant Garamond'",fs:'19px',fw:'600',fg:'var(--sah-copper-dark)'},'!Kecap Manis Bango 275 ml','Unilever Indonesia','#6.980','#7,5%','@ok:Naik'],
          [{text:'03',ff:"'Cormorant Garamond'",fs:'19px',fw:'600',fg:'var(--sah-copper-dark)'},'!Minyak Goreng Sania 2 L','Wilmar Nabati','#5.331','#5,8%','@draft:Stabil'],
          ['04','!Teh Kotak Jasmine 300 ml','Ultrajaya Milk','#4.702','#5,1%','@draft:Stabil'],
          ['05','!Susu Bendera UHT 1 L','Frisian Flag Indonesia','#4.188','#4,5%','@bad:Turun'],
          ['06','!Sambal ABC Extra Pedas','Heinz ABC Indonesia','#3.907','#4,2%','@ok:Naik'],
          ['07','!Kopi Kapal Api Special','Santos Jaya Abadi','#3.554','#3,8%','@draft:Stabil'],
          ['08','!Biskuit Roma Kelapa 300 g','Mayora Indah','#2.910','#3,1%','@bad:Turun'],
          ['09','!Wafer Richeese Nabati 50 g','Kaldu Sari Nabati','#2.466','#2,7%','@ok:Naik'],
          ['10','!Sari Roti Tawar Spesial','Nippon Indosari','#2.201','#2,4%','@draft:Stabil']
        ],
        acts:[g('#/analitik/berdampingan','Berdampingan')], total:'1.284', empty:'Belum ada sesi eksposur pada periode terpilih.',
        note:'Eksposur dihitung per sesi pemindaian, bukan per frame (BR-09). Angka bersifat metrik, bukan nilai komersial.'},

      '#/analitik/kualitas':{ph:'Cari produk…',filters:['Periode: 30 hari','Ambang skor','Sisi kemasan'],actions:[{label:'Ekspor CSV',bg:'var(--sah-white)',fg:'var(--sah-navy)',bd:'var(--sah-line)',go:()=>this.fire('Ekspor tabel mutu pengenalan disiapkan.')}],
        cols:[['Produk','auto'],['Foto referensi','150px','right'],['Skor rata-rata','160px','right'],['Kueri gagal','140px','right'],['Diagnosis','230px'],['','120px','right']],
        rows:[
          ['!Wafer Richeese Nabati 50 g','#2','#0,63','#184','@bad:Kemasan mengilap'],
          ['!Sari Roti Tawar Spesial','#1','#0,66','#151','@bad:Kemasan transparan'],
          ['!Biskuit Roma Kelapa 300 g','#2','#0,71','#118','@wait:Foto sisi kurang'],
          ['!Sambal ABC Extra Pedas','#3','#0,74','#96','@wait:Label kecil'],
          ['!Teh Kotak Jasmine 300 ml','#4','#0,82','#54','@ok:Memadai'],
          ['!Susu Bendera UHT 1 L','#4','#0,85','#41','@ok:Memadai'],
          ['!Kopi Kapal Api Special','#5','#0,88','#28','@ok:Memadai'],
          ['!Kecap Manis Bango 275 ml','#6','#0,93','#12','@ok:Memadai']
        ],
        acts:[g('#/produk/foto','Foto referensi')], total:'1.284', empty:'Tidak ada produk di bawah ambang mutu pada periode ini.'},

      '#/iklan/performa':{ph:'Cari slot atau materi…',filters:['Periode: 30 hari','Tingkat','Negara–kota'],actions:[{label:'Ekspor CSV',bg:'var(--sah-white)',fg:'var(--sah-navy)',bd:'var(--sah-line)',go:()=>this.fire('Ekspor laporan performa iklan disiapkan.')}],
        cols:[['Materi iklan','auto'],['Tingkat','120px'],['Periode','170px'],['Tayang','130px','right'],['Klik','120px','right'],['Rasio klik','130px','right'],['','110px','right']],
        rows:[
          ['!Bango — Resep Nusantara','@ok:Diamond','1–31 Mar 2026','#412.880','#9.104','#2,20%'],
          ['!Sania — Dapur Sehat','@wait:Gold','1–31 Mar 2026','#298.140','#5.377','#1,80%'],
          ['!Wong Solo — Ayam Bakar','@draft:Silver','1–31 Mar 2026','#184.502','#4.981','#2,70%'],
          ['!Kapal Api — Pagi Bersama','@ok:Diamond','1–31 Mar 2026','#151.223','#2.116','#1,40%'],
          ['!Frisian Flag — Tumbuh Kuat','@wait:Gold','1–31 Mar 2026','#143.980','#3.311','#2,30%'],
          ['!Roma — Bekal Sekolah','@bad:Bronze','1–31 Mar 2026','#98.410','#1.279','#1,30%'],
          ['!Maimunah — Rasa Singapura','@draft:Silver','1–31 Mar 2026','#74.660','#2.239','#3,00%'],
          ['!ABC — Pedas Seimbang','@bad:Bronze','1–31 Mar 2026','#61.905','#928','#1,50%']
        ],
        acts:[g('#/iklan','Materi')], total:'34', empty:'Belum ada peristiwa tayang pada periode ini.',
        note:'Peristiwa iklan dicatat agregat tanpa identitas akun maupun perangkat (FR-ADS-06). Hanya metrik performa — tanpa nilai komersial.'}
    };
  }

  forms(){
    const st = this.state;
    const chipOpt = (label, on, dotG, dotColor, go) => ({label:label, dotG:dotG||'', dotColor:dotColor||'',
      bg:on?'var(--sah-copper-pale)':'var(--sah-ivory)', bd:on?'var(--sah-copper)':'var(--sah-line)',
      fg:on?'var(--sah-frame)':'var(--sah-muted)', go:go});
    const levelChip = (kind,label)=>{ const d = CH[kind]; const on = st.iklanLevel===kind;
      return {label:label, dotG:d.g, dotColor:d.gc, go:()=>this.setState({iklanLevel:kind}),
        bg:on?d.bg:'var(--sah-ivory)', bd:on?d.gc:'var(--sah-line)', fg:on?'var(--sah-frame)':'var(--sah-muted)'}; };
    const brands = ['Bango','Sania','Wong Solo','Kapal Api','Frisian Flag','Roma','Maimunah','ABC'];
    return {
      '#/iklan/form':{note:'Tingkat ditetapkan di sini sebagai atribut materi dan dikirim sebagai parameter ke API (GET /ads?level=...). Kapan & di mana iklan tayang diatur aplikasi mobile (BR-33).',
        meta:[{k:'Entitas',v:'ENT-31'},{k:'API',v:'API-ADS-01'},{k:'FR',v:'FR-ADS-04, -05, -08, -09'}],
        actions:[
          {label:'Simpan sebagai draf', go:()=>this.fire('Materi disimpan sebagai draf.'), bg:'var(--sah-white)', fg:'var(--sah-navy)', bd:'1px solid var(--sah-line)', r:'15px', h:'44px', jc:'flex-start', arrow:false, hoverStyle:'border-color:var(--sah-copper)'},
          {label:'Ajukan Persetujuan', go:()=>this.submitIklan(), bg:'var(--sah-copper)', fg:'var(--sah-white)', bd:'0', r:'16px', h:'46px', jc:'space-between', arrow:true, hoverStyle:'background:var(--sah-copper-pressed)'},
          ...(st.role==='US-04' ? [
            {label:'Setujui', go:()=>this.fire('Materi disetujui.'), bg:'var(--sah-blue-strong)', fg:'var(--sah-white)', bd:'0', r:'15px', h:'42px', jc:'flex-start', arrow:false, hoverStyle:'background:var(--sah-navy)'},
            {label:'Tolak', go:()=>this.fire('Materi ditolak.'), bg:'rgba(168,95,79,.12)', fg:'var(--danger)', bd:'1px solid var(--sah-line)', r:'15px', h:'42px', jc:'flex-start', arrow:false, hoverStyle:'border-color:var(--danger)'}
          ] : []),
          {label:'Batal', go:()=>this.nav('#/iklan'), bg:'var(--sah-white)', fg:'var(--sah-navy)', bd:'1px solid var(--sah-line)', r:'15px', h:'42px', jc:'flex-start', arrow:false, hoverStyle:'border-color:var(--sah-copper)'}
        ],
        sections:[
          {title:'Materi & brand',note:'Brand hanya dapat dipilih dari daftar terdaftar kurator (FR-ADS-12).',fields:[
            Object.assign({label:'Brand pengiklan',req:' *',isSelect:true,options:brands,value:'Sania',span:1},
              st.role==='US-02' ? {link:{label:'Daftarkan brand baru',go:()=>this.fire('Pendaftaran brand baru dicatat (mock).')}} : {}),
            {label:'Judul',req:' *',isText:true,value:'Sania — Dapur Sehat',span:1},
            {label:'Sub-judul',isText:true,value:'Minyak goreng untuk keluarga sehat',span:2},
            {label:'Materi gambar',isUpload:true,span:2}
          ]},
          {title:'Aksi & urutan tampil',note:'Menentukan yang terjadi saat materi diketuk pengguna.',fields:[
            {label:'Jenis aksi',isChips:true,span:2,chipOpts:[
              chipOpt('Buka layar internal aplikasi', st.iklanAction==='internal', '', '', ()=>this.setState({iklanAction:'internal'})),
              chipOpt('Buka tautan luar', st.iklanAction==='external', '', '', ()=>this.setState({iklanAction:'external'}))
            ]},
            {label: st.iklanAction==='internal' ? 'Pilih layar tujuan' : 'URL tujuan', req:' *', isText:true,
              value: st.iklanAction==='internal' ? 'SCR-APP-12 Kisah — Kapal Api' : 'https://sania.co.id/promo', span:1},
            {label:'Urutan tampil',isText:true,value:'2',span:1}
          ]},
          {title:'Jadwal tayang & penargetan',note:'Penargetan kosong berarti semua wilayah (FR-ADS-05).',fields:[
            {label:'Tanggal mulai',req:' *',isText:true,value:'1 Mar 2026',span:1},
            {label:'Tanggal berakhir',req:' *',isText:true,value:'31 Mar 2026',span:1},
            {label:'Negara',isSelect:true,options:['— semua negara —','Indonesia','Singapura','Jepang'],value:'Indonesia',span:1},
            {label:'Kota',isText:true,value:'',ph:'Kosongkan untuk semua kota',span:1}
          ]},
          {title:'Tingkat & kategori',note:'Tingkat menentukan klasifikasi materi. Kapan & di mana tayang diatur aplikasi mobile, bukan di sini.',fields:[
            Object.assign({label:'Tingkat',req:' *',isChips:true,span:2,chipOpts:[
              levelChip('ok','Diamond'), levelChip('wait','Gold'), levelChip('draft','Silver'), levelChip('bad','Bronze')
            ]}, {hint:'Tingkat menentukan klasifikasi materi. Kapan & di mana tayang diatur aplikasi mobile, bukan di sini.'}),
            {label:'Kategori materi',isChips:true,span:2,chipOpts:[
              chipOpt('Makanan/Restoran', st.iklanCategory==='food', '', '', ()=>this.setState({iklanCategory:'food'})),
              chipOpt('Lainnya', st.iklanCategory==='other', '', '', ()=>this.setState({iklanCategory:'other'}))
            ]},
            ...(st.iklanCategory==='food' ? [{label:'Sertifikat halal',req:' *',isSelect:true,span:2,
              options:['— pilih sertifikat aktif —','Sertifikat MUI-Sania #ID00410000123456791102 — aktif','Sertifikat MUI-Bango #ID00410000123456790125 — aktif'],
              hint:'Wajib memiliki sertifikat halal aktif — materi tanpa ini tidak dapat disetujui (BR-32).',
              err: st.iklanHalalErr ? 'Sertifikat halal wajib diisi sebelum diajukan (BR-32).' : ''}] : []),
            {label:'Status persetujuan (hanya-baca)',isText:true,value:'Diajukan',span:2,
              hint:'Status berubah melalui aksi Simpan draf / Ajukan / Setujui / Tolak, bukan disunting langsung.'}
          ]}
        ]},
      '#/produk/form':{note:'Nomor sertifikat dan masa berlaku dimasukkan sebagaimana adanya (OS-03). Perubahan status halal dicatat pada jejak audit ENT-29.',
        meta:[{k:'Entitas',v:'ENT-05, ENT-08'},{k:'API',v:'API-016, API-017'},{k:'FR',v:'FR-CAT-02, -04'}],
        sections:[
          {title:'Identitas produk',note:'Satu SKU dapat memiliki lebih dari satu foto referensi (AR-03).',fields:[
            {label:'Kode SKU',req:' *',value:'SKU-100241',span:1},
            {label:'Nama produk',req:' *',value:'Kecap Manis Bango 275 ml',span:1},
            {label:'Produsen',req:' *',value:'Unilever Indonesia',span:1},
            {label:'Kategori',type:'select',options:['Bumbu & saus','Makanan instan','Minuman','Roti & kue','Susu & olahan'],span:1},
            {label:'Deskripsi ringkas',type:'area',value:'Kecap manis kental berbahan kedelai hitam, kemasan botol plastik 275 ml.',span:2}
          ]},
          {title:'Sertifikat halal',note:'Status terverifikasi hanya boleh ditetapkan bila nomor sertifikat terisi.',fields:[
            {label:'Nomor sertifikat',req:' *',value:'ID00410000123456790125',span:1},
            {label:'Penerbit',type:'select',options:['BPJPH','MUI (legacy)','Otoritas halal negara setempat'],span:1},
            {label:'Tanggal terbit',value:'12 Januari 2026',span:1},
            {label:'Masa berlaku sampai',value:'11 Januari 2030',span:1},
            {label:'Status halal',type:'select',options:['Halal terverifikasi','Menunggu pembaruan sertifikat','Tidak bersertifikat'],span:1},
            {label:'Status indeks visual',type:'toggle',value:'Diindeks otomatis setelah foto diunggah',span:1,hint:'Penambahan SKU tidak memerlukan pelatihan ulang model (AR-01).'}
          ]}
        ]},
      '#/pengguna/form':{note:'Akun internal tidak dapat ditautkan ke akun konsumen (BR-36). Peran menentukan modul yang tampil pada sidebar (§3.3).',
        meta:[{k:'Entitas',v:'ENT-01, ENT-02'},{k:'API',v:'API-091, API-092'},{k:'FR',v:'FR-USR-01, -02'}],
        sections:[
          {title:'Identitas staf',note:'Email kerja dipakai sebagai pengenal masuk.',fields:[
            {label:'Nama lengkap',req:' *',value:'Nadia Puspita',span:1},
            {label:'Email kerja',req:' *',value:'nadia.p@sahabathalal.id',span:1},
            {label:'Unit kerja',value:'Tim AHT — Kurasi',span:1},
            {label:'Status akun',type:'toggle',value:'Aktif',span:1}
          ]},
          {title:'Peran & hak akses',note:'Satu pengguna dapat memegang lebih dari satu peran (ENT-01 N–N ENT-02).',fields:[
            {label:'Peran utama',req:' *',isSelect:true,options:['US-02 Administrator Konten','US-04 Administrator Sistem','US-05 Analis'],span:1},
            {label:'Peran tambahan',type:'select',options:['— tidak ada —','US-05 Analis (baca)'],span:1},
            {label:'Catatan pemberian akses',type:'area',value:'Ditunjuk sebagai kurator kedua sesuai AS-10 (1–2 kurator).',span:2}
          ]}
        ]},
      '#/masjid/form':{note:'Masjid dirujuk melalui place_id layanan peta; atribut tempat tidak dipersistensi (ENT-14, BR-21).',
        meta:[{k:'Entitas',v:'ENT-14'},{k:'API',v:'API-045, API-131'},{k:'FR',v:'FR-MSJ-10, FR-MOD-07'}],
        sections:[
          {title:'Data rujukan',note:'Koordinat dipilih dari peta; nama & koordinat disimpan sebagai cache singkat untuk pengurutan.',fields:[
            {label:'Nama masjid',req:' *',value:'Masjid Cheng Ho Surabaya',span:1},
            {label:'place_id',req:' *',value:'ChIJ…2d90',span:1},
            {label:'Alamat',value:'Jl. Gading No. 2, Genteng, Surabaya',span:2},
            {label:'Lintang',value:'-7,254120',span:1},
            {label:'Bujur',value:'112,745300',span:1},
            {label:'Negara',type:'select',options:['Indonesia','Singapura','Jepang'],span:1,hint:'Cakupan rilis ini: Indonesia, Singapura, Jepang (BR-30).'},
            {label:'Status aktif',type:'toggle',value:'Aktif',span:1}
          ]},
          {title:'Penanganan duplikat',note:'Sistem menandai kemungkinan duplikat sebelum penyimpanan (FR-MOD-07).',fields:[
            {label:'Kandidat duplikat',type:'select',options:['Masjid Muhammad Cheng Hoo — Jl. Gading 2 (kemiripan 0,91)','— tidak ada —'],span:2},
            {label:'Tindakan',type:'select',options:['Gabungkan ke entri terpilih','Simpan sebagai entri terpisah'],span:1},
            {label:'Alasan penggabungan',req:' *',value:'Nama berbeda ejaan, place_id dan koordinat identik.',span:1}
          ]}
        ]}
    };
  }

  renderVals(){
    const st = this.state, t = L[st.lang], s = this.cur(), lang = st.lang;
    const denied = s.v !== 'login' && !this.allowed(s);
    const mod = MODS[s.m] || {};
    const roLabel = mod.rw && mod.rw.indexOf(st.role) < 0;

    const nav = NAVORDER.map(k=>{
      const m = MODS[k];
      if (m.roles.indexOf(st.role) < 0) return null;
      const items = SCREENS.filter(x=>x.m===k && x.v!=='login').map(x=>({
        label:x[lang], href:x.h, icon:m.icon, num:x.c.replace('SCR-WEB-',''),
        bg: x.h===st.route ? 'rgba(197,138,99,.22)' : 'transparent',
        bd: x.h===st.route ? 'var(--sah-copper)' : 'transparent',
        fg: x.h===st.route ? 'var(--sah-white)' : 'rgba(255,253,248,.76)',
        fw: x.h===st.route ? '600' : '400'
      }));
      if (!items.length) return null;
      return {label:m[lang], items:items};
    }).filter(Boolean);

    const T = this.tables()[s.h] || {};
    const F0 = this.forms()[s.h] || {sections:[],meta:[],note:''};
    const defaultActions = [
      {label:t.save, go:()=>this.fire(lang==='id'?'Perubahan disimpan. Jejak audit dicatat (ENT-29).':'Changes saved. Audit trail recorded (ENT-29).'), bg:'var(--sah-copper)', fg:'var(--sah-white)', bd:'0', r:'16px', h:'46px', jc:'space-between', arrow:true, hoverStyle:'background:var(--sah-copper-pressed)'},
      {label:t.cancel, go:()=>history.length>1?history.back():this.nav('#/beranda'), bg:'var(--sah-white)', fg:'var(--sah-navy)', bd:'1px solid var(--sah-line)', r:'15px', h:'42px', jc:'flex-start', arrow:false, hoverStyle:''}
    ];
    const F = Object.assign({}, F0, {actions: F0.actions || defaultActions});
    const cols = (T.cols||[]).map(c=>({label:c[0],w:c[1],al:c[2]||'left'}));
    const rows = (T.rows||[]).map((r,i)=>({
      bg: i%2 ? 'rgba(23,36,58,.018)' : 'transparent',
      cells: r.map(c=>this.cell(c)),
      acts: (T.acts||[]).map(a=>({label:a.label,go:a.go,bg:'var(--sah-white)',fg:'var(--sah-navy)'}))
    }));

    const stateOpts = [['data',t.stD],['kosong',t.stK],['memuat',t.stL],['galat',t.stG]].map(o=>({
      n:o[1], go:()=>this.setState({ds:o[0]}),
      bg: st.ds===o[0] ? 'var(--sah-navy)' : 'transparent',
      fg: st.ds===o[0] ? 'var(--sah-white)' : 'var(--sah-muted)'
    }));

    const kpiRole = {
      'US-02':[{v:'1.284',l:'SKU aktif di katalog'},{v:'146',l:'Materi konten'},{v:'37',l:'Antrean kurasi & laporan'}],
      'US-04':[{v:'14',l:'Akun internal aktif'},{v:'23',l:'Klaim menunggu keputusan'},{v:'5',l:'Permintaan hapus akun'}],
      'US-05':[{v:'92.417',l:'Sesi pemindaian 30 hari'},{v:'0,84',l:'Skor kemiripan rata-rata'},{v:'8',l:'Produk di bawah ambang mutu'}]
    }[st.role];

    const queues = [
      {tag:'Klaim kepengurusan',code:'SCR-WEB-14',n:'23',t:'menunggu keputusan',d:'4 pengajuan melewati ambang 5 hari kerja.',pct:'62%',bar:'var(--sah-copper)',meta:'Verifikasi telepon wajib sebelum keputusan (FR-KAJ-13).',href:'#/masjid/klaim',roles:['US-04','US-02']},
      {tag:'Kurasi restoran',code:'SCR-WEB-19',n:'37',t:'pengajuan & laporan',d:'1 entri terkunci: pengaju adalah kurator sendiri.',pct:'78%',bar:'var(--sah-copper-dark)',meta:'Rubrik kurasi wajib dibaca di layar keputusan (FR-MOD-12).',href:'#/kurasi',roles:['US-04','US-05','US-02']},
      {tag:'Moderasi kajian',code:'SCR-WEB-18',n:'12',t:'agenda menunggu',d:'3 agenda berulang dengan pengecualian tanggal.',pct:'34%',bar:'var(--sah-blue-strong)',meta:'Setiap penolakan wajib beralasan (FR-MOD-02).',href:'#/masjid/kajian',roles:['US-04','US-02']},
      {tag:'Katalog produk',code:'SCR-WEB-03',n:'6',t:'SKU menunggu indeks',d:'2 SKU galat ekstraksi fitur visual.',pct:'22%',bar:'var(--sah-copper)',meta:'Penambahan SKU tanpa pelatihan ulang model (AR-01).',href:'#/produk',roles:['US-02','US-04','US-05']},
      {tag:'Konten & banner',code:'SCR-WEB-08',n:'3',t:'materi menunggu tinjauan',d:'7 dari 10 banner aktif terpakai.',pct:'70%',bar:'var(--sah-blue)',meta:'Batas banner aktif pada carousel adalah 10 (BR-18).',href:'#/konten',roles:['US-02','US-05']},
      {tag:'Moderasi catatan',code:'SCR-WEB-31',n:'9',t:'catatan dilaporkan',d:'2 catatan sudah disembunyikan sementara.',pct:'45%',bar:'var(--sah-copper-dark)',meta:'Poin atas kontribusi yang ditolak ditarik kembali (BR-27).',href:'#/komunitas/catatan',roles:['US-04','US-02']}
    ].filter(q=>q.roles.indexOf(st.role)>=0);

    const shortcuts = SCREENS.filter(x=>x.v!=='login' && this.allowed(x)).map(x=>({
      label:x[lang], code:x.c, href:x.h, icon:(MODS[x.m]||{}).icon || I.home
    }));

    return {
      t:t, role:st.role, roleOpts:ROLES, roleName:(ROLES.find(r=>r.v===st.role)||{}).n,
      meName:ME[st.role], meInit:(ME[st.role]||'').split(' ').map(w=>w[0]).join(''),
      setRole:e=>this.setState({role:e.target.value}),
      setId:()=>this.setState({lang:'id'}), setEn:()=>this.setState({lang:'en'}),
      idBg: lang==='id'?'var(--sah-navy)':'transparent', idFg: lang==='id'?'var(--sah-white)':'var(--sah-muted)',
      enBg: lang==='en'?'var(--sah-navy)':'transparent', enFg: lang==='en'?'var(--sah-white)':'var(--sah-muted)',
      login:()=>this.nav('#/beranda'), back:()=>history.length>1?history.back():this.nav('#/beranda'),
      save:()=>this.fire(lang==='id'?'Perubahan disimpan. Jejak audit dicatat (ENT-29).':'Changes saved. Audit trail recorded (ENT-29).'),
      retry:()=>this.setState({ds:'data'}), ping:()=>this.fire(lang==='id'?'3 notifikasi baru: 2 klaim masjid, 1 laporan restoran.':'3 new notifications: 2 mosque claims, 1 restaurant report.'),
      toast:st.toast, nav:nav,
      vLogin:s.v==='login', vApp:s.v!=='login',
      vDenied:denied, vHome:!denied&&s.v==='home', vTable:!denied&&s.v==='table', vForm:!denied&&s.v==='form',
      code:s.c, title:s[lang], purpose:denied?'':s.p, modLabel:(mod[lang]||''),
      crumb:'Sahabat Halal · ' + (mod[lang]||'') + ' · ' + s.c,
      readOnly: !denied && roLabel && s.v!=='home',
      readOnlyMsg: lang==='id' ? 'Peran '+st.role+' hanya memiliki hak baca pada modul ini (§3.3). Aksi pengubahan dinonaktifkan.' : 'Role '+st.role+' has read-only access to this module (§3.3). Editing actions are disabled.',
      deniedMsg: lang==='id' ? 'Peran '+st.role+' tidak memiliki hak akses pada modul '+(mod.id||'')+' ('+s.c+'). Ganti peran pada pemilih di topbar untuk melihat layar ini.' : 'Role '+st.role+' has no access to the '+(mod.en||'')+' module ('+s.c+'). Switch role in the topbar to view this screen.',
      gap: denied ? null : (GAPS[s.h] || null),
      hasStates: !denied && s.v==='table',
      stateOpts:stateOpts,
      showData: st.ds==='data', showEmpty: st.ds==='kosong', showLoading: st.ds==='memuat', showError: st.ds==='galat',
      skels:[{w:'100%'},{w:'92%'},{w:'96%'},{w:'88%'},{w:'94%'},{w:'80%'},{w:'90%'}],
      tb:{ph:T.ph||'',filters:T.filters||[],actions:(T.actions||[]).filter(()=>!roLabel)},
      cols:cols, rows:rows, form:F,
      emptyMsg:T.empty||'', pageInfo:(lang==='id'?'Menampilkan 1–'+rows.length+' dari '+(T.total||rows.length)+' baris':'Showing 1–'+rows.length+' of '+(T.total||rows.length)+' rows') + (T.note?' · '+T.note:''),
      pages:[{n:'‹',bg:'var(--sah-white)',fg:'var(--sah-muted)'},{n:'1',bg:'var(--sah-navy)',fg:'var(--sah-white)'},{n:'2',bg:'var(--sah-white)',fg:'var(--sah-navy)'},{n:'3',bg:'var(--sah-white)',fg:'var(--sah-navy)'},{n:'›',bg:'var(--sah-white)',fg:'var(--sah-navy)'}],
      kpis:kpiRole, queues:queues, shortcuts:shortcuts,
      actLabels:['Buat','Baca','Ubah','Hapus','Setujui'],
      rbacTabs:ROLES.map(r=>({v:r.v,n:r.n,
        bg:st.rbacTab===r.v?'var(--sah-navy)':'transparent', fg:st.rbacTab===r.v?'var(--sah-white)':'var(--sah-muted)',
        go:()=>this.setState({rbacTab:r.v})})),
      rbacRows:RBAC_MODS.map((label,ri)=>({label,
        cells:[0,1,2,3,4].map(ci=>{
          const val = st.rbac[st.rbacTab][ri][ci];
          if (val===null) return {show:false, hide:true};
          const note = (RBAC_NOTES[st.rbacTab]||{})[ri+'-'+ci] || '';
          return {show:true, hide:false, checked:!!val, note:note,
            bg: val ? 'var(--sah-copper)' : 'var(--sah-white)', bd: val ? 'var(--sah-copper)' : 'var(--sah-line)',
            go:()=>this.toggleRbac(ri,ci)};
        })
      })),
      rbacSave:()=>this.fire('Perubahan hak akses tersimpan (mock, tidak dipersistensi ke server).'),
      rbacReset:()=>this.resetRbacTab(),
      homeEyebrow: lang==='id' ? 'Antrean hari ini · 12 April 2026' : "Today's queues · 12 April 2026",
      homeHi: (lang==='id'?'Selamat pagi, ':'Good morning, ') + (ME[st.role]||'').split(' ')[0] + '.',
      homeSub: lang==='id' ? 'Menu dan antrean di bawah menyesuaikan peran '+st.role+' sesuai matriks hak akses PRD §3.3.' : 'Menus and queues below follow the '+st.role+' role per the PRD §3.3 access matrix.',
      shortcutNote: lang==='id' ? shortcuts.length+' layar dapat diakses peran ini' : shortcuts.length+' screens available to this role',
      ...this.extra(s, denied, lang, roLabel)
    };
  }

  extra(s, denied, lang, ro){
    const on = k => !denied && s.v===k;
    const G1 = 'linear-gradient(145deg,#477fa2,#25384a 58%,#6f3f32)';
    const G2 = 'linear-gradient(130deg,#f0944d,#a84e3d 58%,#6f3f32)';
    return {
      v05:on('s05'), v06:on('s06'), v09:on('s09'), v10:on('s10'), v15:on('s15'), v18:on('s18'),
      v20:on('s20'), v25:on('s25'), v26:on('s26'), v28:on('s28'), v31:on('s31'),
      v32:on('s32'), v34:on('s34'),
      G1:G1, G2:G2, ro:ro,

      photos:[
        {n:'Depan',f:'bango-275-front.jpg',gr:G1,ini:'BG',st:this.chip('ok','Terindeks'),warn:null,dim:'2048 × 2048 · 1,8 MB'},
        {n:'Belakang',f:'bango-275-back.jpg',gr:G1,ini:'BG',st:this.chip('ok','Terindeks'),warn:null,dim:'2048 × 2048 · 1,9 MB'},
        {n:'Sisi kiri',f:'bango-275-left.jpg',gr:G2,ini:'BG',st:this.chip('wait','Menunggu indeks'),warn:'Pantulan cahaya pada label — kontras teks rendah.',dim:'1536 × 1536 · 1,1 MB'},
        {n:'Sisi kanan',f:'bango-275-right.jpg',gr:G2,ini:'BG',st:this.chip('bad','Galat ekstraksi'),warn:'Objek terpotong di tepi kanan; ekstraksi fitur ditolak.',dim:'1280 × 1280 · 0,9 MB'},
        {n:'Tutup',f:'bango-275-cap.jpg',gr:G1,ini:'BG',st:this.chip('ok','Terindeks'),warn:null,dim:'1536 × 1536 · 1,0 MB'},
        {n:'Kemasan isi ulang',f:'bango-refill.jpg',gr:G2,ini:'BG',st:this.chip('wait','Menunggu indeks'),warn:'Latar belakang berpola — disarankan latar polos.',dim:'2048 × 1536 · 1,6 MB'}
      ],
      claim:{
        pengaju:'Ahmad Fauzi', email:'ahmad.fauzi@mail.com', hp:'+62 812-9004-1177',
        masjid:'Masjid Istiqlal, Jakarta Pusat', placeId:'ChIJ…3f21', kontakResmi:'+62 21 3811708 (Sekretariat Masjid Istiqlal)',
        umur:'8 hari kalender · melewati ambang 5 hari kerja',
        fields:[
          {k:'Pengaju',v:'Ahmad Fauzi'},{k:'Email akun konsumen',v:'ahmad.fauzi@mail.com'},
          {k:'Nomor kontak pengaju',v:'+62 812-9004-1177'},{k:'Masjid diklaim',v:'Masjid Istiqlal, Jakarta Pusat'},
          {k:'place_id',v:'ChIJ…3f21'},{k:'Diajukan',v:'4 April 2026 · 20:11'},
          {k:'Peran diminta',v:'US-06 Pengurus Masjid'},{k:'Klaim aktif lain pada masjid ini',v:'Tidak ada'}
        ],
        bukti:[
          {n:'SK Pengurus DKM 2026',t:'PDF · 1,2 MB',gr:1},
          {n:'KTP pengaju',t:'JPG · 0,6 MB · sebagian disamarkan',gr:2},
          {n:'Foto papan pengurus',t:'JPG · 1,4 MB',gr:1}
        ],
        riwayat:[
          {w:'4 Apr 2026 · 20:11',x:'Klaim diajukan melalui aplikasi mobile (SCR-MOB-27).'},
          {w:'6 Apr 2026 · 09:30',x:'Budi Santoso menambahkan catatan: menunggu ketersediaan nomor kontak resmi.'},
          {w:'11 Apr 2026 · 14:02',x:'Sistem menandai klaim melewati ambang usia pengajuan.'}
        ]
      },

      kajianList:KAJIAN.map((k,i)=>({...k, no:(i+1<10?'0':'')+(i+1),
        bg:i===this.state.kajian?'var(--sah-copper-pale)':'var(--sah-ivory)',
        bd:i===this.state.kajian?'var(--sah-copper)':'var(--sah-line)',
        go:()=>this.setState({kajian:i})})),
      kajianCur:KAJIAN[this.state.kajian] || KAJIAN[0],
      kajianFlags:(KAJIAN[this.state.kajian]||KAJIAN[0]).flags.map(f=>({
        x:f, ok:f.indexOf('belum')<0 && f.indexOf('nonaktif')<0,
        gc:(f.indexOf('belum')<0 && f.indexOf('nonaktif')<0) ? 'var(--sah-blue-strong)' : 'var(--danger)',
        g:(f.indexOf('belum')<0 && f.indexOf('nonaktif')<0) ? '\u25cf' : '\u25b2'})),

      rubrik:[
        {j:'Sertifikat halal resmi',d:'BPJPH/MUI untuk Indonesia; otoritas halal resmi negara setempat untuk restoran luar negeri',k:'Sertifikat teridentifikasi & berlaku',c:'Selalu mengalahkan jenis bukti lain bila terjadi konflik',rank:'Hierarki 1'},
        {j:'Foto menu/signage bertuliskan “100% Halal”',d:'Bukti tunggal yang sah hanya pada negara tanpa otoritas penerbit sertifikat halal formal',k:'Tulisan tersebut cukup sebagai bukti tunggal, khusus untuk restoran di negara tanpa otoritas penerbit sertifikat halal formal',c:'Status restoran luar negeri tidak ditentukan oleh BPJPH — kurator memakai otoritas halal setempat bila ada',rank:'Hierarki 2'},
        {j:'Keterangan pemilik, foto lain, kunjungan langsung',d:'Mengikuti pola kurasi bukti campuran',k:'Dinilai kurator sebagai bukti kombinasi — bukan bukti tunggal',c:'Tidak berubah dari keputusan isu #2',rank:'Hierarki 3'}
      ],
      evOpts:[
        {v:'sertifikat',n:'Sertifikat halal resmi',h:'Hierarki 1 — mengalahkan bukti lain'},
        {v:'signage',n:'Foto menu/signage “100% Halal”',h:'Hierarki 2 — hanya untuk negara tanpa otoritas formal'},
        {v:'kombinasi',n:'Bukti kombinasi (keterangan pemilik, foto, kunjungan)',h:'Hierarki 3 — tidak sah sebagai bukti tunggal'},
        {v:'checkin',n:'Ambang 10 check-in unik',h:'Hanya untuk status Rekomendasi komunitas'}
      ],
      resto:{
        n:'Ramen Kobo Naruto', kota:'Jakarta Selatan · Indonesia', pengaju:'Bayu Prasetyo',
        fields:[
          {k:'Diajukan',v:'8 April 2026 · 21:44'},{k:'Pengaju',v:'Bayu Prasetyo (akun konsumen)'},
          {k:'Alamat',v:'Jl. Kemang Raya No. 21, Jakarta Selatan'},{k:'Kategori',v:'Ramen & mi Jepang'},
          {k:'Check-in unik',v:'3 (di bawah ambang 10)'},{k:'Status saat ini',v:'Belum terverifikasi'},
          {k:'Laporan konsumen',v:'Tidak ada'},{k:'Kurator penanggung jawab',v:'Nadia Puspita'}
        ],
        foto:[{n:'Fasad restoran',gr:1},{n:'Papan menu',gr:2},{n:'Dapur terbuka',gr:1},{n:'Keterangan pemilik',gr:2}]
      },

      ph:this.state.ph, reason:this.state.reason, ev:this.state.ev, evNote:this.state.evNote,
      setPhNum:e=>this.setPh('num',e.target.value), setPhTime:e=>this.setPh('time',e.target.value),
      setPhName:e=>this.setPh('name',e.target.value), setPhConcl:e=>this.setPh('concl',e.target.value),
      setReason:e=>this.setState({reason:e.target.value}),
      setEvNote:e=>this.setState({evNote:e.target.value}),
      pickEv:v=>()=>this.setState({ev:v}),
      evSel:this.state.ev,
      evRows:[
        {v:'sertifikat',n:'Sertifikat halal resmi',h:'Hierarki 1 — mengalahkan bukti lain'},
        {v:'signage',n:'Foto menu/signage “100% Halal”',h:'Hierarki 2 — hanya untuk negara tanpa otoritas formal'},
        {v:'kombinasi',n:'Bukti kombinasi (keterangan pemilik, foto, kunjungan)',h:'Hierarki 3 — tidak sah sebagai bukti tunggal'},
        {v:'checkin',n:'Ambang 10 check-in unik',h:'Hanya untuk status Rekomendasi komunitas'}
      ].map(o=>({...o, on:this.state.ev===o.v,
        bg:this.state.ev===o.v?'var(--sah-copper-pale)':'var(--sah-ivory)',
        bd:this.state.ev===o.v?'var(--sah-copper)':'var(--sah-line)',
        dot:this.state.ev===o.v?'var(--sah-copper-dark)':'transparent',
        go:()=>this.setState({ev:o.v})})),

      phDone:!!(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl),
      phMissing:!(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl),
      claimOkBg:(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl) ? 'var(--sah-copper)' : 'rgba(23,36,58,.08)',
      claimOkFg:(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl) ? 'var(--sah-white)' : 'var(--sah-muted)',
      claimRejBg:(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl && this.state.reason.length>3) ? 'rgba(168,95,79,.14)' : 'rgba(23,36,58,.05)',
      claimRejFg:(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl && this.state.reason.length>3) ? 'var(--sah-frame)' : 'var(--sah-muted)',
      approveClaim:()=>{
        if (!(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl))
          return this.fire('Keputusan tidak dapat disimpan: catatan verifikasi telepon belum lengkap (FR-KAJ-13).');
        this.fire('Klaim disetujui. Peran US-06 Pengurus Masjid diberikan untuk Masjid Istiqlal (FR-KAJ-14).');
      },
      rejectClaim:()=>{
        if (!(this.state.ph.num && this.state.ph.time && this.state.ph.name && this.state.ph.concl))
          return this.fire('Keputusan tidak dapat disimpan: catatan verifikasi telepon belum lengkap (FR-KAJ-13).');
        if (this.state.reason.trim().length < 4) return this.fire('Penolakan wajib beralasan (FR-MOD-02).');
        this.fire('Klaim ditolak dengan alasan tercatat. Pengaju menerima pemberitahuan.');
      },
      locked:this.state.locked,
      unlockedView:!this.state.locked,
      toggleLock:()=>this.setState({locked:!this.state.locked}),
      lockLabel:this.state.locked ? 'Tampilkan pengajuan biasa' : 'Tampilkan state terkunci (FR-MOD-11)',
      evOkBg:this.state.ev ? 'var(--sah-copper)' : 'rgba(23,36,58,.08)',
      evOkFg:this.state.ev ? 'var(--sah-white)' : 'var(--sah-muted)',
      evHintMsg:this.state.ev ? 'Jenis bukti terpilih akan tersimpan dan ditampilkan kepada konsumen (FR-RST-14, -15).' : 'Tombol keputusan nonaktif sampai jenis bukti dipilih (FR-MOD-12, BR-22).',
      decideResto:kind=>()=>{
        if (!this.state.ev) return this.fire('Penyimpanan ditolak: jenis bukti wajib dipilih (FR-MOD-12, BR-22).');
        if (kind!=='verified' && this.state.reason.trim().length < 4) return this.fire('Penolakan dan tinjauan lanjut wajib beralasan (FR-MOD-02).');
        this.fire(kind==='verified' ? 'Restoran ditetapkan Terverifikasi. Jenis bukti tersimpan pada ENT-17 (FR-RST-14).' : (kind==='rejected' ? 'Pengajuan ditolak dengan alasan tercatat.' : 'Ditandai perlu tinjauan lanjut dengan alasan tercatat.'));
      },
      moderateKajian:kind=>()=>{
        if (kind!=='approve' && this.state.reason.trim().length < 4) return this.fire('Penolakan dan permintaan perbaikan wajib beralasan (FR-MOD-02).');
        this.fire(kind==='approve' ? 'Agenda kajian disetujui dan tayang pada halaman masjid.' : (kind==='reject' ? 'Agenda ditolak dengan alasan tercatat.' : 'Permintaan perbaikan dikirim ke pengurus masjid.'));
      },

      bannerSlots:[0,1,2,3,4,5,6,7,8,9].map(i=>({bg: i<7 ? 'var(--sah-copper)' : 'transparent', bd: i<7 ? 'var(--sah-copper)' : 'var(--sah-line)'})),
      photoTools:['Pangkas','Putar 90°','Ratakan horizon','Hapus latar','Naikkan kontras','Tandai objek utama'],

      prod:{
        sku:'SKU-100241', name:'Kecap Manis Bango 275 ml', maker:'Unilever Indonesia',
        meta:[
          {k:'Kategori',v:'Bumbu & saus'},{k:'Nomor sertifikat',v:'ID00410000123456790125'},
          {k:'Penerbit',v:'BPJPH'},{k:'Tanggal terbit',v:'12 Januari 2026'},
          {k:'Masa berlaku',v:'11 Januari 2030'},{k:'Status halal',v:'Halal terverifikasi'},
          {k:'Status indeks visual',v:'4 dari 6 foto terindeks'},{k:'Terakhir diubah',v:'2 April 2026 · Rizky Ananda'}
        ],
        stats:[{v:'6.980',l:'Sesi eksposur 30 hari'},{v:'0,93',l:'Skor kemiripan rata-rata'},{v:'12',l:'Kueri gagal'}]
      },

      editor:{
        title:'Restoran Halal di Tokyo: Catatan Perjalanan',
        kicker:'Kisah · kategori Berita',
        toolbar:['B','I','U','H2','H3','“','•','1.','Tautan','Gambar'],
        body:[
          ['h','Mencari makan siang di Shibuya'],
          ['p','Di Tokyo, penanda halal jarang berdiri sendiri. Sebagian restoran memasang sertifikat dari otoritas setempat, sebagian lain hanya menuliskan “100% Halal” di papan menu. Keduanya sah sebagai bukti, dengan urutan yang berbeda.'],
          ['q','Sertifikat halal resmi selalu mengalahkan jenis bukti lain bila terjadi konflik.'],
          ['p','Untuk restoran di negara tanpa otoritas penerbit sertifikat halal formal, tulisan pada menu atau signage cukup menjadi bukti tunggal. Kurator mencatat jenis bukti yang dipakai agar pembaca tahu dasar penetapan statusnya.'],
          ['i','Naritaya Halal Ramen, Asakusa'],
          ['p','Naritaya di Asakusa memasang tulisan itu di pintu depan. Entri restorannya kini berstatus terverifikasi dengan jenis bukti “foto signage”.']
        ].map(b=>({x:b[1],isH:b[0]==='h',isP:b[0]==='p',isQ:b[0]==='q',isI:b[0]==='i'})),
        schedule:[{k:'Status',v:'Draf'},{k:'Jadwal terbit',v:'18 April 2026 · 07:00 WIB'},{k:'Penulis',v:'Dinar Prameswari'},{k:'Kategori',v:'Kisah → Berita'},{k:'Versi',v:'3 (riwayat tersimpan)'}]
      },

      banners:[
        {n:'Bango — Resep Nusantara',ord:'01',gr:G1,ini:'BG',st:this.chip('ok','Aktif'),per:'1 Apr – 30 Apr 2026',dest:'Kisah · Mengenal Logo Halal'},
        {n:'Sania — Dapur Sehat',ord:'02',gr:G2,ini:'SN',st:this.chip('ok','Aktif'),per:'1 Apr – 30 Apr 2026',dest:'Direktori produk · Minyak goreng'},
        {n:'Wong Solo — Ayam Bakar',ord:'03',gr:G1,ini:'WS',st:this.chip('ok','Aktif'),per:'5 Apr – 5 Mei 2026',dest:'Direktori restoran · Surabaya'},
        {n:'Kapal Api — Pagi Bersama',ord:'04',gr:G2,ini:'KA',st:this.chip('ok','Aktif'),per:'1 Apr – 15 Apr 2026',dest:'Kisah · Adab Berbagi Informasi'},
        {n:'Frisian Flag — Tumbuh Kuat',ord:'05',gr:G1,ini:'FF',st:this.chip('ok','Aktif'),per:'8 Apr – 8 Mei 2026',dest:'Direktori produk · Susu'},
        {n:'Roma — Bekal Sekolah',ord:'06',gr:G2,ini:'RM',st:this.chip('ok','Aktif'),per:'10 Apr – 10 Mei 2026',dest:'Kisah · Panduan Nomor Sertifikat'},
        {n:'Maimunah — Rasa Singapura',ord:'07',gr:G1,ini:'MH',st:this.chip('ok','Aktif'),per:'12 Apr – 12 Mei 2026',dest:'Direktori restoran · Singapura'},
        {n:'ABC — Pedas Seimbang',ord:'08',gr:G2,ini:'AB',st:this.chip('wait','Terjadwal 20 Apr'),per:'20 Apr – 20 Mei 2026',dest:'Pindai · hasil'},
        {n:'Ramadan 1447 H',ord:'09',gr:G1,ini:'RD',st:this.chip('draft','Draf'),per:'Belum dijadwalkan',dest:'Kisah · Agenda Ramadan'}
      ]
    };
  }
}

