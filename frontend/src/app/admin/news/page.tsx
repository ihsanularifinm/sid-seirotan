'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import Cookies from 'js-cookie';

type News = {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      const res = await fetch('http://localhost:8081/api/v1/admin/posts', { // Fetch all posts
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }

      const data = await res.json();
      setNews(data.data || []); // Ensure news is an array
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    setDeleteMessage(null);
    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      const res = await fetch(`http://localhost:8081/api/v1/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete news');
      }

      setDeleteMessage('News deleted successfully!');
      // Refresh the list after deletion
      setNews(news.filter(item => item.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteMessage(`Error: ${err.message}`);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Berita</h1>
        <Link href="/admin/news/create" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          <PlusCircle size={20} className="mr-2" />
          Tambah Berita Baru
        </Link>
      </div>

      {deleteMessage && (
        <div className={`p-3 mb-4 rounded-md ${deleteMessage.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {deleteMessage}
        </div>
      )}

      {loading && <p>Loading news...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.length > 0 ? (
                news.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link href={`/admin/news/edit/${item.id}`} className="text-indigo-600 hover:text-indigo-900">
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
                  <td colSpan={4} className="text-center py-4">No news found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}