'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, LogOut, UserCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
  full_name?: string;
}

export default function AdminHeader() {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<JWTPayload | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user info from JWT token
    const token = Cookies.get('jwt_token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setUserInfo(decoded);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    router.push('/admin/login');
  };

  const handleAccountClick = () => {
    setMenuOpen(false);
    router.push('/admin/account');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!isMenuOpen)} 
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <User className="h-8 w-8 text-gray-600 rounded-full bg-gray-200 p-1" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                {/* User Info Header */}
                {userInfo && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {userInfo.full_name || userInfo.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userInfo.username}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleAccountClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserCircle className="mr-3 h-4 w-4" />
                    Akun Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
