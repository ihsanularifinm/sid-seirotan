'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';

const schema = yup.object().shape({
  service_name: yup.string().required('Nama layanan tidak boleh kosong'),
  description: yup.string().required('Deskripsi tidak boleh kosong'),
  requirements: yup.string(),
});

type ServiceFormData = yup.InferType<typeof schema>;

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ServiceFormData>({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8081/api/v1/services/${serviceId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch service');
        }
        const data = await res.json();
        setValue('service_name', data.service_name);
        setValue('description', data.description);
        setValue('requirements', data.requirements);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, setValue]);

  const onSubmit = async (data: ServiceFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      const res = await fetch(`http://localhost:8081/api/v1/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update service');
      }

      setSuccess('Service updated successfully!');
      router.push('/admin/services');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <AdminLayout><p>Loading...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Layanan</h1>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">Error: {error}</div>}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="service_name" className="block text-gray-700 text-sm font-bold mb-2">Nama Layanan</label>
            <input
              type="text"
              id="service_name"
              {...register('service_name')}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.service_name ? 'border-red-500' : ''}`}
            />
            {errors.service_name && <p className="text-red-500 text-xs italic">{errors.service_name.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Deskripsi</label>
            <textarea
              id="description"
              {...register('description')}
              rows={5}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : ''}`}
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs italic">{errors.description.message}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="requirements" className="block text-gray-700 text-sm font-bold mb-2">Persyaratan</label>
            <textarea
              id="requirements"
              {...register('requirements')}
              rows={5}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.requirements ? 'border-red-500' : ''}`}
            ></textarea>
            {errors.requirements && <p className="text-red-500 text-xs italic">{errors.requirements.message}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {submitting ? 'Menyimpan...' : 'Update Layanan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/services')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
