'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OfficialFormData, schema } from '@/types/official';

import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { positions } from '@/data/positions';
import { useState, useEffect } from 'react';

export default function CreateVillageOfficialPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OfficialFormData>({
    resolver: yupResolver(schema),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [dusunNumber, setDusunNumber] = useState<string>("");
  const [customPosition, setCustomPosition] = useState<string>("");
  const [officials, setOfficials] = useState<OfficialFormData[]>([]);

  useEffect(() => {
    const fetchOfficials = async () => {
      const res = await fetch('http://localhost:8081/api/v1/officials');
      const data = await res.json();
      setOfficials(data);
    };
    fetchOfficials();
  }, []);

  useEffect(() => {
    if (officials.length > 0) {
      const maxOrder = Math.max(...officials.map(o => o.display_order));
      setValue("display_order", maxOrder + 1);
    } else {
      setValue("display_order", 1);
    }
  }, [officials, setValue]);



  const onSubmit = async (data: OfficialFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      let photo_url = '';
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const uploadRes = await fetch('http://localhost:8081/api/v1/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        photo_url = uploadData.url;
      }

      const officialData = { ...data, photo_url };

      const res = await fetch('http://localhost:8081/api/v1/admin/officials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(officialData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create village official');
      }

      setSuccess('Village official created successfully!');
      reset();
      router.push('/admin/officials');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tambah Aparatur Desa Baru</h1>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">Error: {error}</div>}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama</label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Jabatan</label>
            <select
              id="position"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.position ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>Pilih Jabatan</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            {errors.position && <p className="text-red-500 text-xs italic">{errors.position.message}</p>}
          </div>

          {selectedPosition === 'Kepala Dusun' && (
            <div className="mb-4">
              <label htmlFor="dusunNumber" className="block text-gray-700 text-sm font-bold mb-2">Nomor Dusun</label>
              <input
                type="number"
                id="dusunNumber"
                value={dusunNumber}
                onChange={(e) => setDusunNumber(e.target.value)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
            </div>
          )}

          {selectedPosition === 'Other' && (
            <div className="mb-4">
              <label htmlFor="customPosition" className="block text-gray-700 text-sm font-bold mb-2">Jabatan Lainnya</label>
              <input
                type="text"
                id="customPosition"
                value={customPosition}
                onChange={(e) => setCustomPosition(e.target.value)}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Foto</label>
            {imagePreviewUrl && (
              <div className="mb-2">
                <Image src={imagePreviewUrl} alt="Image Preview" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="photo"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setUploadedFile(file);
                if (file) {
                  setImagePreviewUrl(URL.createObjectURL(file));
                } else {
                  setImagePreviewUrl(null);
                }
              }}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={5}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.bio ? 'border-red-500' : ''}`}
            ></textarea>
            {errors.bio && <p className="text-red-500 text-xs italic">{errors.bio.message}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="display_order" className="block text-gray-700 text-sm font-bold mb-2">Urutan Tampil</label>
            <input
              type="number"
              id="display_order"
              {...register('display_order')}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.display_order ? 'border-red-500' : ''}`}
            />
            {errors.display_order && <p className="text-red-500 text-xs italic">{errors.display_order.message}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Aparatur'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/officials')}
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