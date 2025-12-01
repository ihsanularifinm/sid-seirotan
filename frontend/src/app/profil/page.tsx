import { Metadata } from 'next';
import VillageProfile from '@/components/VillageProfile';
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for profile page
 */
export async function generateMetadata(): Promise<Metadata> {
	const settings = await fetchSettingsForMetadata();
	const siteName = settings?.general?.site_name || 'Website Desa';
	
	return createMetadata(settings, {
		pageTitle: 'Profil Desa',
		pageDescription: `Mengenal lebih dekat ${siteName}. Pelajari sejarah, visi dan misi, serta informasi demografi desa kami.`,
		pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/profil`,
		imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/assets/img/hero-image.jpg`,
	});
}

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

export default async function ProfilPage() {
	const settings = await getSettings();
	const siteName = settings?.general?.site_name || 'Website Desa';
	const siteLogo = settings?.general?.site_logo || '/assets/img/logo-deli-serdang.png';
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id';
	
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: `${siteUrl}/profil`,
		name: `Profil ${siteName}`,
		description: `Mengenal lebih dekat ${siteName}. Pelajari sejarah, visi dan misi, serta informasi demografi desa kami.`,
		publisher: {
			'@type': 'Organization',
			name: `Pemerintah ${siteName}`,
			logo: {
				'@type': 'ImageObject',
				url: siteLogo.startsWith('http') ? siteLogo : `${siteUrl}/uploads/${siteLogo}`,
			},
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			
			{/* Dynamic Village Profile */}
			<VillageProfile />
		</>
	);
}
