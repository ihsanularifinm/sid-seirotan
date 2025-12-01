import { Metadata } from "next";

export const dynamic = 'force-dynamic';

// Note: This metadata should be generated dynamically from settings
// For now using generic placeholders - will be replaced by dynamic metadata in layout.tsx
// Note: Metadata is generated dynamically in layout.tsx

import Image from "next/image";
import Link from "next/link";
import { FaUsers, FaLeaf, FaNewspaper } from "react-icons/fa";
import { FaBuildingColumns } from "react-icons/fa6";

import { getNews, getOfficials, News, VillageOfficial } from "../services/api";
import HeroSlider from "@/components/HeroSlider";
import { getMediaUrl } from "@/lib/mediaUrl";

export default async function Home() {
  const latestNews: News[] = (await getNews(1, 3)).data;
  const allOfficials: VillageOfficial[] = await getOfficials();

  const kepalaDesa = allOfficials.find(o => o.position.includes("Kepala Desa"));
  const sekretarisDesa = allOfficials.find(o => o.position === "Sekretaris Desa");

  return (
    <main>
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Quick Links/Services Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Link href="/layanan" className="block p-6 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <FaUsers className="text-4xl text-blue-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-700">Layanan Warga</h3>
            </Link>
            <Link href="/potensi" className="block p-6 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <FaLeaf className="text-4xl text-green-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-700">Potensi Desa</h3>
            </Link>
            <Link href="/pemerintahan" className="block p-6 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <FaBuildingColumns className="text-4xl text-yellow-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-700">Pemerintahan</h3>
            </Link>
            <Link href="/berita" className="block p-6 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <FaNewspaper className="text-4xl text-red-600 mb-3 mx-auto" />
              <h3 className="font-semibold text-gray-700">Berita Desa</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Village Officials Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Pemerintah Desa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {kepalaDesa && (
              <div className="text-center">
                <Image 
                  src={getMediaUrl(kepalaDesa.photo_url)} 
                  alt={kepalaDesa.name} 
                  width={128} 
                  height={128} 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white"
                  unoptimized={kepalaDesa.photo_url?.includes('placehold.co')}
                />
                <h3 className="font-bold text-lg text-gray-800">{kepalaDesa.name}</h3>
                <p className="text-sm text-gray-500">{kepalaDesa.position}</p>
              </div>
            )}
            {sekretarisDesa && (
              <div className="text-center">
                <Image 
                  src={getMediaUrl(sekretarisDesa.photo_url)} 
                  alt={sekretarisDesa.name} 
                  width={128} 
                  height={128} 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white"
                  unoptimized={sekretarisDesa.photo_url?.includes('placehold.co')}
                />
                <h3 className="font-bold text-lg text-gray-800">{sekretarisDesa.name}</h3>
                <p className="text-sm text-gray-500">{sekretarisDesa.position}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Berita Terkini</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestNews.map((item) => (
            <Link href={`/berita/${item.slug}`} key={item.id} className="block bg-white rounded-lg shadow-md overflow-hidden group">
              <Image 
                src={getMediaUrl(item.featured_image_url)} 
                alt={item.title} 
                width={400} 
                height={250} 
                className="w-full h-48 object-cover group-hover:opacity-80 transition"
                unoptimized={item.featured_image_url?.includes('placehold.co')}
              />
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{new Date(item.created_at).toLocaleDateString()}</p>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">{item.title}</h3>
                <p className="text-gray-600 mt-2 text-sm" dangerouslySetInnerHTML={{ __html: item.content.substring(0, 100) + '...' }}></p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/berita" className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition">
            Lihat Semua Berita
          </Link>
        </div>
      </section>
    </main>
  );
}