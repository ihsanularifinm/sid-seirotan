'use client';

import { Info } from 'lucide-react';

interface FilenamePreviewProps {
  filename: string;
  uploadType: 'news' | 'official' | 'hero_slider' | 'logo';
  additionalInfo?: string; // For officials: position
}

/**
 * FilenamePreview Component
 * Shows real-time preview of how the file will be saved
 * Helps users understand the filename generation logic
 */
export default function FilenamePreview({ filename, uploadType, additionalInfo }: FilenamePreviewProps) {
  if (!filename) {
    return null;
  }

  // Slugify preview (similar to backend logic)
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  };

  const getPreviewFilename = (): string => {
    const slug = slugify(filename);
    
    if (uploadType === 'logo') {
      return 'logo.png (atau logo.svg)';
    }
    
    // Show timestamp placeholder
    const timestamp = '[timestamp]';
    
    switch (uploadType) {
      case 'news':
        return `berita-${slug}-${timestamp}.jpg`;
      case 'official':
        // For officials, combine name and position if available
        const positionSlug = additionalInfo ? slugify(additionalInfo) : '';
        const combinedSlug = positionSlug ? `${slug}-${positionSlug}` : slug;
        return `pejabat-${combinedSlug}-${timestamp}.jpg`;
      case 'hero_slider':
        return `hero-${slug}-${timestamp}.jpg`;
      default:
        return `${slug}-${timestamp}.jpg`;
    }
  };

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-blue-800 font-medium mb-1">Preview Nama File:</p>
          <p className="text-blue-700 font-mono break-all">
            {getPreviewFilename()}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Timestamp akan ditambahkan otomatis untuk memastikan nama file unik
          </p>
        </div>
      </div>
    </div>
  );
}
