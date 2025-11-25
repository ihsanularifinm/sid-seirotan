'use client';

import { useSettings } from '@/contexts/SettingsContext';
import ContactInfo from '@/components/ContactInfo';
import SocialMediaLinks from '@/components/SocialMediaLinks';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-800 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Profil Singkat */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Profil Singkat</h3>
            <p className="text-sm">
              {settings?.general?.site_description || 'Website ini sebagai sarana publikasi untuk memberikan Informasi dan gambaran tentang potensi desa.'}
            </p>
          </div>

          {/* Kontak Kami */}
          <ContactInfo settings={settings} showTitle={true} />

          {/* Media Sosial */}
          <SocialMediaLinks settings={settings} showTitle={true} />
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} {settings?.general?.site_name || 'Pemerintah Desa'}</p>
        </div>
      </div>
    </footer>
  );
}
