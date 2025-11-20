'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHeroSlider } from '@/services/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import Cookies from 'js-cookie';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function CreateHeroSliderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
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

    if (!uploadedFile) {
      toast.error('Please select a media file');
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
