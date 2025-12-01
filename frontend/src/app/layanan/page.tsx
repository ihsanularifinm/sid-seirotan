import { Metadata } from "next";
import { getServices, Service } from "../../services/api";
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for layanan page
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  
  return createMetadata(settings, {
    pageTitle: 'Layanan Administrasi Desa',
    pageDescription: `Informasi lengkap mengenai layanan administrasi yang tersedia di ${siteName}, termasuk persyaratan dan prosedur.`,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/layanan`,
    imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/assets/img/hero-image.jpg`,
  });
}

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

export default async function LayananPage() {
  const services: Service[] = await getServices();
  const settings = await getSettings();
  const siteName = settings?.general?.site_name || 'Website Desa';

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
          name: `Pemerintah ${siteName}`,
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