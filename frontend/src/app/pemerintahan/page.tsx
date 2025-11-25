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

export const dynamic = 'force-dynamic';

import Image from 'next/image';

import { getOfficials, VillageOfficial } from "../../services/api";
import { getMediaUrl } from "@/lib/mediaUrl";
import { getPlaceholder } from "@/utils/placeholder";
import { toRomanNumeral } from "@/utils/romanNumerals";

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

export default async function PemerintahanPage() {
  const officials: VillageOfficial[] = await getOfficials();
  const settings = await getSettings();
  
  // Get organizational structure image from government settings
  const governmentSettings = settings?.government || {};
  const strukturImage = governmentSettings.organizational_structure_image || getPlaceholder(1200, 800, 'Struktur Organisasi\n1200x800px');

  // Group officials by hamlet (using hamlet_number for grouping/sorting, hamlet_name for display)
  const groupedOfficials = officials.reduce((acc, official) => {
    // Use hamlet_number for grouping key (for sorting), or 'general' if none
    const key = official.hamlet_number?.toString() || (official.hamlet_name ? `name_${official.hamlet_name}` : 'general');
    if (!acc[key]) acc[key] = [];
    acc[key].push(official);
    return acc;
  }, {} as Record<string, VillageOfficial[]>);

  // Sort groups: hamlet numbers first (ascending), then named hamlets, then general
  const sortedGroups = Object.entries(groupedOfficials).sort(([a], [b]) => {
    if (a === 'general') return 1; // General group last
    if (b === 'general') return -1;
    if (a.startsWith('name_') && b.startsWith('name_')) return a.localeCompare(b); // Sort named hamlets alphabetically
    if (a.startsWith('name_')) return 1; // Named hamlets after numbered
    if (b.startsWith('name_')) return -1;
    return parseInt(a) - parseInt(b); // Sort numbered hamlets numerically
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Pemerintah Desa Sei Rotan',
    url: 'https://seirotan.desa.id/pemerintahan',
    member: officials.map((official) => ({
      '@type': 'Person',
      name: official.name,
      jobTitle: official.position,
      image: getMediaUrl(official.photo_url),
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Pemerintahan Desa Sei Rotan
      </h1>

      {/* Aparatur Desa Section - Grouped by Hamlet */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
          Aparatur Desa
        </h2>
        
        {sortedGroups.map(([hamletKey, groupOfficials]) => {
          // Determine display name for hamlet
          let hamletDisplayName = 'Aparatur Desa';
          if (hamletKey !== 'general') {
            const firstOfficial = groupOfficials[0];
            if (firstOfficial.hamlet_name) {
              hamletDisplayName = `Dusun ${firstOfficial.hamlet_name}`;
            } else if (firstOfficial.hamlet_number) {
              hamletDisplayName = `Dusun ${toRomanNumeral(firstOfficial.hamlet_number)}`;
            }
          }
          
          return (
          <div key={hamletKey} className="mb-12">
            {/* Group Header */}
            <h3 className="text-xl font-semibold text-gray-600 mb-6 text-center">
              {hamletDisplayName}
            </h3>
            
            {/* Officials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {groupOfficials.map((official) => (
                <div key={official.id} className="text-center">
                  <Image
                    src={getMediaUrl(official.photo_url)}
                    alt={`Foto ${official.name}`}
                    width={150}
                    height={150}
                    className="w-36 h-36 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white hover:shadow-xl transition-shadow duration-300"
                  />
                  <h4 className="font-bold text-md text-gray-800">{official.name}</h4>
                  <p className="text-sm text-gray-500">{official.position}</p>
                </div>
              ))}
            </div>
          </div>
        );
        })}
      </section>

      {/* Struktur Organisasi Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Struktur Organisasi
        </h2>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-5xl">
            <Image
              src={strukturImage.startsWith('data:') || strukturImage.startsWith('http') ? strukturImage : getMediaUrl(strukturImage)}
              alt="Struktur Organisasi Pemerintahan Desa Sei Rotan"
              width={1200}
              height={800}
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      </section>
    </main>
  );
}