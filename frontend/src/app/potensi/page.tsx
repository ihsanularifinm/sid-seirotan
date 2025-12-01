import { Metadata } from "next";
import Image from 'next/image';
import { getPotentials, Potential } from "../../services/api";
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for potensi page
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  
  return createMetadata(settings, {
    pageTitle: 'Potensi Desa',
    pageDescription: `Jelajahi berbagai potensi yang dimiliki ${siteName}, mulai dari sektor pertanian, perkebunan, peternakan, hingga UMKM yang berkembang.`,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/potensi`,
    imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/assets/img/potensi-pertanian.jpg`,
  });
}

export const dynamic = 'force-dynamic';

async function getSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/v1/settings`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

export default async function Potensi() {
  const potentials: Potential[] = await getPotentials();
  const settings = await getSettings();
  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Potensi ${siteName}`,
    description: `Berbagai potensi yang dimiliki ${siteName}, mulai dari sektor pertanian, perkebunan, peternakan, hingga UMKM.`,
    itemListElement: potentials.map((potential, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: potential.title,
        description: potential.description,
        image: potential.cover_image_url || `${siteUrl}/assets/img/placeholder.png`,
      },
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Potensi {siteName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {potentials.map((potential) => (
          <div key={potential.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3">
              <Image
                src={potential.cover_image_url || '/assets/img/placeholder.png'}
                alt={`Potensi ${potential.title}`}
                width={400}
                height={400}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            <div className="p-6 w-full md:w-2/3">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">{potential.title}</h3>
              <p className="text-gray-600">{potential.description}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}