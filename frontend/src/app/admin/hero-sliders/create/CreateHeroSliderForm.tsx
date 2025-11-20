'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createHeroSlider } from '@/services/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { compressImage, formatFileSize, calculateSavings } from '@/utils/imageCompression';
import { uploadWithProgress, UploadStep } from '@/utils/uploadWithProgress';
import { UploadProgress } from '@/components/ui/UploadProgress';
import Image from 'next/image';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 2 * 1024 * 1024, // 2MB
  MAX_WITHOUT_COMPRESSION: 5 * 1024 * 1024, // 5MB
};

export default function CreateHeroSliderForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [enableCompression, setEnableCompression] = useState(true);
  const [showCompressionPreview, setShowCompressionPreview] = useState(false);
  
  // Upload progress tracking
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
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

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      if (compressedPreviewUrl) URL.revokeObjectURL(compressedPreviewUrl);
    };
  }, [mediaPreviewUrl, compressedPreviewUrl]);

  const performCompression = async (file: File) => {
    setUploadStep('compressing');
    try {
      const compressed = await compressImage(file);
      setCompressedFile(compressed);
      setCompressedPreviewUrl(URL.createObjectURL(compressed));
      setShowCompressionPreview(true);
      setUploadStep('idle');
      
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
      setUploadStep('idle');
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setUploadedFile(file);
    setCompressedFile(null);
    setShowCompressionPreview(false);
    setMediaPreviewUrl(URL.createObjectURL(file));

    // Auto-detect media type from file
    if (file.type.startsWith('video/')) {
      setFormData({ ...formData, media_type: 'video' });
    } else {
      setFormData({ ...formData, media_type: 'image' });
      
      // Show warning for large images
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
    }
  };

  const handleRetry = () => {
    setUploadStep('idle');
    setUploadError(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      toast.error('Please select a media file');
      return;
    }

    setSubmitting(true);
    setUploadError(null);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        toast.error('Unauthorized: No token found');
        router.push('/admin/login');
        return;
      }

      // Determine which file to upload (compressed or original)
      const fileToUpload = enableCompression && compressedFile && uploadedFile.type.startsWith('image/') 
        ? compressedFile 
        : uploadedFile;
      
      // Check size limit without compression
      if (!enableCompression && fileToUpload.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION) {
        throw new Error(
          `File terlalu besar (${formatFileSize(fileToUpload.size)}). ` +
          `Maksimal ${formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression.`
        );
      }

      // Upload file with progress tracking
      setUploadStep('uploading');
      setUploadProgress(0);
      
      const uploadData = await uploadWithProgress(
        fileToUpload,
        `${apiUrl}/api/v1/admin/upload`,
        token,
        (percentage) => {
          setUploadProgress(percentage);
        }
      );

      const media_url = uploadData.url;
      
      // Create slider
      setUploadStep('processing');
      const sliderData = { ...formData, media_url };
      await createHeroSlider(sliderData);
      
      setUploadStep('success');
      toast.success('Slider created successfully');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/hero-sliders');
      }, 1000);
    } catch (error: any) {
      setUploadStep('error');
      setUploadError(error.message || 'Failed to create slider');
      toast.error(error.message || 'Failed to create slider');
      setSubmitting(false);
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

          {/* Compression Option (only for images) */}
          {uploadedFile && formData.media_type === 'image' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

          {/* Upload Progress */}
          <UploadProgress 
            step={uploadStep}
            progress={uploadProgress}
            error={uploadError}
            onRetry={handleRetry}
          />

          {/* Before/After Preview (only for images with compression) */}
          {showCompressionPreview && compressedFile && uploadedFile && formData.media_type === 'image' && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-medium mb-3">Preview Compression:</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <div className="border rounded overflow-hidden">
                    <Image
                      src={mediaPreviewUrl || ''}
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
          {uploadedFile && !enableCompression && uploadedFile.size > FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION && formData.media_type === 'image' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ File terlalu besar ({formatFileSize(uploadedFile.size)})
              </p>
              <p className="text-sm text-red-600 mt-1">
                Maksimal {formatFileSize(FILE_SIZE_LIMITS.MAX_WITHOUT_COMPRESSION)} tanpa compression. Silakan aktifkan compression atau pilih file lebih kecil.
              </p>
            </div>
          )}

          {/* Preview uploaded media */}
          {mediaPreviewUrl && !showCompressionPreview && (
            <div className="border rounded-md p-2 bg-gray-50">
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
              disabled={submitting || !uploadedFile || uploadStep === 'compressing' || uploadStep === 'uploading' || uploadStep === 'processing'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploadStep === 'uploading' ? 'Uploading...' : uploadStep === 'processing' ? 'Creating...' : 'Create Slider'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/hero-sliders')}
              disabled={submitting || uploadStep === 'uploading' || uploadStep === 'processing'}
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
