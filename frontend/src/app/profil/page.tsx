import { Metadata } from 'next';
import VillageProfile from '@/components/VillageProfile';

export const metadata: Metadata = {
	title: 'Profil Desa Sei Rotan - Sejarah, Visi Misi, dan Demografi',
	description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta informasi demografi desa kami.',
	openGraph: {
		title: 'Profil Desa Sei Rotan',
		description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta informasi demografi desa kami.',
		url: 'https://seirotan.desa.id/profil',
		images: [
			{
				url: 'https://seirotan.desa.id/assets/img/hero-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Profil Desa Sei Rotan',
			},
		],
	},
};

export default function ProfilPage() {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		url: 'https://seirotan.desa.id/profil',
		name: 'Profil Desa Sei Rotan',
		description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta informasi demografi desa kami.',
		publisher: {
			'@type': 'Organization',
			name: 'Pemerintah Desa Sei Rotan',
			logo: {
				'@type': 'ImageObject',
				url: 'https://seirotan.desa.id/assets/img/logo-deli-serdang.png',
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
