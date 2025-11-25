'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Users, Briefcase, Zap, MessageSquare, Image, Settings, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
}

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'superadmin'] },
  { href: '/admin/hero-sliders', label: 'Hero Slider', icon: Image, roles: ['admin', 'superadmin'] },
  { href: '/admin/profile', label: 'Profil Desa', icon: FileText, roles: ['admin', 'superadmin'] },
  { href: '/admin/news', label: 'Berita', icon: Newspaper, roles: ['admin', 'superadmin', 'author'] },
  { href: '/admin/officials', label: 'Aparatur Desa', icon: Users, roles: ['admin', 'superadmin'] },
  { href: '/admin/services', label: 'Layanan', icon: Briefcase, roles: ['admin', 'superadmin'] },
  { href: '/admin/potentials', label: 'Potensi', icon: Zap, roles: ['admin', 'superadmin'] },
  { href: '/admin/contacts', label: 'Pesan', icon: MessageSquare, roles: ['admin', 'superadmin'] },
  { href: '/admin/users', label: 'Pengguna', icon: Users, roles: ['admin', 'superadmin'] },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'superadmin'] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role from JWT token
    const token = Cookies.get('jwt_token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  // Filter menu berdasarkan role
  const filteredLinks = navLinks.filter(link => 
    !link.roles || link.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center bg-gray-900">
        <h2 className="text-2xl font-bold">Admin</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {filteredLinks.map((link) => {
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
