'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Shield } from 'lucide-react';

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
  full_name?: string;
}

export default function AdminAccountPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from JWT token
    const token = Cookies.get('jwt_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      setUserInfo(decoded);
      setLoading(false);
    } catch (error) {
      console.error('Failed to decode token:', error);
      router.push('/admin/login');
    }
  }, [router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Akun Saya</h1>
        <p className="text-gray-600">
          Kelola informasi akun dan ubah password Anda
        </p>
      </div>

      {/* User Information Section */}
      {userInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Informasi Akun
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <p className="text-gray-800 font-medium text-lg">{userInfo.username}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <p className="text-gray-800 font-medium text-lg">{userInfo.full_name || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <p className="text-gray-800 font-medium text-lg capitalize">
                  {userInfo.role === 'admin' ? 'Administrator' : 
                   userInfo.role === 'superadmin' ? 'Super Administrator' : 
                   userInfo.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Section */}
      <div>
        <ChangePasswordForm />
      </div>
    </AdminLayout>
  );
}
