'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getHeroSliderById, updateHeroSlider } from '@/services/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';
import { getMediaUrl } from '@/lib/mediaUrl';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setUploadedFile(file);
    if (file) {
      setMediaPreviewUrl(URL.createObjectURL(file));
      // Auto-detect media type from file
      if (file.type.startsWith('video/')) {
        setFormData({ ...formData, media_type: 'video' });
      } else {
        setFormData({ ...formData, media_type: 'image' });
      }
    } else {
      setMediaPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadedFile);

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
            <p className="text-xs text-gray-500 mt-1">
              Upload new file to replace existing media, or leave empty to keep current media
            </p>
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
