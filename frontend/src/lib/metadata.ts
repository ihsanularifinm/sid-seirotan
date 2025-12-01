import { Metadata } from 'next';
import { SiteSettings } from '@/contexts/SettingsContext';
import { transformSettings } from '@/utils/settingsAdapter';

/**
 * Fetch site settings server-side for metadata generation
 * This function is designed to be used in server components
 */
export async function fetchSettingsForMetadata(): Promise<SiteSettings | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/v1/settings`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch settings for metadata:', res.status);
      return null;
    }
    
    const data = await res.json();
    return transformSettings(data);
  } catch (error) {
    console.error('Error fetching settings for metadata:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata from site settings
 * Supports different page types with customizable titles
 * 
 * @param settings - Site settings object
 * @param pageTitle - Optional page-specific title (e.g., "Kontak Kami", "Profil Desa")
 * @param pageDescription - Optional page-specific description
 * @param pageUrl - Optional page URL for canonical and OG tags
 * @param imageUrl - Optional image URL for OG tags
 * @returns Metadata object for Next.js
 */
export function generateMetadata(
  settings: SiteSettings | null,
  options?: {
    pageTitle?: string;
    pageDescription?: string;
    pageUrl?: string;
    imageUrl?: string;
  }
): Metadata {
  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteDescription = settings?.general?.site_description || 'Website resmi pemerintah desa';
  const district = settings?.general?.district || '';
  const regency = settings?.general?.regency || '';
  
  // Build enhanced description with location info
  let enhancedDescription = siteDescription;
  if (district && regency) {
    enhancedDescription = `${siteName}, Kec. ${district}, Kab. ${regency}. ${siteDescription}`;
  } else if (district) {
    enhancedDescription = `${siteName}, Kec. ${district}. ${siteDescription}`;
  } else if (regency) {
    enhancedDescription = `${siteName}, Kab. ${regency}. ${siteDescription}`;
  }
  
  // Determine final title and description
  const finalTitle = options?.pageTitle 
    ? options.pageTitle
    : `${siteName} - Website Resmi Pemerintah Desa`;
  
  const finalDescription = options?.pageDescription || enhancedDescription;
  
  // Build keywords array
  const keywords = [siteName];
  if (district) keywords.push(district);
  if (regency) keywords.push(regency);
  keywords.push('Pemerintah Desa', 'Layanan Desa', 'Berita Desa');
  
  // Base metadata
  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: keywords,
    authors: [{ name: `Pemerintah ${siteName}` }],
    creator: `Pemerintah ${siteName}`,
    publisher: `Pemerintah ${siteName}`,
    openGraph: {
      title: options?.pageTitle || siteName,
      description: finalDescription,
      siteName: siteName,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: options?.pageTitle || siteName,
      description: finalDescription,
    },
  };
  
  // Add URL if provided
  if (options?.pageUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      url: options.pageUrl,
    };
    metadata.alternates = {
      canonical: options.pageUrl,
    };
  }
  
  // Add image if provided
  if (options?.imageUrl) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: options.imageUrl,
          width: 1200,
          height: 630,
          alt: options?.pageTitle || siteName,
        },
      ],
    };
    metadata.twitter = {
      ...metadata.twitter,
      images: [options.imageUrl],
    };
  }
  
  return metadata;
}

/**
 * Generate root layout metadata with title template
 * This is used for the main layout.tsx file
 * 
 * @param settings - Site settings object
 * @returns Metadata object with title template
 */
export function generateRootMetadata(settings: SiteSettings | null): Metadata {
  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteDescription = settings?.general?.site_description || 'Website resmi pemerintah desa';
  const district = settings?.general?.district || '';
  const regency = settings?.general?.regency || '';
  const siteLogo = settings?.general?.site_logo || '/assets/img/logo-deli-serdang.png';
  
  // Build enhanced description with location info
  let enhancedDescription = siteDescription;
  if (district && regency) {
    enhancedDescription = `Website Resmi ${siteName}, Kecamatan ${district}, Kabupaten ${regency}. ${siteDescription}`;
  } else if (district) {
    enhancedDescription = `Website Resmi ${siteName}, Kecamatan ${district}. ${siteDescription}`;
  } else if (regency) {
    enhancedDescription = `Website Resmi ${siteName}, Kabupaten ${regency}. ${siteDescription}`;
  }
  
  // Build keywords array
  const keywords = [siteName];
  if (district) keywords.push(district);
  if (regency) keywords.push(regency);
  keywords.push('Pemerintah Desa', 'Layanan Desa', 'Berita Desa', 'Potensi Desa');
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'),
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} - Website Resmi Pemerintah Desa`,
    },
    description: enhancedDescription,
    keywords: keywords,
    authors: [{ name: `Pemerintah ${siteName}` }],
    creator: `Pemerintah ${siteName}`,
    publisher: `Pemerintah ${siteName}`,
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
      icon: siteLogo.startsWith('http') ? siteLogo : `/uploads/${siteLogo}`,
      apple: siteLogo.startsWith('http') ? siteLogo : `/uploads/${siteLogo}`,
    },
    openGraph: {
      title: siteName,
      description: enhancedDescription,
      siteName: siteName,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: enhancedDescription,
    },
  };
}
