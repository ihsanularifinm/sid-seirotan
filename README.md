# Website Desa Sei Rotan

Ini adalah proyek website untuk Desa Sei Rotan, yang dibangun dengan Go untuk backend dan Next.js untuk frontend.

## Fitur

-   **Backend:**
    -   Go dengan framework Gin
    -   GORM sebagai ORM
    -   PostgreSQL sebagai database
    -   JWT untuk autentikasi
    -   Manajemen Berita, Aparatur Desa, Layanan, Potensi, dan Kontak
    -   Upload file untuk gambar
    -   **Keamanan:** Validasi input ketat, Rate Limiting, dan Sanitasi HTML
-   **Frontend:**
    -   Next.js dengan React dan TypeScript
    -   Tailwind CSS untuk styling
    -   Halaman publik untuk menampilkan informasi desa
    -   Area admin untuk manajemen konten
    -   **UX:** Notifikasi Toast, Skeleton Loading, dan Desain Responsif
-   **DevOps:**
    -   Docker & Docker Compose untuk deployment mudah

## Prasyarat

-   Docker dan Docker Compose (Disarankan)
-   Atau instalasi manual:
    -   Go (versi 1.22 atau lebih baru)
    -   Node.js (versi 18 atau lebih baru)
    -   PostgreSQL

## Menjalankan dengan Docker (Disarankan)

Cara termudah untuk menjalankan aplikasi adalah menggunakan Docker Compose.

1.  **Clone repository:**
    ```bash
    git clone https://github.com/ihsanularifinm/sid-seirotan.git
    cd sid-seirotan
    ```

2.  **Konfigurasi Environment:**
    Buat file `.env` di root direktori (jika belum ada) dan sesuaikan variabelnya:
    ```env
    POSTGRES_DB=desa_sei_rotan
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    ```

3.  **Jalankan Aplikasi:**
    ```bash
    docker compose up --build
    ```

4.  **Akses Aplikasi:**
    -   **Frontend:** [http://localhost:3000](http://localhost:3000)
    -   **Backend API:** [http://localhost:8080](http://localhost:8080)
    -   **Database:** Port `5433`

## Instalasi Manual

Jika Anda ingin menjalankan tanpa Docker, ikuti langkah-langkah di bawah ini.

### Backend

1.  **Masuk ke direktori backend:**
    ```bash
    cd backend
    ```

2.  **Install dependensi:**
    ```bash
    go mod tidy
    ```

3.  **Konfigurasi Environment:**
    Salin `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.

4.  **Jalankan Aplikasi:**
    ```bash
    go run main.go
    ```

### Frontend

1.  **Masuk ke direktori frontend:**
    ```bash
    cd frontend
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**
    Salin `.env.local.example` menjadi `.env.local` dan sesuaikan `NEXT_PUBLIC_API_URL`.

4.  **Jalankan Aplikasi:**
    ```bash
    npm run dev
    ```