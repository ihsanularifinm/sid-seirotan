import { SiteSettings } from '@/contexts/SettingsContext';

/**
 * Transforms flat settings map from API into nested SiteSettings object
 * 
 * @param flatSettings - Dictionary of settings from API (key-value pairs)
 * @returns Structured SiteSettings object
 */
export function transformSettings(flatSettings: Record<string, any>): SiteSettings {
  // Default structure
  const settings: SiteSettings = {
    general: {
      site_name: flatSettings.site_name || 'Website Desa',
      site_description: flatSettings.site_description || 'Website resmi pemerintah desa',
      site_logo: flatSettings.site_logo || '',
      contact_email: flatSettings.contact_email || '',
      contact_phone: flatSettings.contact_phone || '',
      contact_whatsapp: flatSettings.contact_whatsapp || '',
      contact_address: flatSettings.contact_address || '',
      map_embed_url: flatSettings.map_embed_url || '',
      google_maps_link: flatSettings.google_maps_link || '',
      district: flatSettings.district || '',
      regency: flatSettings.regency || '',
    },
    social: {
      facebook_url: flatSettings.facebook_url || '',
      instagram_url: flatSettings.instagram_url || '',
      twitter_url: flatSettings.twitter_url || '',
      youtube_url: flatSettings.youtube_url || '',
      tiktok_url: flatSettings.tiktok_url || '',
    },
    government: {
      organizational_structure_image: flatSettings.organizational_structure_image || '',
    },
  };

  return settings;
}
