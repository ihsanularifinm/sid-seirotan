import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemerintahan Desa Sei Rotan - Aparatur Desa",
  description: "Kenali aparatur Desa Sei Rotan yang berdedikasi untuk melayani masyarakat. Lihat daftar nama dan jabatan para pejabat desa.",
  openGraph: {
    title: "Pemerintahan Desa Sei Rotan",
    description: "Kenali aparatur Desa Sei Rotan yang berdedikasi untuk melayani masyarakat.",
    url: "https://seirotan.desa.id/pemerintahan",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kantor Desa Sei Rotan",
      },
    ],
  },
};

import Image from 'next/image';

type VillageOfficial = {
  id: number;
  name: string;
  position: string;
  photo_url: string;
};

async function getOfficials() {
  const res = await fetch('http://localhost:8081/api/v1/officials');
  if (!res.ok) {
    throw new Error('Failed to fetch officials');
  }
  return res.json();
}

export default async function PemerintahanPage() {
  const officials: VillageOfficial[] = await getOfficials();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Pemerintah Desa Sei Rotan',
    url: 'https://seirotan.desa.id/pemerintahan',
    member: officials.map((official) => ({
      '@type': 'Person',
      name: official.name,
      jobTitle: official.position,
      image: official.photo_url ? `http://localhost:8081${official.photo_url}` : 'https://seirotan.desa.id/assets/img/placeholder.png',
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Aparatur Desa Sei Rotan</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {officials.map((official) => (
          <div key={official.id} className="text-center">
            <Image
              src={official.photo_url ? `http://localhost:8081${official.photo_url}` : '/assets/img/placeholder.png'}
              alt={`Foto ${official.name}`}
              width={150}
              height={150}
              className="w-36 h-36 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white hover:shadow-xl transition-shadow duration-300"
              unoptimized
            />
            <h3 className="font-bold text-md text-gray-800">{official.name}</h3>
            <p className="text-sm text-gray-500">{official.position}</p>
          </div>
        ))}
      </div>
    </main>
  );
}