# Frontend - Website Desa

Frontend ini dibangun menggunakan Next.js, sebuah framework React untuk website desa yang dapat dikustomisasi.

## Teknologi

-   **Next.js:** Framework React untuk Server-Side Rendering (SSR) dan Static Site Generation (SSG)
-   **React:** Library JavaScript untuk membangun antarmuka pengguna
-   **TypeScript:** Superset JavaScript yang menambahkan tipe statis
-   **Tailwind CSS:** Framework CSS utility-first untuk desain yang cepat
-   **React Hook Form & Yup:** Untuk manajemen dan validasi form

## Struktur Folder

-   `/src/app`: Direktori utama untuk halaman dan komponen (menggunakan App Router)
-   `/src/app/admin`: Halaman-halaman khusus untuk area admin
-   `/src/app/(public)`: Halaman-halaman publik (contoh: `/berita`, `/pemerintahan`)
-   `/src/components`: Komponen-komponen yang dapat digunakan kembali (layout, UI, dll.)
-   `/public`: Aset statis seperti gambar dan ikon

## Menjalankan Frontend

### Menggunakan Docker (Disarankan)

Lihat panduan di README utama untuk menjalankan aplikasi menggunakan Docker Compose.

### Manual (Development)

1.  Pastikan backend sudah berjalan.
2.  Dari direktori `frontend`, install dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server development:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:3001`.

## Fitur Utama

-   **Tampilan Publik:** Menampilkan profil desa, berita, aparatur, potensi, dan layanan.
-   **Area Admin:**
    -   Login yang aman dengan JWT.
    -   Dashboard untuk manajemen konten.
    -   Fungsionalitas CRUD (Create, Read, Update, Delete) untuk semua tipe konten.
    -   Form yang canggih dengan validasi, upload gambar, dan pratinjau.