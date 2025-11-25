'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { schema } from '@/types/official';
import { positions } from '@/data/positions';
import { compressImage, formatFileSize, calculateSavings } from '@/utils/imageCompression';
import toast from 'react-hot-toast';
import { toRomanNumeral } from '@/utils/romanNumerals';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 2 * 1024 * 1024, // 2MB
  MAX_WITHOUT_COMPRESSION: 5 * 1024 * 1024, // 5MB
};

type OfficialFormData = yup.InferType<typeof schema> & {
  hamlet_number?: number | null;
  hamlet_name?: string | null;
};

export default function EditOfficialForm() {
  const router = useRouter();
  const params = useParams();
  const officialId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [dusunNumber, setDusunNumber] = useState<string>('');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  const [showCompressionPreview, setShowCompressionPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<OfficialFormData>({
    resolver: yupResolver(schema),
  });

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

  useEffect(() => {
    if (!officialId) return;
    const fetchOfficial = async () => {
      if (!officialId) return;
      setLoading(true);
      try {
        const token = Cookies.get('jwt_token');
        const res = await fetch(`${apiUrl}/api/v1/admin/officials/${officialId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch official');
        }
        const data = await res.json();
        setValue('name', data.name);
        setValue('position', data.position);
        setValue('bio', data.bio);
        setValue('display_order', data.display_order);
        setValue('hamlet_number', data.hamlet_number);
        setValue('hamlet_name', data.hamlet_name);
        setExistingImageUrl(data.photo_url);

        const position = data.position;
        if (positions.includes(position)) {
          setSelectedPosition(position);
        } else if (position.startsWith("Kepala Dusun")) {
          setSelectedPosition("Kepala Dusun");
          const extractedText = position.replace("Kepala Dusun ", "");
          // Prefer hamlet_name if available, otherwise use hamlet_number, otherwise use extracted text
          if (data.hamlet_name) {
            setDusunNumber(data.hamlet_name);
          } else if (data.hamlet_number) {
            setDusunNumber(data.hamlet_number.toString());
          } else {
            setDusunNumber(extractedText);
          }
        } else {
          setSelectedPosition("Other");
          setCustomPosition(position);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOfficial();
  }, [officialId, setValue]);

  const onSubmit = async (data: OfficialFormData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      let photo_url = existingImageUrl;
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
        formData.append('upload_type', 'official');
        formData.append('name', data.name); // Use official name for filename
        formData.append('position', data.position); // Use position for filename

        const uploadRes = await fetch(`${apiUrl}/api/v1/admin/upload-with-naming`, {
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
        
        // Show filename info
        if (uploadData.filename) {
          toast.success(`File disimpan sebagai: ${uploadData.filename}`, { duration: 3000 });
        }
      }

      const officialData = { ...data, photo_url };

      const res = await fetch(`${apiUrl}/api/v1/admin/officials/${officialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(officialData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update village official');
      }

      setSuccess('Village official updated successfully!');
      router.push('/admin/officials');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Loading Aparatur Desa...</h1>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Aparatur Desa</h1>

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
              onChange={(e) => {
                const value = e.target.value;
                setSelectedPosition(value);
                
                // Update form value based on selection
                if (value === 'Kepala Dusun') {
                  // Will be updated when dusunNumber changes
                  if (dusunNumber) {
                    setValue('position', `Kepala Dusun ${dusunNumber}`);
                    setValue('hamlet_number', parseInt(dusunNumber));
                  }
                } else if (value === 'Other') {
                  // Will be updated when customPosition changes
                  if (customPosition) {
                    setValue('position', customPosition);
                  }
                  setValue('hamlet_number', undefined);
                } else {
                  setValue('position', value);
                  setValue('hamlet_number', undefined);
                }
              }}
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
              <label htmlFor="dusunNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Identitas Dusun
              </label>
              <input
                type="text"
                id="dusunNumber"
                value={dusunNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setDusunNumber(value);
                  if (value) {
                    setValue('position', `Kepala Dusun ${value}`);
                    // Try to parse as number for hamlet_number (for sorting)
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue > 0) {
                      setValue('hamlet_number', numValue);
                      setValue('hamlet_name', undefined);
                    } else {
                      // Not a pure number, store as hamlet_name
                      setValue('hamlet_number', undefined);
                      setValue('hamlet_name', value);
                    }
                  } else {
                    setValue('hamlet_number', undefined);
                    setValue('hamlet_name', undefined);
                  }
                }}
                placeholder="Contoh: 1, IX-A, Makmur, 3A"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
              {dusunNumber && (
                <p className="text-sm text-green-600 mt-1">
                  Preview: Dusun {
                    !isNaN(parseInt(dusunNumber)) && parseInt(dusunNumber) > 0 && parseInt(dusunNumber) <= 100
                      ? toRomanNumeral(parseInt(dusunNumber))
                      : dusunNumber
                  }
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Bisa angka (1, 2, 3...), pemekaran (IX-A, 3B), atau nama (Makmur, Sejahtera)
              </p>
            </div>
          )}

          {selectedPosition === 'Other' && (
            <div className="mb-4">
              <label htmlFor="customPosition" className="block text-gray-700 text-sm font-bold mb-2">Jabatan Lainnya</label>
              <input
                type="text"
                id="customPosition"
                value={customPosition}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomPosition(value);
                  setValue('position', value);
                }}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Foto</label>
            {existingImageUrl && !newImagePreviewUrl && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Current Photo:</p>
                <Image src={`${apiUrl}${existingImageUrl}`} alt="Existing Official Photo" width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WebP | Rekomendasi: 400x500px (portrait). Leave empty to keep current photo.</p>
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
              {submitting ? 'Menyimpan...' : 'Update Aparatur'}
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