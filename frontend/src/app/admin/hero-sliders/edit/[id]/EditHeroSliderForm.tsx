'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getHeroSliderById, updateHeroSlider } from '@/services/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { getMediaUrl } from '@/lib/mediaUrl';
import { compressImage, formatFileSize, calculateSavings } from '@/utils/imageCompression';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const FILE_SIZE_LIMITS = {
  WARNING_THRESHOLD: 2 * 1024 * 1024, // 2MB
  MAX_WITHOUT_COMPRESSION: 5 * 1024 * 1024, // 5MB
};

export default function EditHeroSliderForm() {
  const router = useRouter();
  const params = useParams();
  const sliderId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  if (!sliderId) {
    return (
      <AdminLayout>
        <div className="text-red-600">Invalid slider ID</div>
      </AdminLayout>
    );
  }
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  const [showCompressionPreview, setShowCompressionPreview] = useState(false);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string>('');
  
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
    if (!sliderId) return;
    
    const fetchSlider = async () => {
      try {
        const token = Cookies.get('jwt_token');
        if (!token) {
          toast.error('Unauthorized: Please login');
          router.push('/admin/login');
          return;
        }

        const slider = await getHeroSliderById(parseInt(sliderId));
        setFormData({
          title: slider.title,
          subtitle: slider.subtitle || '',
          media_url: slider.media_url,
          media_type: slider.media_type,
          link_url: slider.link_url || '',
          link_text: slider.link_text || '',
          display_order: slider.display_order,
          is_active: slider.is_active,
        });
        setExistingMediaUrl(slider.media_url);
        setLoading(false);
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/admin/login');
        } else {
          toast.error('Failed to fetch slider');
          router.push('/admin/hero-sliders');
        }
      }
    };

    fetchSlider();
  }, [sliderId, router]);

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

    // Validate file size if uploading new file
    if (uploadedFile) {
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
    }

    setSubmitting(true);

    try {
      const token = Cookies.get('jwt_token');
      if (!token) {
        toast.error('Unauthorized: No token found');
        router.push('/admin/login');
        return;
      }

      let media_url = formData.media_url;

      // Upload file if new file is selected
      if (uploadedFile) {
        // Determine which file to upload
        const fileToUpload = enableCompression && compressedFile ? compressedFile : uploadedFile;
        
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
        media_url = uploadData.url;
        setUploading(false);
      }

      const sliderData = { ...formData, media_url };

      await updateHeroSlider(parseInt(sliderId), sliderData);
      toast.success('Slider updated successfully');
      router.push('/admin/hero-sliders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update slider');
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) {
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Hero Slider</h1>

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
            <label className="block text-sm font-medium mb-1">Media (Image/Video)</label>
            
            {/* Preview existing or uploaded media */}
            {(mediaPreviewUrl || existingMediaUrl) && (
              <div className="mb-3 border rounded-md p-2 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">
                  {mediaPreviewUrl ? 'New media preview:' : 'Current media:'}
                </p>
                {formData.media_type === 'video' ? (
                  <video
                    src={mediaPreviewUrl || getMediaUrl(existingMediaUrl)}
                    className="w-full max-w-md h-48 object-cover rounded-md"
                    controls
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPreviewUrl || getMediaUrl(existingMediaUrl)}
                    alt="Media Preview"
                    className="w-full max-w-md h-48 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/img/placeholder.png';
                    }}
                  />
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1 mb-2">
              Upload new file to replace existing media, or leave empty to keep current media
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-1">📐 Ukuran yang Direkomendasikan:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4">
                <li>• <strong>Gambar:</strong> 1920x1080 pixels (16:9 ratio) - Format: JPG, PNG, WebP</li>
                <li>• <strong>Video:</strong> 1920x1080 pixels (Full HD) - Format: MP4, WebM</li>
                <li>• <strong>Ukuran File:</strong> Maksimal 5MB (gunakan compression untuk file besar)</li>
              </ul>
            </div>
          </div>

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
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
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
              disabled={uploading || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : submitting ? 'Updating...' : 'Update Slider'}
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
