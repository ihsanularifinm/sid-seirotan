import { Metadata } from "next";
import { Suspense } from 'react';
import NewsList from '@/components/NewsList';
import Skeleton from '@/components/ui/Skeleton';
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for berita page
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  
  return createMetadata(settings, {
    pageTitle: 'Berita Desa',
    pageDescription: `Berita dan informasi terbaru seputar kegiatan dan pembangunan di ${siteName}.`,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/berita`,
  });
}

export const dynamic = 'force-dynamic';

export default function BeritaPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Berita & Informasi Desa</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Dapatkan informasi terbaru mengenai kegiatan, pengumuman, dan pembangunan yang ada di desa.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
           <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden h-96">
             <Skeleton className="h-48 w-full" />
             <div className="p-6 space-y-4">
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-6 w-full" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
             </div>
           </div>
        ))}
      </div>}>
        <NewsList />
      </Suspense>
    </main>
  );
}