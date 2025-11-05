'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const schema = yup.object().shape({
  title: yup.string().required('Judul tidak boleh kosong'),
  content: yup.string().required('Isi berita tidak boleh kosong'),
  status: yup.string().oneOf(['draft', 'published', 'archived']).required(),
});

type NewsFormData = yup.InferType<typeof schema>;

export default function CreateNewsPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'draft',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup the object URL when the component unmounts or a new file is selected
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const onSubmit = async (data: NewsFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      let featured_image_url = '';
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
        featured_image_url = uploadData.url;
      }

      const newsData = { ...data, featured_image_url };

      const res = await fetch('http://localhost:8081/api/v1/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newsData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create news');
      }

      setSuccess('News created successfully!');
      reset(); // Clear form
      router.push('/admin/news'); // Redirect to news list
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tambah Berita Baru</h1>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">Error: {error}</div>}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Judul Berita</label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-xs italic">{errors.title.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Isi Berita</label>
            <textarea
              id="content"
              {...register('content')}
              rows={10}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.content ? 'border-red-500' : ''}`}
            ></textarea>
            {errors.content && <p className="text-red-500 text-xs italic">{errors.content.message}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="featured_image" className="block text-gray-700 text-sm font-bold mb-2">Gambar Unggulan</label>
            {imagePreviewUrl && (
              <div className="mb-2">
                <Image src={imagePreviewUrl} alt="Image Preview" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="featured_image"
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
          <div className="mb-6">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              id="status"
              {...register('status')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Berita'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/news')}
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