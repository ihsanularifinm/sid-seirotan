'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHeroSlider } from '@/services/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { compressImage, formatFileSize, calculateSavings } from '@/utils/imageCompression';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 2 * 1024 * 1024, // 2MB
  MAX_WITHOUT_COMPRESSION: 5 * 1024 * 1024, // 5MB
};

export default function CreateHeroSliderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  const [showCompressionPreview, setShowCompressionPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    link_url: '',
    link_text: '',
    display_order: 0,
    is_active: true,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setUploadedFile(file);
    setCompressedFile(null);
    setShowCompressionPreview(false);
    
    // Create preview URL
    setMediaPreviewUrl(URL.createObjectURL(file));
    
    // Auto-detect media type from file
    if (file.type.startsWith('video/')) {
      setFormData({ ...formData, media_type: 'video' });
      setEnableCompression(false); // Disable compression for videos
    } else {
      setFormData({ ...formData, media_type: 'image' });
      
      // Show warning for large files
      if (file.size > FILE_SIZE_LIMITS.WARNING_THRESHOLD) {
        toast.warning(
          `File besar (${formatFileSize(file.size)}). Compression direkomendasikan untuk upload lebih cepat.`,
          { duration: 5000 }
        );
      }
      
      // Auto-compress if enabled
      if (enableCompression) {
        await performCompression(file);
      }
    }
  };

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
    
    if (enabled && uploadedFile && !compressedFile && uploadedFile.type.startsWith('image/')) {
      await performCompression(uploadedFile);
    } else if (!enabled) {
      setCompressedFile(null);
      setCompressedPreviewUrl(null);
      setShowCompressionPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      toast.error('Please select a media file');
      return;
    }

    // Determine which file to upload
    const fileToUpload = enableCompression && compressedFile ? compressedFile : uploadedFile;

    // Check size limit without compression
    if (!enableCompression && fileToUpload.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION) {
      toast.error(
        `File terlalu besar (${formatFileSize(fileToUpload.size)}). ` +
        `Maksimal ${formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression. ` +
        `Silakan aktifkan compression atau pilih file lebih kecil.`,
        { duration: 6000 }
      );
      return;
    }

    setSubmitting(true);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        toast.error('Unauthorized: No token found');
        router.push('/admin/login');
        return;
      }

      // Upload file
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload);

      const uploadRes = await fetch(`${apiUrl}/api/v1/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Failed to upload media');
      }

      const uploadData = await uploadRes.json();
      const media_url = uploadData.url;
      setUploading(false);

      const sliderData = { ...formData, media_url };

      await createHeroSlider(sliderData);
      toast.success('Slider created successfully');
      router.push('/admin/hero-sliders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create slider');
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tambah Hero Slider Baru</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Media (Image/Video) *</label>
            
            {/* Preview uploaded media */}
            {mediaPreviewUrl && (
              <div className="mb-3 border rounded-md p-2 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                {formData.media_type === 'video' ? (
                  <video
                    src={mediaPreviewUrl}
                    className="w-full max-w-md h-48 object-cover rounded-md"
                    controls
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPreviewUrl}
                    alt="Media Preview"
                    className="w-full max-w-md h-48 object-cover rounded-md"
                  />
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, WebP for images | MP4, WebM for videos
            </p>
          </div>

          {/* Compression Option */}
          {uploadedFile && formData.media_type === 'image' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCompression}
                  onChange={(e) => handleCompressionToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    Compress image untuk upload lebih cepat
                  </span>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
              </label>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                💡 Quality: 90% - Hampir tidak ada perbedaan visual, tapi upload jauh lebih cepat
              </p>
            </div>
          )}

          {/* Compressing Status */}
          {compressing && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Compressing image...</p>
                <p className="text-sm text-blue-700">Mohon tunggu sebentar</p>
              </div>
            </div>
          )}

          {/* Before/After Preview */}
          {showCompressionPreview && compressedFile && uploadedFile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                📊 Preview Compression
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Original</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {formatFileSize(uploadedFile.size)}
                    </span>
                  </div>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaPreviewUrl || ''}
                      alt="Original"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
                
                {/* Compressed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Compressed</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      {formatFileSize(compressedFile.size)}
                    </span>
                  </div>
                  <div className="border-2 border-green-500 rounded-lg overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={compressedPreviewUrl || ''}
                      alt="Compressed"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Saved {calculateSavings(uploadedFile.size, compressedFile.size)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                💡 Tip: Zoom in untuk compare quality. Jika tidak puas, uncheck compression.
              </p>
            </div>
          )}

          {/* File Size Warning */}
          {uploadedFile && !enableCompression && uploadedFile.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-red-900">
                    ⚠️ File terlalu besar ({formatFileSize(uploadedFile.size)})
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Maksimal {formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression.
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Silakan:
                  </p>
                  <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                    <li>Aktifkan compression (recommended), atau</li>
                    <li>Pilih file yang lebih kecil</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Media Type</label>
            <select
              value={formData.media_type}
              onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
              className="w-full border rounded px-3 py-2 bg-gray-50"
              disabled={!!uploadedFile}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {uploadedFile ? 'Auto-detected from uploaded file' : 'Select media type'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              type="text"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="/profil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link Text</label>
            <input
              type="text"
              value={formData.link_text}
              onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Selengkapnya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading || submitting || !uploadedFile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : submitting ? 'Creating...' : 'Create Slider'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/hero-sliders')}
              disabled={uploading || submitting}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
