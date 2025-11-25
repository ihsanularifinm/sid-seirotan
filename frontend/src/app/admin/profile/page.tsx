'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllSettingsAdmin, bulkUpdateSettings } from '@/services/api';
import { SiteSetting } from '@/types/settings';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function AdminProfilePage() {
  // Protect this page - only admin and superadmin can access
  const { loading: roleLoading } = useRoleProtection(['admin', 'superadmin']);
  
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getAllSettingsAdmin();
      
      // Get only profile group settings
      const profileSettings = data.profile || [];
      setSettings(profileSettings);

      // Initialize form data
      const initialFormData: { [key: string]: string } = {};
      profileSettings.forEach((setting: SiteSetting) => {
        initialFormData[setting.setting_key] = setting.setting_value || '';
      });
      setFormData(initialFormData);

      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else {
        toast.error('Failed to fetch profile settings');
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
      // Prepare update payload
      const updates = settings.map((setting) => ({
        setting_key: setting.setting_key,
        setting_value: formData[setting.setting_key] || '',
        setting_group: 'profile',
      }));

      await bulkUpdateSettings(updates);
      toast.success('Profile settings saved successfully');
      fetchSettings();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else {
        toast.error('Failed to save profile settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      village_name: 'Nama Desa',
      village_head: 'Kepala Desa',
      village_vision: 'Visi Desa',
      village_mission: 'Misi Desa',
      village_history: 'Sejarah Desa',
      village_area: 'Luas Wilayah',
      village_population: 'Jumlah Penduduk',
      village_address: 'Alamat Desa',
      village_district: 'Kecamatan',
      village_regency: 'Kabupaten',
      village_province: 'Provinsi',
      village_postal_code: 'Kode Pos',
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };



  const getFieldPlaceholder = (key: string): string => {
    const placeholders: { [key: string]: string } = {
      village_name: 'Contoh: Desa Seirotan',
      village_head: 'Contoh: Bapak Kepala Desa',
      village_vision: 'Masukkan visi desa...',
      village_mission: 'Masukkan misi desa (pisahkan dengan enter untuk numbered list)...',
      village_history: 'Masukkan sejarah desa...',
      village_area: 'Contoh: 450 hektar',
      village_population: 'Contoh: 3.250 jiwa',
      village_address: 'Contoh: Jl. Raya Seirotan',
      village_district: 'Contoh: Percut Sei Tuan',
      village_regency: 'Contoh: Deli Serdang',
      village_province: 'Contoh: Sumatera Utara',
      village_postal_code: 'Contoh: 20371',
    };
    return placeholders[key] || `Masukkan ${getFieldLabel(key).toLowerCase()}...`;
  };

  const getFieldRows = (key: string): number => {
    if (key === 'village_history') return 10;
    if (key === 'village_mission') return 8;
    if (key === 'village_vision') return 4;
    return 3;
  };

  if (loading || roleLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Desa</h1>
        <p className="text-gray-600">
          Kelola informasi profil desa yang akan ditampilkan di halaman publik
        </p>
      </div>

      {/* Profile Desa Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profil Desa</h2>
        <div className="space-y-6">
          {/* Informasi Dasar */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings
                .filter((s) => ['village_name', 'village_head', 'village_area', 'village_population'].includes(s.setting_key))
                .map((setting) => (
                  <div key={setting.id}>
                    <label className="block text-sm font-medium mb-1">
                      {getFieldLabel(setting.setting_key)}
                    </label>
                    <input
                      type="text"
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder={getFieldPlaceholder(setting.setting_key)}
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Alamat */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Alamat</h2>
            <div className="grid grid-cols-1 gap-4">
              {settings
                .filter((s) => s.setting_key === 'village_address')
                .map((setting) => (
                  <div key={setting.id}>
                    <label className="block text-sm font-medium mb-1">
                      {getFieldLabel(setting.setting_key)}
                    </label>
                    <input
                      type="text"
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder={getFieldPlaceholder(setting.setting_key)}
                    />
                  </div>
                ))}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings
                  .filter((s) => ['village_district', 'village_regency', 'village_province', 'village_postal_code'].includes(s.setting_key))
                  .map((setting) => (
                    <div key={setting.id}>
                      <label className="block text-sm font-medium mb-1">
                        {getFieldLabel(setting.setting_key)}
                      </label>
                      <input
                        type="text"
                        value={formData[setting.setting_key] || ''}
                        onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder={getFieldPlaceholder(setting.setting_key)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Visi & Misi */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Visi & Misi</h2>
            <div className="space-y-4">
              {settings
                .filter((s) => ['village_vision', 'village_mission'].includes(s.setting_key))
                .map((setting) => (
                  <div key={setting.id}>
                    <label className="block text-sm font-medium mb-1">
                      {getFieldLabel(setting.setting_key)}
                    </label>
                    <textarea
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows={getFieldRows(setting.setting_key)}
                      placeholder={getFieldPlaceholder(setting.setting_key)}
                    />
                    {setting.setting_key === 'village_mission' && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Tip: Pisahkan setiap misi dengan baris baru (Enter) untuk tampilan numbered list
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Sejarah */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sejarah Desa</h2>
            {settings
              .filter((s) => s.setting_key === 'village_history')
              .map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium mb-1">
                    {getFieldLabel(setting.setting_key)}
                  </label>
                  <textarea
                    value={formData[setting.setting_key] || ''}
                    onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={getFieldRows(setting.setting_key)}
                    placeholder={getFieldPlaceholder(setting.setting_key)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Pisahkan paragraf dengan baris kosong untuk tampilan yang lebih rapi
                  </p>
                </div>
              ))}
          </div>

          {settings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Belum ada data profil desa.</p>
              <p className="text-sm">Silakan jalankan seed data terlebih dahulu.</p>
            </div>
          )}
        </div>

        {settings.length > 0 && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              onClick={() => router.push('/profil')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Preview Halaman Profil
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
