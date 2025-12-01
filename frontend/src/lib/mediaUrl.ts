const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Constructs full media URL from relative path
 * Handles different path formats consistently
 * 
 * @param path - Relative path from database (e.g., "/uploads/file.jpg")
 * @returns Full URL to access the media file
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return '/assets/img/placeholder.png';
  
  // If already full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If starts with /uploads/, prepend API URL + /api/v1
  if (path.startsWith('/uploads/')) {
    return `${apiUrl}/api/v1${path}`;
  }
  
  // If starts with /assets/, prepend API URL
  if (path.startsWith('/assets/')) {
    return `${apiUrl}${path}`;
  }
  
  // If starts with /api/v1/, prepend API URL only
  if (path.startsWith('/api/v1/')) {
    return `${apiUrl}${path}`;
  }
  
  // Default: assume it's a relative path, prepend API URL
  return `${apiUrl}${path}`;
}
