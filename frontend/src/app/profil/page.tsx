import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Desa Sei Rotan - Sejarah, Visi Misi, dan Struktur Organisasi",
  description: "Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta lihat struktur organisasi pemerintahan desa kami.",
  openGraph: {
    title: "Profil Desa Sei Rotan",
    description: "Mengenal lebih dekat Desa Sei Rotan. Pelajari sejarah, visi dan misi, serta lihat struktur organisasi pemerintahan desa kami.",
    url: "https://seirotan.desa.id/profil",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/struktur-organisasi.png",
        width: 1000,
        height: 700,
        alt: "Struktur Organisasi Desa Sei Rotan",
      },
    ],
  },
};

import Image from 'next/image';

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
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Profil Desa Sei Rotan</h1>

      {/* Sejarah Desa */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sejarah Desa</h2>
        <p className="text-gray-600 leading-relaxed">
          Desa Sei Rotan adalah salah satu desa di Kecamatan Percut Sei Tuan, Kabupaten Deli Serdang, Provinsi Sumatera Utara. Desa ini memiliki sejarah panjang yang berkaitan erat dengan perkembangan perkebunan tembakau di era kolonial Belanda. Nama "Sei Rotan" sendiri konon berasal dari banyaknya tanaman rotan yang tumbuh di sepanjang sungai yang melintasi desa ini. Seiring berjalannya waktu, Desa Sei Rotan berkembang menjadi pemukiman yang padat dengan berbagai mata pencaharian warganya, mulai dari pertanian, perdagangan, hingga industri kecil.
        </p>
      </section>

      {/* Visi & Misi */}
      <section className="mb-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Visi dan Misi</h2>
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800">Visi</h3>
          <p className="text-gray-600 mt-2 italic">"Mewujudkan Desa Sei Rotan yang Maju, Mandiri, Sejahtera, dan Berbudaya Berlandaskan Iman dan Taqwa"</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 text-center">Misi</h3>
          <ol className="list-decimal list-inside mt-4 max-w-2xl mx-auto text-gray-600 space-y-2">
            <li>Meningkatkan kualitas sumber daya manusia melalui program pendidikan dan kesehatan.</li>
            <li>Mengembangkan perekonomian desa berbasis potensi lokal dan inovasi.</li>
            <li>Meningkatkan tata kelola pemerintahan yang bersih, transparan, dan akuntabel.</li>
            <li>Membangun infrastruktur yang merata dan berwawasan lingkungan.</li>
            <li>Melestarikan nilai-nilai budaya dan kearifan lokal.</li>
          </ol>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section>
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
    </main>
  );
}