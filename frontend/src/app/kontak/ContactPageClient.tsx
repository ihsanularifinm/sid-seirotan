'use client';

import { useSettings } from '@/contexts/SettingsContext';
import ContactInfo from '@/components/ContactInfo';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

export default function ContactPageClient() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 flex items-center">
              <FaHome className="mr-1" />
              Beranda
            </Link>
            <FaChevronRight className="mx-2 text-xs" />
            <span className="text-gray-900 font-medium">Kontak</span>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan atau membutuhkan informasi lebih lanjut
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <ContactInfo 
              settings={settings} 
              showTitle={true} 
              className="text-gray-700"
            />
          </div>

          {/* Social Media Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Media Sosial</h3>
            <p className="text-sm text-gray-600 mb-6">
              Ikuti kami di media sosial untuk mendapatkan informasi terbaru
            </p>
            <SocialMediaLinks 
              settings={settings} 
              showTitle={false} 
              iconSize="text-3xl"
              className="text-gray-700"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold text-lg text-blue-900 mb-2">Jam Pelayanan</h3>
            <p className="text-blue-800">
              Senin - Jumat: 08:00 - 16:00 WIB
            </p>
            <p className="text-blue-800">
              Sabtu: 08:00 - 12:00 WIB
            </p>
            <p className="text-sm text-blue-600 mt-2">
              (Tutup pada hari Minggu dan hari libur nasional)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
