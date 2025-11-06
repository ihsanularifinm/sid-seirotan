import { Metadata } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const news: News = await getNewsDetail(awaitedParams.slug);
  const plainContent = news.content.replace(/<[^>]*>?/gm, ''); // Simple way to strip HTML tags for description

  return {
    title: `${news.title} - Berita Desa Sei Rotan`,
    description: plainContent.substring(0, 160),
    openGraph: {
      title: news.title,
      description: plainContent.substring(0, 160),
      url: `https://seirotan.desa.id/berita/${news.slug}`,
      type: 'article',
      publishedTime: new Date(news.created_at).toISOString(),
      images: [
        {
          url: news.featured_image_url ? `${apiUrl}${news.featured_image_url}` : 'https://seirotan.desa.id/assets/img/hero-image.jpg',
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
  };
}

import Image from 'next/image';
import Link from 'next/link';

import { News } from '@/types/news';

async function getNewsDetail(slug: string) {
  const res = await fetch(`${apiUrl}/api/v1/posts/slug/${slug}`);
  if (!res.ok) {
    throw new Error('Failed to fetch news detail');
  }
  return res.json();
}

export default async function DetailBeritaPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await params;
  const news: News = await getNewsDetail(awaitedParams.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://seirotan.desa.id/berita/${news.slug}`,
    },
    headline: news.title,
    image: news.featured_image_url ? `${apiUrl}${news.featured_image_url}` : 'https://seirotan.desa.id/assets/img/hero-image.jpg',
    datePublished: new Date(news.created_at).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Pemerintah Desa Sei Rotan',
      url: 'https://seirotan.desa.id',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pemerintah Desa Sei Rotan',
      logo: {
        '@type': 'ImageObject',
        url: 'https://seirotan.desa.id/assets/img/logo-deli-serdang.png',
      },
    },
    description: news.content.replace(/<[^>]*>?/gm, '').substring(0, 160),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto mb-4">
        <Link href="/berita" className="text-blue-600 hover:underline">
          &larr; Kembali ke Daftar Berita
        </Link>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">{news.title}</h1>
        <p className="text-gray-500 text-sm mt-4">Dipublikasikan pada {new Date(news.created_at).toLocaleDateString()}</p>

        <Image src={news.featured_image_url ? `${apiUrl}${news.featured_image_url}` : '/assets/img/berita1-large.jpg'} alt={news.title} width={800} height={450} className="w-full h-auto my-8 rounded-lg" unoptimized />

        <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: news.content }} />
      </article>
    </main>
  );
}