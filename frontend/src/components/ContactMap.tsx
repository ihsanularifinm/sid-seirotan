'use client';

import React, { useMemo } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface ContactMapProps {
  address: string;
  mapEmbedUrl?: string;
  googleMapsLink?: string;
  villageName?: string;
  className?: string;
}

export default function ContactMap({
  address,
  mapEmbedUrl,
  googleMapsLink,
  villageName = 'Kantor Desa',
  className = '',
}: ContactMapProps) {
  // Use custom embed URL if provided, otherwise show placeholder
  const mapIframeUrl = useMemo(() => {
    // Only use custom embed URL if provided and not empty
    if (mapEmbedUrl && mapEmbedUrl.trim() !== '') {
      return mapEmbedUrl;
    }

    // If no custom embed URL, return null to show placeholder
    return null;
  }, [mapEmbedUrl]);

  // If no map embed URL is provided, show placeholder
  if (!mapIframeUrl) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokasi Kami di Peta</h2>
        <div className="w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8">
          <FaMapMarkerAlt className="text-6xl text-gray-400 mb-4" />
          <p className="text-gray-600 text-center font-medium text-lg">
            Peta belum tersedia
          </p>
          <p className="text-gray-500 text-center text-sm mt-2">
            Alamat kantor desa belum diatur
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Google Maps Embed */}
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md border border-gray-200">
          <iframe
            src={mapIframeUrl || ''}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Peta lokasi ${villageName}`}
          />
        </div>

        {/* Link to open in Google Maps */}
        <div className="text-center">
          <a
            href={googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 gap-2"
          >
            <FaMapMarkerAlt />
            <span>Buka di Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
