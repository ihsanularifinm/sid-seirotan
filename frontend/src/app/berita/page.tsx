import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita Terbaru dari Desa Sei Rotan",
  description: "Ikuti berita dan informasi terkini seputar kegiatan, pembangunan, dan peristiwa di Desa Sei Rotan.",
  openGraph: {
    title: "Berita Terbaru dari Desa Sei Rotan",
    description: "Ikuti berita dan informasi terkini seputar kegiatan, pembangunan, dan peristiwa di Desa Sei Rotan.",
    url: "https://seirotan.desa.id/berita",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Berita Desa Sei Rotan",
      },
    ],
  },
};

import Link from 'next/link';
import Image from 'next/image';
import Pagination from '@/components/layout/Pagination';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type News = {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  featured_image_url: string;
};

type NewsApiResponse = {
  data: News[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

async function getNews(page: number = 1) {
  const res = await fetch(`${apiUrl}/api/v1/posts?page=${page}&limit=9`);
  if (!res.ok) {
    throw new Error('Failed to fetch news');
  }
  return res.json();
}

export default async function BeritaPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
  const { data: news, currentPage, totalPages }: NewsApiResponse = await getNews(page);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Berita Desa Sei Rotan',
    description: 'Berita dan informasi terkini dari Desa Sei Rotan.',
    publisher: {
      '@type': 'Organization',
      name: 'Pemerintah Desa Sei Rotan',
      logo: {
        '@type': 'ImageObject',
        url: 'https://seirotan.desa.id/assets/img/logo-deli-serdang.png',
      },
    },
    blogPost: news.map((item) => ({
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://seirotan.desa.id/berita/${item.slug}`,
      },
      headline: item.title,
      image: item.featured_image_url || 'https://seirotan.desa.id/assets/img/placeholder.png',
      datePublished: new Date(item.created_at).toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Pemerintah Desa Sei Rotan',
      },
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Arsip Berita</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <Link href={`/berita/${item.slug}`} key={item.id} className="block bg-white rounded-lg shadow-md overflow-hidden group">
            <Image src={item.featured_image_url ? `${apiUrl}${item.featured_image_url}` : '/assets/img/placeholder.png'} alt={item.title} width={400} height={250} className="w-full h-48 object-cover group-hover:opacity-80 transition" unoptimized />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">{new Date(item.created_at).toLocaleDateString()}</p>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">{item.title}</h3>
              <p className="text-gray-600 mt-2 text-sm" dangerouslySetInnerHTML={{ __html: item.content.substring(0, 100) + '...' }}></p>
            </div>
          </Link>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </main>
  );
}