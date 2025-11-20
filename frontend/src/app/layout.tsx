import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Desa Sei Rotan",
    default: "Desa Sei Rotan",
  },
  description: "Sistem Informasi Desa Sei Rotan",
  icons: {
    icon: "/assets/img/logo-deli-serdang.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
