'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Users, Briefcase, Zap, MessageSquare } from 'lucide-react';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/news', label: 'Berita', icon: Newspaper },
  { href: '/admin/officials', label: 'Aparatur Desa', icon: Users },
  { href: '/admin/services', label: 'Layanan', icon: Briefcase },
  { href: '/admin/potentials', label: 'Potensi', icon: Zap },
  { href: '/admin/contacts', label: 'Pesan', icon: MessageSquare },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center bg-gray-900">
        <h2 className="text-2xl font-bold">Admin</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
