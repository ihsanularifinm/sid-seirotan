'use client';

import { useSettings } from '@/contexts/SettingsContext';
import ContactInfo from '@/components/ContactInfo';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import ContactForm from '@/components/ContactForm';
import ContactMap from '@/components/ContactMap';
import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

export default function ContactPageClient() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Main Contact Section */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Hubungi Kami</h1>
          <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            Kami siap melayani Anda. Silakan hubungi kami melalui informasi di bawah ini atau kirimkan pesan melalui formulir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Contact Info, Office Hours, Social Media */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Informasi Kontak</h2>
                <ContactInfo 
                  settings={settings} 
                  showTitle={false} 
                  className="text-gray-700"
                />
              </div>

              {/* Office Hours */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Jam Operasional Kantor</h2>
                <div className="space-y-2 text-gray-700">
                  <p>Senin - Kamis: 08:00 - 16:00 WIB</p>
                  <p>Jumat: 08:00 - 15:00 WIB</p>
                  <p>Sabtu & Minggu: Tutup</p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Media Sosial</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Ikuti kami di media sosial untuk mendapatkan informasi terbaru
                </p>
                <SocialMediaLinks 
                  settings={settings} 
                  showTitle={false} 
                  iconSize="text-2xl"
                  className="text-gray-700"
                />
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Lokasi Kami di Peta</h2>
          <div className="rounded-lg shadow-md overflow-hidden">
            <ContactMap 
              address={settings?.general?.contact_address || ''}
              mapEmbedUrl={settings?.general?.map_embed_url || ''}
              googleMapsLink={settings?.general?.google_maps_link || ''}
              villageName={settings?.general?.site_name || 'Kantor Desa'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
