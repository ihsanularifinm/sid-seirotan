import { Metadata } from "next";
import { getOfficials, VillageOfficial } from "../../services/api";
import { PLACEHOLDERS } from "@/utils/placeholder";
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';
import PemerintahanClient from './PemerintahanClient';

/**
 * Generate dynamic metadata for pemerintahan page
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  
  return createMetadata(settings, {
    pageTitle: 'Pemerintahan Desa',
    pageDescription: `Kenali aparatur ${siteName} yang berdedikasi untuk melayani masyarakat. Lihat daftar nama dan jabatan para pejabat desa.`,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/pemerintahan`,
    imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/assets/img/hero-image.jpg`,
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

export default async function PemerintahanPage() {
  const officials: VillageOfficial[] = await getOfficials();
  // Sort by display_order
  officials.sort((a, b) => a.display_order - b.display_order);
  const settings = await getSettings();
  
  // Get organizational structure image from government settings
  const governmentSettings = settings?.government || {};
  const strukturImage = governmentSettings.organizational_structure_image || PLACEHOLDERS.struktur;

  // Group officials by hamlet (using hamlet_id for grouping/sorting, hamlet_name for display)
  const groupedOfficials = officials.reduce((acc, official) => {
    // Use hamlet_id for grouping key (includes suffix like 3A, 3B), or 'general' if none
    const key = official.hamlet_id || (official.hamlet_name ? `name_${official.hamlet_name}` : 'general');
    if (!acc[key]) acc[key] = [];
    acc[key].push(official);
    return acc;
  }, {} as Record<string, VillageOfficial[]>);

  // Sort groups: hamlet IDs first (ascending), then named hamlets, then general
  const sortedGroups = Object.entries(groupedOfficials).sort(([a], [b]) => {
    if (a === 'general') return 1; // General group last
    if (b === 'general') return -1;
    if (a.startsWith('name_') && b.startsWith('name_')) return a.localeCompare(b); // Sort named hamlets alphabetically
    if (a.startsWith('name_')) return 1; // Named hamlets after numbered
    if (b.startsWith('name_')) return -1;
    
    // Sort hamlet IDs (e.g., "1", "2", "3A", "3B", "4")
    // Extract numeric part and suffix for proper sorting
    const parseHamletId = (id: string) => {
      const match = id.match(/^(\d+)([A-Z]?)$/);
      if (!match) return { num: 0, suffix: '' };
      return { num: parseInt(match[1]), suffix: match[2] };
    };
    
    const parsedA = parseHamletId(a);
    const parsedB = parseHamletId(b);
    
    // First sort by number
    if (parsedA.num !== parsedB.num) {
      return parsedA.num - parsedB.num;
    }
    
    // Then sort by suffix (A before B, etc.)
    return parsedA.suffix.localeCompare(parsedB.suffix);
  });

  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id';
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: `Pemerintah ${siteName}`,
    url: `${siteUrl}/pemerintahan`,
    member: officials.map((official) => ({
      '@type': 'Person',
      name: official.name,
      jobTitle: official.position,
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Pemerintahan {siteName}
      </h1>

      {/* Pass data to client component for interactivity */}
      <PemerintahanClient 
        sortedGroups={sortedGroups}
        strukturImage={strukturImage}
        siteName={siteName}
      />
    </main>
  );
}