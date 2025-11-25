'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import StrukturOrganisasiUpload from '@/components/admin/StrukturOrganisasiUpload';
import { toRomanNumeral } from '@/utils/romanNumerals';
import { useRoleProtection } from '@/hooks/useRoleProtection';

type VillageOfficial = {
  id: number;
  name: string;
  position: string;
  display_order: number;
  hamlet_number?: number;
  hamlet_name?: string;
  created_at: string;
};

export default function AdminVillageOfficialsPage() {
  // Protect this page - only admin and superadmin can access
  const { loading: roleLoading } = useRoleProtection(['admin', 'superadmin']);
  
  const [officials, setOfficials] = useState<VillageOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const fetchOfficials = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        // For public routes, token is not strictly required, but for admin view, it's good to have.
        // However, the API /api/officials is public, so we can fetch without token initially.
        // If we later make this admin-only, we'll need the token.
      }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/v1/officials`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch village officials');
      }

      const data = await res.json();
      setOfficials(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this village official?')) {
      return;
    }

    setDeleteMessage(null);
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/v1/officials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete village official');
      }

      setDeleteMessage('Village official deleted successfully!');
      setOfficials(officials.filter(item => item.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteMessage(`Error: ${err.message}`);
      }
    }
  };

  // Show loading while checking role
  if (roleLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Manajemen Pemerintahan Desa
        </h1>
        <p className="text-gray-600">
          Kelola data aparatur desa dan struktur organisasi pemerintahan
        </p>
      </div>

      {/* Aparatur Desa Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Aparatur Desa</h2>
        <Link
          href="/admin/officials/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} className="mr-2" />
          Tambah Aparatur Baru
        </Link>
      </div>

      {deleteMessage && (
        <div className={`p-3 mb-4 rounded-md ${deleteMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {deleteMessage}
        </div>
      )}

      {loading && <p>Loading village officials...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dusun</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan Tampil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officials.length > 0 ? (
                officials.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.hamlet_name 
                        ? `Dusun ${item.hamlet_name}` 
                        : item.hamlet_number 
                          ? `Dusun ${toRomanNumeral(item.hamlet_number)}` 
                          : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.display_order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link href={`/admin/officials/edit/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">No village officials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Struktur Organisasi Section */}
      <div className="mt-8">
        <StrukturOrganisasiUpload />
      </div>
    </AdminLayout>
  );
}
