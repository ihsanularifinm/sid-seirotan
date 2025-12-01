import { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { getMediaUrl } from '@/lib/mediaUrl';
import { getNewsBySlug, News } from "../../../services/api";
import { fetchSettingsForMetadata } from '@/lib/metadata';

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const news: News = await getNewsDetail(awaitedParams.slug);
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id';
  const plainContent = news.content.replace(/<[^>]*>?/gm, ''); // Simple way to strip HTML tags for description

  return {
    title: `${news.title} | ${siteName}`,
    description: plainContent.substring(0, 160),
    openGraph: {
      title: news.title,
      description: plainContent.substring(0, 160),
      url: `${siteUrl}/berita/${news.slug}`,
      type: 'article',
      publishedTime: new Date(news.created_at).toISOString(),
      images: [
        {
          url: getMediaUrl(news.featured_image_url),
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
  };
}

async function getNewsDetail(slug: string) {
  return getNewsBySlug(slug);
}

export default async function DetailBeritaPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await params;
  const news: News = await getNewsDetail(awaitedParams.slug);
  const settings = await getSettings();
  const siteName = settings?.general?.site_name || 'Website Desa';
  const siteLogo = settings?.general?.site_logo || '/assets/img/logo-deli-serdang.png';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/berita/${news.slug}`,
    },
    headline: news.title,
    image: getMediaUrl(news.featured_image_url),
    datePublished: new Date(news.created_at).toISOString(),
    author: {
      '@type': 'Organization',
      name: `Pemerintah ${siteName}`,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: `Pemerintah ${siteName}`,
      logo: {
        '@type': 'ImageObject',
        url: siteLogo.startsWith('http') ? siteLogo : `${siteUrl}/uploads/${siteLogo}`,
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

        <Image src={getMediaUrl(news.featured_image_url)} alt={news.title} width={800} height={450} className="w-full h-auto my-8 rounded-lg" />

        <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />
      </article>
    </main>
  );
}