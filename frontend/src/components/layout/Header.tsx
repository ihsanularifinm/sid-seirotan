'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { getMediaUrl } from '@/lib/mediaUrl';
import { getPlaceholder } from '@/utils/placeholder';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getLinkClassName = (path: string) => {
    return isActive(path)
      ? 'text-blue-600 font-bold'
      : 'text-gray-600 hover:text-blue-600';
  };

  const getMobileLinkClassName = (path: string) => {
    return isActive(path)
      ? 'block py-3 px-4 text-sm text-blue-600 font-bold bg-blue-50'
      : 'block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src={settings?.general?.site_logo ? getMediaUrl(settings.general.site_logo) : getPlaceholder(200, 200, 'Logo')} 
              alt={settings?.general?.site_name || 'Logo Desa'} 
              width={56} 
              height={56} 
              className="h-14 w-auto object-contain" 
            />
            <div>
              <span className="block font-bold text-base sm:text-lg text-gray-800">
                {settings?.general?.site_name || 'DESA SEI ROTAN'}
              </span>
              <span className="block text-xs text-gray-500">
                {settings?.general?.site_description || 'KEC. PERCUT SEI TUAN, KAB. DELI SERDANG'}
              </span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
            <Link href="/" className={getLinkClassName('/')}>BERANDA</Link>
            <Link href="/profil" className={getLinkClassName('/profil')}>PROFIL DESA</Link>
            <Link href="/pemerintahan" className={getLinkClassName('/pemerintahan')}>PEMERINTAHAN</Link>
            <Link href="/layanan" className={getLinkClassName('/layanan')}>LAYANAN</Link>
            <Link href="/potensi" className={getLinkClassName('/potensi')}>POTENSI</Link>
            <Link href="/berita" className={getLinkClassName('/berita')}>BERITA</Link>
            <Link href="/kontak" className={getLinkClassName('/kontak')}>KONTAK</Link>
          </nav>
          <div className="lg:hidden">
            <button
              id="mobile-menu-button"
              className="text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-white border-t">
          <Link href="/" className={getMobileLinkClassName('/')} onClick={() => setIsMobileMenuOpen(false)}>BERANDA</Link>
          <Link href="/profil" className={getMobileLinkClassName('/profil')} onClick={() => setIsMobileMenuOpen(false)}>PROFIL DESA</Link>
          <Link href="/pemerintahan" className={getMobileLinkClassName('/pemerintahan')} onClick={() => setIsMobileMenuOpen(false)}>PEMERINTAHAN</Link>
          <Link href="/layanan" className={getMobileLinkClassName('/layanan')} onClick={() => setIsMobileMenuOpen(false)}>LAYANAN</Link>
          <Link href="/potensi" className={getMobileLinkClassName('/potensi')} onClick={() => setIsMobileMenuOpen(false)}>POTENSI</Link>
          <Link href="/berita" className={getMobileLinkClassName('/berita')} onClick={() => setIsMobileMenuOpen(false)}>BERITA</Link>
          <Link href="/kontak" className={getMobileLinkClassName('/kontak')} onClick={() => setIsMobileMenuOpen(false)}>KONTAK</Link>
        </div>
      )}
    </header>
  );
}
