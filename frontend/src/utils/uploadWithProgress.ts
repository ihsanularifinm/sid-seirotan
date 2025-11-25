/**
 * Upload file with progress tracking using XMLHttpRequest
 * @param file - File to upload
 * @param url - Upload endpoint URL
 * @param token - Authorization token
 * @param onProgress - Callback function to track upload progress (0-100)
 * @param additionalData - Optional additional form data to send with upload
 * @returns Promise with upload response data
 */
export async function uploadWithProgress(
  file: File,
  url: string,
  token: string,
  onProgress: (percentage: number) => void,
  additionalData?: Record<string, string>
): Promise<{ url: string; filename?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    // Append additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress(percentage);
      }
    });

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload. Please check your connection and try again.'));
    });

    // Handle upload abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. Please try again.'));
    });

    // Open connection and send request
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 60000; // 60 second timeout
    xhr.send(formData);
  });
}

/**
 * Upload status types for multi-step upload process
 */
export type UploadStep = 'idle' | 'compressing' | 'uploading' | 'processing' | 'success' | 'error';

/**
 * Upload state interface for tracking upload progress
 */
export interface UploadState {
  step: UploadStep;
  progress: number;
  error: string | null;
}
