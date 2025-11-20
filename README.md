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
    Salin file `.env.example` menjadi `.env` dan sesuaikan jika perlu:
    ```bash
    cp .env.example .env
    ```
    
    **PENTING:** Untuk production, ganti nilai berikut di `.env`:
    - `JWT_SECRET` - Gunakan random string minimal 32 karakter
    - `POSTGRES_PASSWORD` - Gunakan password yang kuat
    - `SUPERADMIN_DEFAULT_PASSWORD` - Password untuk user superadmin
    - `ALLOWED_ORIGINS` - Domain production Anda
    - `NEXT_PUBLIC_API_URL` - URL API production

3.  **Jalankan Aplikasi:**
    ```bash
    docker compose up --build
    ```
    
    **Catatan:** 
    - Backend akan otomatis menjalankan migrasi database saat pertama kali start
    - User superadmin akan dibuat otomatis dengan username `superadmin`
    - Tunggu hingga semua services ready (sekitar 30-60 detik)

4.  **Load Seed Data (Opsional):**
    Untuk mengisi database dengan data contoh (hero sliders dan site settings):
    ```bash
    cat backend/db/seeds/seed_hero_sliders_and_settings.sql | docker exec -i sid-seirotan-db-1 psql -U admin -d sid_sei_rotan_db
    ```
    
    Atau jika menggunakan Docker Compose:
    ```bash
    docker compose exec db psql -U admin -d sid_sei_rotan_db -f /path/to/seed_hero_sliders_and_settings.sql
    ```
    
    Seed data mencakup:
    - 3 hero sliders untuk homepage
    - Site settings lengkap (general, profile, social)
    - Data profil desa yang siap digunakan
    
    Lihat dokumentasi lengkap di `backend/db/seeds/README.md`

5.  **Akses Aplikasi:**
    -   **Frontend:** [http://localhost:3000](http://localhost:3000)
    -   **Backend API:** [http://localhost:8080](http://localhost:8080)
    -   **Database:** Port `5432`
    -   **Login Admin:** 
        - Username: `superadmin`
        - Password: Sesuai `SUPERADMIN_DEFAULT_PASSWORD` di `.env`

6.  **Troubleshooting:**
    Jika ada masalah, lihat [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

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