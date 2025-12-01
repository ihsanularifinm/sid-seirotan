'use client';

import { useEffect, useState } from 'react';
import { getSettingsByGroup, getOfficials } from '@/services/api';
import { SettingsMap } from '@/types/settings';

export default function VillageProfile() {
  const [profile, setProfile] = useState<SettingsMap>({});
  const [villageHeadName, setVillageHeadName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, officialsData] = await Promise.all([
          getSettingsByGroup('profile'),
          getOfficials()
        ]);
        
        setProfile(profileData);

        // Find village head from officials
        const headOfficial = officialsData.find(o => 
          o.position.toLowerCase().includes('kepala desa')
        );
        if (headOfficial) {
          setVillageHeadName(headOfficial.name);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch village profile data:', err);
        setError('Failed to load village profile');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-10"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Fallback values if settings not found
  const villageName = profile.village_name || '-';
  // Use dynamic village head name if found, otherwise fallback to settings
  const villageHead = villageHeadName || profile.village_head || '-';
  const villageVision = profile.village_vision || 'Visi';
  const villageMission = profile.village_mission || '1. Misi 1\n2. Misi 2\n3. Misi 3';
  const villageHistory = profile.village_history || 'Sejarah';
  const villageArea = profile.village_area || '-';
  const villagePopulation = profile.village_population || '-';
  const villageAddress = profile.village_address || '-';
  const villageDistrict = profile.village_district || '-';
  const villageRegency = profile.village_regency || '-';
  const villageProvince = profile.village_province || '-';

  // Parse mission (split by newline or numbered list)
  const missionItems = villageMission
    .split('\n')
    .filter(item => item.trim())
    .map(item => item.replace(/^\d+\.\s*/, '').trim());

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Profil Desa {villageName}
      </h1>

      {/* Data Umum Desa */}
      <section className="mb-16 bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Data Umum Desa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Identity & Location */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Nama Desa:</span>
                {villageName}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Kecamatan:</span>
                {villageDistrict}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Kabupaten:</span>
                {villageRegency}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Provinsi:</span>
                {villageProvince}
              </p>
            </div>
            {villageAddress !== '-' && (
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold block text-gray-800">Alamat:</span>
                  {villageAddress}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Leadership & Demographics */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Kepala Desa:</span>
                {villageHead}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Jumlah Penduduk:</span>
                {villagePopulation}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold block text-gray-800">Luas Wilayah:</span>
                {villageArea}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah Desa */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sejarah Desa</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {villageHistory}
        </p>
      </section>

      {/* Visi & Misi */}
      <section className="mb-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Visi dan Misi
        </h2>
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800">Visi</h3>
          <p className="text-gray-600 mt-2 italic">
            &quot;{villageVision}&quot;
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 text-center">Misi</h3>
          <ol className="list-decimal list-inside mt-4 max-w-2xl mx-auto text-gray-600 space-y-2">
            {missionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
