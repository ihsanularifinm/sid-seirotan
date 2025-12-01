'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/mediaUrl';
import { PLACEHOLDERS } from '@/utils/placeholder';

interface LogoUploadProps {
  currentLogo?: string;
  onUploadSuccess: (url: string) => void;
}

export default function LogoUpload({ currentLogo, onUploadSuccess }: LogoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate format (PNG or SVG only)
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'png' && ext !== 'svg') {
      toast.error('Logo harus berformat PNG atau SVG');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setFile(selectedFile);
    
    // Create preview for PNG (SVG will show as file name)
    if (ext === 'png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null); // SVG preview handled differently
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'logo');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/upload-with-naming`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.url);
      toast.success('Logo berhasil diupload');
      
      // Reset form
      setFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Gagal upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
  };

  // Determine which logo to display
  const displayLogo = preview || currentLogo;
  const isPlaceholder = currentLogo?.includes('placehold.co');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Logo Website
        </label>

        {/* Current/Preview Logo */}
        {displayLogo && (
          <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              {preview ? 'Preview:' : 'Logo saat ini:'}
            </p>
            <div className="flex items-center justify-center bg-white p-4 rounded">
              <img
                src={preview || getMediaUrl(currentLogo || '')}
                alt="Logo"
                className="h-20 object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = PLACEHOLDERS.logo;
                }}
              />
            </div>
            {isPlaceholder && !preview && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                ⚠️ Placeholder - Upload logo untuk mengganti
              </p>
            )}
          </div>
        )}

        {/* File Input */}
        <div className="space-y-2">
          <input
            type="file"
            accept=".png,.svg"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <span>ℹ️</span>
            <div>
              <p><strong>Format:</strong> PNG atau SVG</p>
              <p><strong>Ukuran rekomendasi:</strong> 400x400px (square)</p>
              <p><strong>Maksimal:</strong> 5MB</p>
              <p className="mt-1 text-amber-600">
                <strong>Catatan:</strong> Logo tidak akan dikompres untuk menjaga kualitas
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>File dipilih:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {file && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Logo'}
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
  );
}
