'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { transformSettings } from '@/utils/settingsAdapter';

/**
 * Site Settings Interface
 * Represents all public-facing site configuration
 */
export interface SiteSettings {
  general: {
    site_name: string;
    site_description: string;
    site_logo: string;
    contact_email: string;
    contact_phone: string;
    contact_whatsapp: string;
    contact_address: string;
    map_embed_url: string;
    google_maps_link: string;
    district: string;
    regency: string;
  };
  social: {
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
  };
  government?: {
    organizational_structure_image?: string;
  };
}

/**
 * Default fallback settings
 * Used when settings fail to load or are not yet available
 */
const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    site_name: 'Website Desa',
    site_description: 'Website resmi desa',
    site_logo: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_address: '',
    map_embed_url: '',
    google_maps_link: '',
    district: '',
    regency: '',
  },
  social: {},
  government: {},
};

interface SettingsContextValue {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * SettingsProvider Component
 * Fetches and provides site settings to all child components
 * Implements caching in localStorage for better performance
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Invalidate cache and clear localStorage
   * Should be called after settings are updated in admin panel
   */
  const invalidateCache = () => {
    try {
      localStorage.removeItem('site_settings');
      localStorage.removeItem('site_settings_timestamp');
      console.log('Settings cache invalidated');
    } catch (e) {
      console.warn('Failed to invalidate cache:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/v1/settings`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      const transformedData = transformSettings(data);
      setSettings(transformedData);

      // Cache settings in localStorage with version
      try {
        localStorage.setItem('site_settings', JSON.stringify(transformedData));
        localStorage.setItem('site_settings_timestamp', Date.now().toString());
        localStorage.setItem('site_settings_version', '2'); // Increment this to invalidate old cache
      } catch (e) {
        console.warn('Failed to cache settings:', e);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Try to load from cache
      try {
        const cached = localStorage.getItem('site_settings');
        if (cached) {
          setSettings(JSON.parse(cached));
          console.log('Loaded settings from cache');
        } else {
          // Use default settings as last resort
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache first for instant load
    try {
      const cached = localStorage.getItem('site_settings');
      const timestamp = localStorage.getItem('site_settings_timestamp');
      const version = localStorage.getItem('site_settings_version');
      const CURRENT_VERSION = '2'; // Must match version in fetchSettings
      
      // Invalidate cache if version mismatch
      if (version !== CURRENT_VERSION) {
        console.log('Cache version mismatch, fetching fresh data');
        invalidateCache();
        fetchSettings();
        return;
      }
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes
        
        if (age < MAX_CACHE_AGE) {
          setSettings(JSON.parse(cached));
          setLoading(false);
          console.log('Loaded settings from cache (fresh)');
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached settings:', e);
    }

    // Fetch fresh settings
    fetchSettings();
  }, []);

  const value: SettingsContextValue = {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    invalidateCache,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettings Hook
 * Access site settings from any component
 * 
 * @throws Error if used outside SettingsProvider
 * @returns Settings context value with settings, loading state, and refetch function
 * 
 * @example
 * const { settings, loading } = useSettings();
 * if (loading) return <div>Loading...</div>;
 * return <div>{settings?.general.site_name}</div>;
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
}

/**
 * useSettingsValue Hook
 * Convenience hook that returns settings directly (or null if loading/error)
 * 
 * @returns SiteSettings or null
 * 
 * @example
 * const settings = useSettingsValue();
 * return <div>{settings?.general.site_name || 'Default Name'}</div>;
 */
export function useSettingsValue(): SiteSettings | null {
  const { settings } = useSettings();
  return settings;
}
