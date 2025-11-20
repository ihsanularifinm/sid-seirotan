import { Metadata } from 'next';
import Image from 'next/image';
import VillageProfile from '@/components/VillageProfile';

export const metadata: Metadata = {
	title: 'Profil Desa Sei Rotan - Sejarah, Visi Misi, dan Struktur Organisasi',
	description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta lihat struktur organisasi pemerintahan desa kami.',
	openGraph: {
		title: 'Profil Desa Sei Rotan',
		description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta lihat struktur organisasi pemerintahan desa kami.',
		url: 'https://seirotan.desa.id/profil',
		images: [
			{
				url: 'https://seirotan.desa.id/assets/img/struktur-organisasi.png',
				width: 1000,
				height: 700,
				alt: 'Struktur Organisasi Desa Sei Rotan',
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
		description: 'Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta lihat struktur organisasi pemerintahan desa kami.',
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

			{/* Struktur Organisasi */}
			<section className="container mx-auto px-4 pb-12">
				<h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Struktur Organisasi Pemerintahan Desa</h2>
				<div className="flex justify-center">
					<Image 
						src="/assets/img/struktur-organisasi.png" 
						alt="Struktur Organisasi Desa Sei Rotan" 
						width={1000} 
						height={700} 
						className="rounded-lg shadow-md" 
					/>
				</div>
			</section>
		</>
	);
}
