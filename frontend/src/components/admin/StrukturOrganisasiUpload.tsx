'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/mediaUrl';
import { PLACEHOLDERS } from '@/utils/placeholder';
import { getAllSettingsAdmin, bulkUpdateSettings } from '@/services/api';

export default function StrukturOrganisasiUpload() {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const data = await getAllSettingsAdmin();
      const governmentSettings = data.government || [];
      const strukturSetting = governmentSettings.find(
        (s: any) => s.setting_key === 'organizational_structure_image'
      );
      if (strukturSetting) {
        setCurrentImage(strukturSetting.setting_value || '');
      }
    } catch (error) {
      console.error('Failed to fetch struktur organisasi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate format (common image formats)
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const validFormats = ['png', 'jpg', 'jpeg', 'webp'];
    if (!ext || !validFormats.includes(ext)) {
      toast.error('Format file harus PNG, JPG, JPEG, atau WebP');
      return;
    }

    // Validate file size (max 10MB for organizational chart)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'struktur');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/upload-with-naming`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update setting
      await bulkUpdateSettings([
        {
          setting_key: 'organizational_structure_image',
          setting_value: data.url,
          setting_group: 'government',
        },
      ]);

      setCurrentImage(data.url);
      toast.success('Struktur organisasi berhasil diupload');

      // Reset form
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Gagal upload struktur organisasi');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Determine which image to display
  const displayImage = preview || currentImage;
  const isPlaceholder = currentImage?.includes('placehold.co');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Struktur Organisasi
      </h2>

      <div className="space-y-4">
        {/* Current/Preview Image */}
        {displayImage && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              {preview ? 'Preview:' : 'Gambar saat ini:'}
            </p>
            <div className="flex items-center justify-center bg-white p-4 rounded">
              <img
                src={preview || getMediaUrl(currentImage)}
                alt="Struktur Organisasi"
                className="max-w-full h-auto max-h-96 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDERS.struktur;
                }}
              />
            </div>
            {isPlaceholder && !preview && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                ⚠️ Placeholder - Upload gambar struktur organisasi
              </p>
            )}
          </div>
        )}

        {/* File Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Gambar Struktur Organisasi
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <span>ℹ️</span>
            <div>
              <p>
                <strong>Format:</strong> PNG, JPG, JPEG, atau WebP
              </p>
              <p>
                <strong>Ukuran rekomendasi:</strong> 1200x800px (landscape, 3:2
                ratio)
              </p>
              <p>
                <strong>Maksimal:</strong> 10MB
              </p>
              <p className="mt-1 text-blue-600">
                <strong>Tips:</strong> Gunakan gambar dengan resolusi tinggi
                agar tetap jelas saat diperbesar
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>File dipilih:</strong> {file.name} (
              {(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Struktur Organisasi'}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
