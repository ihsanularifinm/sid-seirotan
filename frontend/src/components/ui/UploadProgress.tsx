import React from 'react';
import { UploadStep } from '@/utils/uploadWithProgress';

interface UploadProgressProps {
  step: UploadStep;
  progress: number;
  error: string | null;
  onRetry?: () => void;
}

export function UploadProgress({ step, progress, error, onRetry }: UploadProgressProps) {
  if (step === 'idle') return null;

  const getStepLabel = () => {
    switch (step) {
      case 'compressing':
        return 'Compressing image...';
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'compressing':
      case 'uploading':
      case 'processing':
        return 'bg-blue-600';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="mb-4 bg-white border rounded-lg p-4 shadow-sm">
      {/* Step Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{getStepLabel()}</span>
        {step === 'uploading' && (
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        )}
      </div>

      {/* Progress Bar */}
      {(step === 'compressing' || step === 'uploading' || step === 'processing') && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${getStepColor()}`}
            style={{ width: step === 'uploading' ? `${progress}%` : '100%' }}
          >
            {(step === 'compressing' || step === 'processing') && (
              <div className="h-full w-full rounded-full animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {step === 'success' && (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">File uploaded successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {step === 'error' && error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-red-600">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Loading Spinner for Processing */}
      {(step === 'compressing' || step === 'processing') && (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Please wait...</span>
        </div>
      )}
    </div>
  );
}
