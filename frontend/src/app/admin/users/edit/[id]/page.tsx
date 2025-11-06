'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { editSchema, EditUserFormData } from '@/types/user';
import withAdminAuth from '@/components/layout/withAdminAuth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditUserFormData>({
    resolver: yupResolver(editSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setInitialLoading(true);
      try {
        const token = Cookies.get('jwt_token');
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${apiUrl}/api/v1/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user data');

        const data = await res.json();
        setValue('full_name', data.full_name);
        setValue('username', data.username);
        setValue('role', data.role);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [id, setValue]);

  const onSubmit = async (data: EditUserFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) throw new Error('Unauthorized');

      const payload: { full_name: string; username: string; role: string; password?: string } = { 
        full_name: data.full_name, 
        username: data.username, 
        role: data.role 
      };
      if (data.password) {
        payload.password = data.password;
      }

      const res = await fetch(`${apiUrl}/api/v1/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      router.push('/admin/users');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <AdminLayout><p>Loading user...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Pengguna</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-gray-700 font-semibold mb-2">Nama Lengkap</label>
            <input
              id="full_name"
              type="text"
              {...register('full_name')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? 'border-red-500' : ''}`}
            />
            {errors.full_name && <p className="text-red-500 text-xs italic">{errors.full_name.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && <p className="text-red-500 text-xs italic">{errors.username.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password (kosongkan jika tidak ingin diubah)</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">Role</label>
            <select
              id="role"
              {...register('role')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? 'border-red-500' : ''}`}
            >
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs italic">{errors.role.message}</p>}
          </div>
          <div className="flex items-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            {error && <p className="text-red-500 ml-4">{error}</p>}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(EditUserPage);
