'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'; // Using react-icons for social media icons

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Profil Singkat</h3>
            <p className="text-sm">Website ini sebagai sarana publikasi untuk memberikan Informasi dan gambaran tentang potensi Desa Sei Rotan.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Kontak Kami</h3>
            <address className="text-sm not-italic space-y-3">
              <p className="flex items-center"><FaMapMarkerAlt className="w-5 mr-2" />Jl. Pendidikan, Desa Sei Rotan, Kec. Percut Sei Tuan</p>
              <p className="flex items-center"><FaPhone className="w-5 mr-2" />(061) 123-4567</p>
            </address>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Media Sosial</h3>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/sei.rotan.5" className="text-xl hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaFacebook /></Link>
              <Link href="https://www.instagram.com/desaseirotan" className="text-xl hover:text-pink-400" target="_blank" rel="noopener noreferrer"><FaInstagram /></Link>
              <Link href="https://www.youtube.com/@dokpolmasseirotan" className="text-xl hover:text-red-500" target="_blank" rel="noopener noreferrer"><FaYoutube /></Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} Pemerintah Desa Sei Rotan</p>
        </div>
      </div>
    </footer>
  );
}
