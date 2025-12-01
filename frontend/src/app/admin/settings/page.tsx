'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllSettingsAdmin, bulkUpdateSettings } from '@/services/api';
import { SiteSetting } from '@/types/settings';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import LogoUpload from '@/components/admin/LogoUpload';
import { useRoleProtection } from '@/hooks/useRoleProtection';
import { useSettings } from '@/contexts/SettingsContext';

type SettingGroup = 'general' | 'social';

interface GroupedSettings {
  general: SiteSetting[];
  social: SiteSetting[];
}

const FIELD_ORDER = {
  general: [
    'site_logo',
    'site_name',
    'site_description',
    'district',
    'regency',
    'contact_address',
    'google_maps_link',
    'map_embed_url',
    'contact_email',
    'contact_phone',
    'contact_whatsapp',
  ],
  social: [
    'facebook_url',
    'instagram_url',
    'twitter_url',
    'youtube_url',
    'tiktok_url',
  ],
};

export default function AdminSettingsPage() {
  // Protect this page - only admin and superadmin can access
  const { loading: roleLoading } = useRoleProtection(['admin', 'superadmin']);
  
  const router = useRouter();
  const { invalidateCache, refetch } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingGroup>('general');
  const [settings, setSettings] = useState<GroupedSettings>({
    general: [],
    social: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getAllSettingsAdmin();
      
      // Backend returns grouped data: { general: [...], social: [...] }
      // Profile settings are now in separate page
      // Sort settings based on defined order and filter out those not in order list (hidden fields)
      const sortAndFilterSettings = (settings: SiteSetting[], order: string[]) => {
        // First filter to only include settings that are in the order list
        const filtered = settings.filter(s => order.includes(s.setting_key));
        
        return filtered.sort((a, b) => {
          const indexA = order.indexOf(a.setting_key);
          const indexB = order.indexOf(b.setting_key);
          return indexA - indexB;
        });
      };

      const grouped: GroupedSettings = {
        general: sortAndFilterSettings(data.general || [], FIELD_ORDER.general),
        social: sortAndFilterSettings(data.social || [], FIELD_ORDER.social),
      };

      setSettings(grouped);

      // Initialize form data from all groups
      const initialFormData: { [key: string]: string } = {};
      Object.values(grouped).forEach((groupSettings) => {
        groupSettings.forEach((setting: SiteSetting) => {
          initialFormData[setting.setting_key] = setting.setting_value || '';
        });
      });
      setFormData(initialFormData);

      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else {
        toast.error('Failed to fetch settings');
      }
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current tab settings
      const currentSettings = settings[activeTab];
      
      // Prepare update payload
      const updates = currentSettings.map((setting) => ({
        setting_key: setting.setting_key,
        setting_value: formData[setting.setting_key] || '',
        setting_group: setting.setting_group,
      }));

      await bulkUpdateSettings(updates);
      toast.success('Settings saved successfully');
      
      // Invalidate cache and refetch to show changes immediately
      invalidateCache();
      await refetch();
      
      fetchSettings();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else {
        toast.error('Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (key: string): string => {
    // Custom labels for specific fields
    const customLabels: { [key: string]: string } = {
      site_logo: 'Logo Website',
      site_name: 'Nama Website / Nama Desa',
      district: 'Kecamatan',
      regency: 'Kabupaten',
      site_description: 'Deskripsi Website Desa / Profil Singkat Desa',
      contact_email: 'Email Kontak',
      contact_phone: 'Nomor Telepon',
      contact_whatsapp: 'WhatsApp',
      contact_address: 'Alamat',
      google_maps_link: 'Link Google Maps',
    };

    if (customLabels[key]) {
      return customLabels[key];
    }

    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldType = (key: string): string => {
    if (key.includes('url') || key.includes('email')) return 'url';
    if (key.includes('phone') || key.includes('whatsapp')) return 'tel';
    if (key.includes('mission') || key.includes('history') || key.includes('description')) return 'textarea';
    return 'text';
  };

  if (loading || roleLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
        <p className="text-gray-600">
          Konfigurasi umum website (nama, kontak, logo, social media)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'general'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'social'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Social Media
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {settings[activeTab].map((setting) => {
            // Handle logo separately with LogoUpload component
            if (setting.setting_key === 'site_logo') {
              return (
                <div key={setting.id} className="border-b pb-6">
                  <LogoUpload
                    currentLogo={formData[setting.setting_key]}
                    onUploadSuccess={async (url) => {
                      handleInputChange(setting.setting_key, url);
                      // Auto-save logo after upload
                      setTimeout(async () => {
                        await handleSave();
                      }, 500);
                    }}
                  />
                </div>
              );
            }

            const fieldType = getFieldType(setting.setting_key);
            const isSyncedField = ['site_name', 'district', 'regency', 'contact_address'].includes(setting.setting_key);
            
            return (
              <div key={setting.id}>
                <label className="block text-sm font-medium mb-1">
                  {getFieldLabel(setting.setting_key)}
                </label>
                {fieldType === 'textarea' ? (
                  <textarea
                    value={formData[setting.setting_key] || ''}
                    onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                    placeholder={`Enter ${getFieldLabel(setting.setting_key).toLowerCase()}`}
                  />
                ) : (
                  <div className="relative">
                    <input
                      type={fieldType}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      className={`w-full border rounded px-3 py-2 ${isSyncedField ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder={`Enter ${getFieldLabel(setting.setting_key).toLowerCase()}`}
                      disabled={isSyncedField}
                    />
                    {isSyncedField && (
                      <p className="text-xs text-gray-500 mt-1">
                        🔒 Diambil otomatis dari Profil Desa
                      </p>
                    )}
                  </div>
                )}
                {setting.setting_key.includes('mission') && (
                  <p className="text-xs text-gray-500 mt-1">
                    Separate each mission with a new line for numbered list display
                  </p>
                )}
              </div>
            );
          })}

          {settings[activeTab].length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No settings found for this group
            </div>
          )}
        </div>

        {settings[activeTab].length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
