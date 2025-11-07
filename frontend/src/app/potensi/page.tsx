import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potensi Desa Sei Rotan - Pertanian, Perkebunan, Peternakan, dan UMKM",
  description: "Jelajahi berbagai potensi yang dimiliki Desa Sei Rotan, mulai dari sektor pertanian, perkebunan, peternakan, hingga UMKM yang berkembang.",
  openGraph: {
    title: "Potensi Unggulan Desa Sei Rotan",
    description: "Jelajahi berbagai potensi yang dimiliki Desa Sei Rotan, mulai dari sektor pertanian, perkebunan, peternakan, hingga UMKM yang berkembang.",
    url: "https://seirotan.desa.id/potensi",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/potensi-pertanian.jpg",
        width: 1200,
        height: 630,
        alt: "Potensi Pertanian Desa Sei Rotan",
      },
    ],
  },
};

import Image from 'next/image';

type Potential = {
  id: number;
  title: string;
  description: string;
  cover_image_url: string;
  type: string;
};

async function getPotentials() {
  const apiBaseUrl = typeof window === 'undefined' 
    ? 'http://localhost:8081' 
    : process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiBaseUrl}/api/v1/potentials`);
  if (!res.ok) {
    throw new Error('Failed to fetch potentials');
  }
  return res.json();
}

export default async function PotensiPage() {
  const potentials: Potential[] = await getPotentials();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Potensi Desa Sei Rotan',
    description: 'Berbagai potensi yang dimiliki Desa Sei Rotan, mulai dari sektor pertanian, perkebunan, peternakan, hingga UMKM.',
    itemListElement: potentials.map((potential, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: potential.title,
        description: potential.description,
        image: potential.cover_image_url || 'https://seirotan.desa.id/assets/img/placeholder.png',
      },
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Potensi Desa Sei Rotan</h1>
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