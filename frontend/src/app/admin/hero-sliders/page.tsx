'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllHeroSliders, deleteHeroSlider } from '@/services/api';
import { HeroSlider } from '@/types/hero-slider';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function AdminHeroSlidersPage() {
  // Protect this page - only admin and superadmin can access
  const { loading: roleLoading, isAllowed } = useRoleProtection(['admin', 'superadmin']);
  
  const router = useRouter();
  const [sliders, setSliders] = useState<HeroSlider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if role check is done and user is allowed
    if (!roleLoading && isAllowed) {
      fetchSliders();
    }
  }, [roleLoading, isAllowed]);

  const fetchSliders = async () => {
    try {
      const data = await getAllHeroSliders();
      setSliders(data || []); // Ensure it's always an array
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else if (error.response?.status === 403) {
        // Access denied - will be handled by useRoleProtection redirect
        setSliders([]);
      } else {
        toast.error('Failed to fetch sliders');
        setSliders([]);
      }
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      await deleteHeroSlider(id);
      toast.success('Slider deleted successfully');
      fetchSliders();
    } catch (error) {
      toast.error('Failed to delete slider');
    }
  };

  if (loading || roleLoading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hero Sliders Management</h1>
        <button
          onClick={() => router.push('/admin/hero-sliders/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Slider
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sliders.map((slider) => (
              <tr key={slider.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{slider.display_order}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium">{slider.title}</div>
                  {slider.subtitle && <div className="text-gray-500 text-xs">{slider.subtitle}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100">
                    {slider.media_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded ${slider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {slider.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push(`/admin/hero-sliders/edit/${slider.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slider.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sliders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sliders found. Create your first slider!
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
