import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { fetchSettingsForMetadata, generateRootMetadata } from "@/lib/metadata";

const inter = Inter({ subsets: ["latin"] });

/**
 * Generate dynamic metadata based on site settings
 * Fetches settings server-side to populate title, description, and other metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const metadata = generateRootMetadata(settings);
  
  // Add verification if needed
  return {
    ...metadata,
    verification: {
      google: "your-google-verification-code", // Replace with actual Google Search Console verification code
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <SettingsProvider>
          <MainLayout>{children}</MainLayout>
        </SettingsProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
