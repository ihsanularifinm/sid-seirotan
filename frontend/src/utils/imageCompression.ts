import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
}

/**
 * Compress an image file with configurable options
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 2, // Max file size 2MB (balance quality & size)
    maxWidthOrHeight: 1920, // Max dimension for web display
    useWebWorker: true, // Use web worker for better performance
    initialQuality: 0.9, // 90% quality (minimal visual loss)
    ...options,
  };

  try {
    console.log('Compressing image:', {
      originalSize: file.size,
      originalName: file.name,
      options: defaultOptions,
    });

    const compressedFile = await imageCompression(file, defaultOptions);

    console.log('Compression complete:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
    });

    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate compression savings percentage
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Percentage saved (0-100)
 */
export function calculateSavings(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return Math.round((1 - compressedSize / originalSize) * 100);
}
