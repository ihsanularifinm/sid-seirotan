'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { schema, NewsFormData } from '@/types/news';
import { getMediaUrl } from '@/lib/mediaUrl';
import { compressImage, formatFileSize, calculateSavings } from '@/utils/imageCompression';
import toast from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 2 * 1024 * 1024, // 2MB
  MAX_WITHOUT_COMPRESSION: 5 * 1024 * 1024, // 5MB
};

export default function EditNewsForm() {
  const router = useRouter();
  const params = useParams();
  const newsId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!newsId) return;
  }, [newsId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewsFormData>({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  const [showCompressionPreview, setShowCompressionPreview] = useState(false);

  useEffect(() => {
    // Cleanup the object URL when the component unmounts or a new file is selected
    return () => {
      if (newImagePreviewUrl) {
        URL.revokeObjectURL(newImagePreviewUrl);
      }
      if (compressedPreviewUrl) {
        URL.revokeObjectURL(compressedPreviewUrl);
      }
    };
  }, [newImagePreviewUrl, compressedPreviewUrl]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) return;
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/v1/posts/${newsId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await res.json();
        setValue('title', data.title);
        setValue('content', data.content);
        setValue('status', data.status);
        setExistingImageUrl(data.featured_image_url);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId, setValue]);

  const performCompression = async (file: File) => {
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setCompressedFile(compressed);
      setCompressedPreviewUrl(URL.createObjectURL(compressed));
      setShowCompressionPreview(true);
      
      const savings = calculateSavings(file.size, compressed.size);
      if (savings > 0) {
        toast.success(
          `Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressed.size)} (${savings}% saved)`,
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error('Compression failed:', error);
      toast.error('Compression gagal. Akan upload file original.');
      setCompressedFile(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleCompressionToggle = async (enabled: boolean) => {
    setEnableCompression(enabled);
    
    if (enabled && uploadedFile && !compressedFile) {
      await performCompression(uploadedFile);
    } else if (!enabled) {
      setCompressedFile(null);
      setCompressedPreviewUrl(null);
      setShowCompressionPreview(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setUploadedFile(file);
    setCompressedFile(null);
    setShowCompressionPreview(false);
    setNewImagePreviewUrl(URL.createObjectURL(file));

    // Show warning for large files
    if (file.size > FILE_SIZE_LIMITS.WARNING_THRESHOLD) {
      toast(
        `⚠️ File besar (${formatFileSize(file.size)}). Compression direkomendasikan untuk upload lebih cepat.`,
        { 
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FCD34D',
          },
        }
      );
    }
    
    // Auto-compress if enabled
    if (enableCompression) {
      await performCompression(file);
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      let featured_image_url = existingImageUrl;
      if (uploadedFile) {
        // Determine which file to upload
        const fileToUpload = enableCompression && compressedFile ? compressedFile : uploadedFile;
        
        // Check size limit without compression
        if (!enableCompression && fileToUpload.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION) {
          throw new Error(
            `File terlalu besar (${formatFileSize(fileToUpload.size)}). ` +
            `Maksimal ${formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression.`
          );
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const uploadRes = await fetch(`${apiUrl}/api/v1/admin/upload`, {
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

      const res = await fetch(`${apiUrl}/api/v1/admin/posts/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newsData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update news');
      }

      setSuccess('News updated successfully!');
      router.push('/admin/news');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Loading News...</h1>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Berita</h1>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">Error: {error}</div>}

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
            {existingImageUrl && !newImagePreviewUrl && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <Image src={getMediaUrl(existingImageUrl)} alt="Existing Featured Image" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="featured_image"
              accept="image/*"
              onChange={handleFileChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WebP. Leave empty to keep current image.</p>
          </div>

          {/* Compression Option */}
          {uploadedFile && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCompression}
                  onChange={(e) => handleCompressionToggle(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium">
                  Compress image untuk upload lebih cepat (Recommended)
                </span>
              </label>
              <p className="text-sm text-gray-600 mt-1 ml-6">
                Quality: 90% - Hampir tidak ada perbedaan visual, tapi upload jauh lebih cepat
              </p>
            </div>
          )}

          {/* Compressing Status */}
          {compressing && (
            <div className="mb-4 flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Compressing image...</span>
            </div>
          )}

          {/* Before/After Preview */}
          {showCompressionPreview && compressedFile && uploadedFile && (
            <div className="mb-4 bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium mb-3">Preview Compression:</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <div className="border rounded overflow-hidden">
                    <Image
                      src={newImagePreviewUrl || ''}
                      alt="Original"
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Size: {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                
                {/* Compressed */}
                <div>
                  <p className="text-sm font-medium mb-2">Compressed</p>
                  <div className="border rounded overflow-hidden">
                    <Image
                      src={compressedPreviewUrl || ''}
                      alt="Compressed"
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Size: {formatFileSize(compressedFile.size)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Saved: {calculateSavings(uploadedFile.size, compressedFile.size)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Size Warning */}
          {uploadedFile && !enableCompression && uploadedFile.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ File terlalu besar ({formatFileSize(uploadedFile.size)})
              </p>
              <p className="text-sm text-red-600 mt-1">
                Maksimal {formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression. Silakan aktifkan compression atau pilih file lebih kecil.
              </p>
            </div>
          )}
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
              {submitting ? 'Menyimpan...' : 'Update Berita'}
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