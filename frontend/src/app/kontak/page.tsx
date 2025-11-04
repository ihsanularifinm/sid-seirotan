import { Metadata } from "next";
import KontakForm from "./KontakForm";

export const metadata: Metadata = {
  title: "Hubungi Kami - Desa Sei Rotan",
  description: "Halaman kontak resmi Desa Sei Rotan. Hubungi kami untuk informasi, layanan, atau pertanyaan lain. Kami siap melayani Anda.",
  openGraph: {
    title: "Hubungi Kami - Desa Sei Rotan",
    description: "Halaman kontak resmi Desa Sei Rotan. Hubungi kami untuk informasi, layanan, atau pertanyaan lain. Kami siap melayani Anda.",
    url: "https://seirotan.desa.id/kontak",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kantor Desa Sei Rotan",
      },
    ],
  },
};

export default function KontakPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOffice',
    name: 'Kantor Desa Sei Rotan',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Pendidikan, Desa Sei Rotan',
      addressLocality: 'Percut Sei Tuan',
      addressRegion: 'Deli Serdang',
      postalCode: '20371',
      addressCountry: 'ID',
    },
    telephone: '+62-61-123-4567',
    email: 'desaseirotan@gmail.com',
    url: 'https://seirotan.desa.id/kontak',
    image: 'https://seirotan.desa.id/assets/img/hero-image.jpg',
    openingHours: 'Mo-Th 08:00-16:00, Fr 08:00-15:00',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KontakForm />
    </>
  );
}