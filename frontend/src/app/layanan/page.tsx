import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layanan Administrasi Desa Sei Rotan",
  description: "Informasi lengkap mengenai layanan administrasi yang tersedia di Desa Sei Rotan, termasuk persyaratan dan prosedur.",
  openGraph: {
    title: "Layanan Administrasi Desa Sei Rotan",
    description: "Informasi lengkap mengenai layanan administrasi yang tersedia di Desa Sei Rotan.",
    url: "https://seirotan.desa.id/layanan",
    images: [
      {
        url: "https://seirotan.desa.id/assets/img/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Layanan Desa Sei Rotan",
      },
    ],
  },
};

export const dynamic = 'force-dynamic';

import { getServices, Service } from "../../services/api";

export default async function LayananPage() {
  const services: Service[] = await getServices();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.service_name,
        description: service.description,
        provider: {
          '@type': 'GovernmentOrganization',
          name: 'Pemerintah Desa Sei Rotan',
        },
      },
    })),
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Layanan Administrasi Desa</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.service_name}</h3>
            <p className="text-gray-600">{service.description}</p>
            {service.requirements && (
              <div className="mt-4 pt-4 border-t w-full">
                <h4 className="font-semibold text-gray-700">Persyaratan:</h4>
                <p className="text-gray-600 text-sm">{service.requirements}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}