# Dokumentasi Reverse Proxy Nginx untuk Application Stack (SAH System)

Dokumentasi ini menjelaskan konfigurasi Nginx sebagai Reverse Proxy untuk mengelola lalu lintas (traffic) ke dalam ekosistem aplikasi **SAH System**. Dokumentasi ini mencakup skenario **Local Development** dan **Staging Environment**.

---

## 1. About

Sistem ini terdiri dari beberapa microservices / modul terpisah yang berjalan pada container Docker dan environment lokal. Nginx digunakan sebagai *Reverse Proxy* dan *Single Entry Point* untuk mengarahkan permintaan HTTP dari pengguna/klien ke layanan backend dan frontend yang sesuai berdasarkan path/endpoint URI.

Dengan menggunakan Reverse Proxy:

* Seluruh aplikasi dapat diakses melalui satu port/domain utama.
* Menghindari masalah *Cross-Origin Resource Sharing (CORS)* antara Frontend dan Backend pada domain/port yang sama.
* Memudahkan pengelolaan timeout, limit ukuran unggahan berkas, dan SSL/TLS secara terpusat.

---

## 2. Applications

Berikut adalah rincian layanan/aplikasi yang terintegrasi di dalam sistem:

| Nama Aplikasi | Nama Container / Process | Technology Stack | Port Internal | Route / Path | Description |
| --- | --- | --- | --- | --- | --- |
| **Web App** | `sah_cms` | React JS (Vite) | `3001` | `/` | Portal Utama / CMS Frontend |
| **API Service** | `sah_api` | Laravel 13 | `3002` | `/api` | Backend RESTful API & Database Core |
| **OCR Service** | `sah_ocr` | Python (FastAPI/Flask) | `3003` | `/ocr` | Processing engine untuk ekstraksi teks gambar/PDF |

---

## 3. Nginx Setup for Development (Localhost)

Pada lingkungan *Local Development*, Nginx berjalan langsung pada OS Host (Native) menggunakan port `4000`. Layanan `sah_ocr` dikeualikan dalam skenario dev lokal ini, React JS dijalankan via `npm run dev`, dan Laravel dijalankan menggunakan Laravel Sail.

### Environment Topology

* **Proxy Address:** `http://localhost:4000`
* **React JS (`sah_cms`):** Standalone local dev server (`[http://127.0.0.1:3001](http://127.0.0.1:3001)`)
* **Laravel Sail (`sah_api`):** Containerized via Sail dengan binding `APP_PORT=3002` (`[http://127.0.0.1:3002](http://127.0.0.1:3002)`)
* **OCR Service:** *Disabled / Not used in local dev*

### Configuration File (`/etc/nginx/conf.d/sah_dev.conf`)

```nginx
# Upstream Definitions
upstream cms_dev {
    server 127.0.0.1:8041;
    keepalive 32;
}

upstream api_dev {
    server 127.0.0.1:8042;
    keepalive 32;
}

server {
    listen 4000;
    server_name localhost;

    # Global Proxy Headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host; # Menjaga port :4000 tetap terbawa saat redirect
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Limit upload file global (misal: dokumen/media)
    client_max_body_size 50M;

    # 1. React JS Dev Server (Vite / CRA - Port 3001)
    location / {
        proxy_pass http://cms_dev;
        
        # Dukungan WebSocket untuk Hot Module Replacement (HMR) / Live Reload
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 2. Laravel Sail (Port 3002)
    location /api {
        proxy_pass http://api_dev;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Logging
    error_log  /var/log/nginx/sah_dev_error.log;
    access_log /var/log/nginx/sah_dev_access.log;
}

```

---

## 4. Nginx Setup for Staging

Pada lingkungan *Staging*, seluruh ketiga layanan (`sah_cms`, `sah_api`, dan `sah_ocr`) dijalankan penuh di dalam container Docker. Nginx pada Host menggunakan port HTTP standar `80` (atau port alternatif staging yang disetujui).

### Environment Topology

* **Proxy Address:** `[http://staging.example.com](http://staging.example.com)` atau `http://<IP-SERVER>`
* **React JS (`sah_cms`):** Production build container (`[http://127.0.0.1:3001](http://127.0.0.1:3001)`)
* **Laravel 13 (`sah_api`):** Production API container (`[http://127.0.0.1:3002](http://127.0.0.1:3002)`)
* **Python OCR (`sah_ocr`):** OCR engine container (`[http://127.0.0.1:3003](http://127.0.0.1:3003)`)

### Configuration File (`/etc/nginx/conf.d/sah_staging.conf`)

```nginx
# Upstream Definitions
upstream cms_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

upstream api_backend {
    server 127.0.0.1:3002;
    keepalive 32;
}

upstream ocr_backend {
    server 127.0.0.1:3003;
    keepalive 32;
}

server {
    listen 80;
    server_name staging.example.com; # Ganti dengan domain atau IP Staging Anda

    # Global Proxy Headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Limit upload file global untuk dokumen OCR & media
    client_max_body_size 50M;

    # 1. React JS Web App (sah_cms)
    location / {
        proxy_pass http://cms_backend;
    }

    # 2. Laravel 13 API (sah_api)
    location /api {
        proxy_pass http://api_backend;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 3. Python OCR Service (sah_ocr)
    location /ocr {
        proxy_pass http://ocr_backend;
        
        # Timeout diperpanjang untuk pemrosesan OCR gambar/PDF berukuran besar
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Logging
    error_log  /var/log/nginx/sah_staging_error.log;
    access_log /var/log/nginx/sah_staging_access.log;
}

```

---

## 5. Important Implementation Notes & Guidelines

### A. Routing & Path Mapping

1. **No Trailing Slash pada `proxy_pass`**:
Menggunakan `proxy_pass http://api_backend;` (tanpa slash `/` di akhir) memastikan Nginx mempertahankan seluruh prefix URI `/api`. Request dari frontend seperti `GET /api/v1/users` akan diteruskan ke Laravel sebagai `/api/v1/users`.
2. **React SPA Routing**:
Container `sah_cms` harus mengonfigurasi fallback routing (seperti `try_files $uri /index.html;`) agar fitur client-side routing pada React (React Router) tidak menghasilkan error *404 Not Found* saat halaman di-refresh.

### B. Timeout & Upload Limits

1. **`client_max_body_size 50M`**:
Diperlukan agar Nginx tidak menolak pengunggahan berkas dokumen/gambar besar untuk OCR atau file attachment pada Laravel API (*Error 413 Request Entity Too Large*).
2. **`proxy_read_timeout 300s`**:
Diatur khusus untuk rute `/ocr` guna mengantisipasi pemrosesan dokumen yang membutuhkan waktu komputasi Python lebih lama tanpa mengalami *504 Gateway Timeout*.

### C. Development Considerations (HMR & Port 4000)

1. **WebSocket HMR**:
Baris `proxy_set_header Upgrade $http_upgrade;` dan `Connection "upgrade";` pada skenario local development wajib ada agar Hot Module Replacement (Vite) milik React berfungsi secara real-time.
2. **Header `$http_host`**:
Pada port custom dev (`4000`), penggunaan `proxy_set_header Host $http_host;` memastikan Nginx tetap meneruskan nomor port `:4000` ke aplikasi sehingga URL redirect tidak kehilangan port.

### D. Docker Network & Port Binding

* Saat Nginx berjalan langsung pada OS Host, port pada `docker-compose.yml` harus dipublikasikan ke localhost host:
* `sah_cms`: `127.0.0.1:3001:3001`
* `sah_api`: `127.0.0.1:3002:3002` (via `APP_PORT=3002` pada Laravel Sail)
* `sah_ocr`: `127.0.0.1:3003:3003`


* Binding ke `127.0.0.1` memastikan container tidak dapat diakses publik secara langsung dari luar server tanpa melewati Nginx Reverse Proxy.