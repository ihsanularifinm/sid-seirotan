import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/contexts/SettingsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://seirotan.desa.id'),
  title: {
    template: "%s | Desa Sei Rotan",
    default: "Desa Sei Rotan - Website Resmi Pemerintah Desa",
  },
  description: "Website Resmi Desa Sei Rotan, Kecamatan Percut Sei Tuan, Kabupaten Deli Serdang, Sumatera Utara. Informasi layanan, berita, potensi, dan pemerintahan desa.",
  keywords: ["Desa Sei Rotan", "Seirotan", "Percut Sei Tuan", "Deli Serdang", "Sumatera Utara", "Pemerintah Desa", "Layanan Desa", "Berita Desa"],
  authors: [{ name: "Pemerintah Desa Sei Rotan" }],
  creator: "Pemerintah Desa Sei Rotan",
  publisher: "Pemerintah Desa Sei Rotan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/assets/img/logo-deli-serdang.png",
    apple: "/assets/img/logo-deli-serdang.png",
  },
  verification: {
    google: "your-google-verification-code", // Ganti dengan kode verifikasi Google Search Console
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="canonical" href="https://seirotan.desa.id" />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <MainLayout>{children}</MainLayout>
        </SettingsProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
