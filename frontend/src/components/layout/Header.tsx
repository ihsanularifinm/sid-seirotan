'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react'; // Using lucide-react for icons

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/assets/img/logo-deli-serdang.png" alt="Logo Deli Serdang" width={56} height={56} className="h-14 w-auto" />
            <div>
              <span className="block font-bold text-base sm:text-lg text-gray-800">DESA SEI ROTAN</span>
              <span className="block text-xs text-gray-500">KEC. PERCUT SEI TUAN, KAB. DELI SERDANG</span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
            <Link href="/" className="text-gray-600 hover:text-blue-600">BERANDA</Link>
            <Link href="/profil" className="text-gray-600 hover:text-blue-600">PROFIL DESA</Link>
            <Link href="/pemerintahan" className="text-gray-600 hover:text-blue-600">PEMERINTAHAN</Link>
            <Link href="/layanan" className="text-gray-600 hover:text-blue-600">LAYANAN</Link>
            <Link href="/potensi" className="text-gray-600 hover:text-blue-600">POTENSI</Link>
            <Link href="/berita" className="text-gray-600 hover:text-blue-600">BERITA</Link>
            <Link href="/kontak" className="text-gray-600 hover:text-blue-600">KONTAK</Link>
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
          <Link href="/" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>BERANDA</Link>
          <Link href="/profil" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>PROFIL DESA</Link>
          <Link href="/pemerintahan" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>PEMERINTAHAN</Link>
          <Link href="/layanan" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>LAYANAN</Link>
          <Link href="/potensi" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>POTENSI</Link>
          <Link href="/berita" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>BERITA</Link>
          <Link href="/kontak" className="block py-3 px-4 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>KONTAK</Link>
        </div>
      )}
    </header>
  );
}
