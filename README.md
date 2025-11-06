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
-   **Frontend:**
    -   Next.js dengan React dan TypeScript
    -   Tailwind CSS untuk styling
    -   Halaman publik untuk menampilkan informasi desa
    -   Area admin untuk manajemen konten

## Prasyarat

-   Go (versi 1.18 atau lebih baru)
-   Node.js (versi 16 atau lebih baru)
-   PostgreSQL
-   Docker (opsional, untuk database)

## Instalasi

### Backend

1.  **Clone repository:**
    ```bash
    git clone https://github.com/ihsanularifinm/sid-seirotan.git
    cd sid-seirotan/backend
    ```

2.  **Install dependensi:**
    ```bash
    go mod tidy
    ```

### Konfigurasi Environment

Proyek ini menggunakan file `.env` untuk konfigurasi. Contoh file `.env.example` disediakan di setiap direktori yang memerlukannya.

1.  **Root Direktori:**

    Buat file `.env` di direktori utama dan isi dengan variabel untuk `docker-compose`:

    ```bash
    # Variabel untuk docker-compose.yml
    POSTGRES_DB=your_postgres_db
    POSTGRES_USER=your_postgres_user
    POSTGRES_PASSWORD=your_postgres_password
    ```

2.  **Backend:**

    Salin `.env.example` menjadi `.env` di dalam direktori `backend`:

    ```bash
    cp backend/.env.example backend/.env
    ```

    Sesuaikan variabel di `backend/.env`:

    ```
    # Konfigurasi database PostgreSQL
    POSTGRES_HOST=localhost
    POSTGRES_USER=your_postgres_user
    POSTGRES_PASSWORD=your_postgres_password
    POSTGRES_DB=your_postgres_db
    POSTGRES_PORT=5433

    # Konfigurasi server backend
    PORT=8081

    # Konfigurasi CORS
    CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

    # Konfigurasi JWT
    JWT_SECRET=your_jwt_secret
    ```

3.  **Frontend:**

    Salin `.env.local.example` menjadi `.env.local` di dalam direktori `frontend`:

    ```bash
    cp frontend/.env.local.example frontend/.env.local
    ```

    Sesuaikan variabel di `frontend/.env.local`:

    ```
    NEXT_PUBLIC_API_URL=http://localhost:8081
    ```

4.  **Jalankan migrasi database:**
    Pastikan Anda memiliki `migrate` terinstall. Jika tidak, install dengan:
    ```bash
    go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
    ```
    Kemudian jalankan migrasi:
    ```bash
    migrate -database "postgres://user:password@localhost:5432/desa_sei_rotan?sslmode=disable" -path db/migrations up
    ```

### Frontend

1.  **Pindah ke direktori frontend:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

## Menjalankan Aplikasi

### Backend

Dari direktori `backend`, jalankan:
```bash
go run main.go
```
Server backend akan berjalan di `http://localhost:8081`.

### Frontend

Dari direktori `frontend`, jalankan:
```bash
npm run dev
```
Server frontend akan berjalan di `http://localhost:3001`.

Buka `http://localhost:3001` di browser Anda untuk melihat aplikasi.