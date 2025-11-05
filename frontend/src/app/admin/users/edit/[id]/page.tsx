'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';

import withAdminAuth from '@/components/layout/withAdminAuth';

const EditUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Leave empty to not change
  const [role, setRole] = useState('author');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setInitialLoading(true);
      try {
        const token = Cookies.get('jwt_token');
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`http://localhost:8081/api/v1/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user data');

        const data = await res.json();
        setFullName(data.full_name);
        setUsername(data.username);
        setRole(data.role);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) throw new Error('Unauthorized');

      const payload: { full_name: string; username: string; role: string; password?: string } = { full_name: fullName, username, role };
      if (password) {
        payload.password = password;
      }

      const res = await fetch(`http://localhost:8081/api/v1/admin/users/${id}`, {
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password (kosongkan jika tidak ingin diubah)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </select>
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
