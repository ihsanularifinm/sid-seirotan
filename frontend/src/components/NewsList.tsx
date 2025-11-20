import Link from 'next/link';
import Image from 'next/image';
import { getNews } from '@/services/api';
import { getMediaUrl } from '@/lib/mediaUrl';

export default async function NewsList() {
  const { data: news } = await getNews();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
          <div className="relative h-48 w-full">
            <Image
              src={getMediaUrl(item.featured_image_url)}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <div className="text-sm text-gray-500 mb-2">{new Date(item.created_at).toLocaleDateString()}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{item.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
              {item.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
            </p>
            <Link href={`/berita/${item.slug}`} className="text-blue-600 font-semibold hover:text-blue-800 mt-auto inline-block">
              Baca Selengkapnya &rarr;
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
