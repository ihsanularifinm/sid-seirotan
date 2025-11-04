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

3.  **Konfigurasi environment:**
    Buat file `.env` di folder `backend` dan isi dengan konfigurasi database:
    ```
    DB_HOST=localhost
    DB_USER=user
    DB_PASSWORD=password
    DB_NAME=desa_sei_rotan
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret
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