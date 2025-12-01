'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/mediaUrl';
import { toRomanNumeral } from '@/utils/romanNumerals';
import OfficialBioModal from '@/components/OfficialBioModal';
import { VillageOfficial } from '@/services/api';

interface PemerintahanClientProps {
  sortedGroups: [string, VillageOfficial[]][];
  strukturImage: string;
  siteName: string;
}

export default function PemerintahanClient({ sortedGroups, strukturImage, siteName }: PemerintahanClientProps) {
  const [selectedOfficial, setSelectedOfficial] = useState<VillageOfficial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOfficialClick = (official: VillageOfficial) => {
    setSelectedOfficial(official);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOfficial(null), 300); // Clear after animation
  };

  return (
    <>
      {/* Aparatur Desa Section - Grouped by Hamlet */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
          Aparatur Desa
        </h2>
        
        {sortedGroups.map(([hamletKey, groupOfficials]) => {
          // Determine display name for hamlet
          let hamletDisplayName = 'Aparatur Desa';
          if (hamletKey !== 'general') {
            const firstOfficial = groupOfficials[0];
            if (firstOfficial.hamlet_name) {
              hamletDisplayName = `Dusun ${firstOfficial.hamlet_name}`;
            } else if (firstOfficial.hamlet_id) {
              // Convert hamlet_id (e.g., "3A", "3B") to roman with suffix (e.g., "III-A", "III-B")
              const match = firstOfficial.hamlet_id.match(/^(\d+)([A-Z]?)$/);
              if (match) {
                const number = parseInt(match[1]);
                const suffix = match[2];
                const roman = toRomanNumeral(number);
                hamletDisplayName = suffix ? `Dusun ${roman}-${suffix}` : `Dusun ${roman}`;
              } else {
                hamletDisplayName = `Dusun ${firstOfficial.hamlet_id}`;
              }
            } else if (firstOfficial.hamlet_number) {
              hamletDisplayName = `Dusun ${toRomanNumeral(firstOfficial.hamlet_number)}`;
            }
          }
          
          return (
            <div key={hamletKey} className="mb-12">
              {/* Group Header - Only show if not general group */}
              {hamletKey !== 'general' && (
                <h3 className="text-xl font-semibold text-gray-600 mb-6 text-center">
                  {hamletDisplayName}
                </h3>
              )}
              
              {/* Officials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {groupOfficials.map((official) => (
                  <div 
                    key={official.id} 
                    className="text-center cursor-pointer group"
                    onClick={() => handleOfficialClick(official)}
                  >
                    <div className="relative">
                      <Image
                        src={getMediaUrl(official.photo_url)}
                        alt={`Foto ${official.name}`}
                        width={150}
                        height={150}
                        className="w-36 h-36 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                        unoptimized={official.photo_url?.includes('placehold.co')}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 w-36 h-36 mx-auto rounded-full bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium text-sm">
                          Lihat Profil
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-md text-gray-800 group-hover:text-blue-600 transition-colors">
                      {official.name}
                    </h4>
                    <p className="text-sm text-gray-500">{official.position}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Struktur Organisasi Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Struktur Organisasi
        </h2>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-5xl">
            <Image
              src={strukturImage.startsWith('data:') || strukturImage.startsWith('http') ? strukturImage : getMediaUrl(strukturImage)}
              alt={`Struktur Organisasi Pemerintahan ${siteName}`}
              width={1200}
              height={800}
              className="w-full h-auto rounded"
              unoptimized={strukturImage?.includes('placehold.co')}
            />
          </div>
        </div>
      </section>

      {/* Bio Modal */}
      {selectedOfficial && (
        <OfficialBioModal
          isOpen={isModalOpen}
          onClose={closeModal}
          official={selectedOfficial}
        />
      )}
    </>
  );
}
