'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, LogOut } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    router.push('/admin/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <div className="relative">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
              <User className="h-8 w-8 text-gray-600 rounded-full bg-gray-200 p-1" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
