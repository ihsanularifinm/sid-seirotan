/**
 * Placeholder Image Utility
 * 
 * Generates placeholder images with dimensions displayed using placehold.co service.
 * Useful for showing recommended image sizes to admins during upload.
 */

export interface PlaceholderOptions {
  width: number;
  height: number;
  label?: string;
  bgColor?: string;
  textColor?: string;
}

/**
 * Generate placeholder image URL with dimensions displayed
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param label - Optional label text (e.g., "Logo", "Foto Berita")
 * @param bgColor - Background color (hex without #), default: 'e5e7eb' (gray-200)
 * @param textColor - Text color (hex without #), default: '6b7280' (gray-500)
 * @returns Placeholder image URL from placehold.co
 * 
 * @example
 * getPlaceholder(200, 200, 'Logo')
 * // Returns: https://placehold.co/200x200/e5e7eb/6b7280?text=Logo+%7C+200x200px&font=montserrat
 */
export function getPlaceholder(
  width: number,
  height: number,
  label?: string,
  bgColor: string = 'e5e7eb',
  textColor: string = '6b7280'
): string {
  const sizeText = `${width}x${height}px`;
  const displayText = label 
    ? `${label}+%7C+${sizeText}` 
    : sizeText;
  
  return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${displayText}&font=montserrat`;
}

/**
 * Predefined placeholders for common use cases in the application
 * 
 * All placeholders show their recommended dimensions in the image
 */
export const PLACEHOLDERS = {
  /** Logo placeholder - 200x200px square with blue background */
  logo: getPlaceholder(200, 200, 'Logo', '2563eb', 'ffffff'),
  
  /** Large logo placeholder - 400x400px square with blue background */
  logoLarge: getPlaceholder(400, 400, 'Logo', '2563eb', 'ffffff'),
  
  /** News featured image placeholder - 800x600px (4:3 ratio) */
  news: getPlaceholder(800, 600, 'Foto+Berita'),
  
  /** Official/Aparatur photo placeholder - 400x500px portrait (4:5 ratio) */
  official: getPlaceholder(400, 500, 'Foto+Aparatur'),
  
  /** Organizational structure placeholder - 1200x800px landscape (3:2 ratio) */
  struktur: getPlaceholder(1200, 800, 'Struktur+Organisasi'),
  
  /** Hero slider placeholder - 1920x1080px (16:9 ratio) */
  heroSlider: getPlaceholder(1920, 1080, 'Hero+Slider'),
  
  /** Generic thumbnail placeholder - 300x200px */
  thumbnail: getPlaceholder(300, 200, 'Thumbnail'),
} as const;

/**
 * Get placeholder with custom options
 * 
 * @param options - Placeholder configuration options
 * @returns Placeholder image URL
 * 
 * @example
 * getPlaceholderWithOptions({ width: 600, height: 400, label: 'Custom', bgColor: 'ff0000' })
 */
export function getPlaceholderWithOptions(options: PlaceholderOptions): string {
  return getPlaceholder(
    options.width,
    options.height,
    options.label,
    options.bgColor,
    options.textColor
  );
}
