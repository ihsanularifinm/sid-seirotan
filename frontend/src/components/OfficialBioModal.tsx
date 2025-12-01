'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import { getMediaUrl } from '@/lib/mediaUrl';

interface OfficialBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  official: {
    name: string;
    position: string;
    photo_url?: string | null;
    bio?: string | null;
  };
}

export default function OfficialBioModal({ isOpen, onClose, official }: OfficialBioModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Profil Aparatur</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <Image
                src={getMediaUrl(official.photo_url)}
                alt={`Foto ${official.name}`}
                width={200}
                height={200}
                className="w-48 h-48 rounded-lg object-cover shadow-md mx-auto md:mx-0"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{official.name}</h4>
              <p className="text-lg text-blue-600 font-medium mb-4">{official.position}</p>
              
              {official.bio && official.bio.trim() !== '' ? (
                <div>
                  <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Biodata
                  </h5>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {official.bio}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500 italic">
                    Biodata belum tersedia
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
