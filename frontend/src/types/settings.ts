export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_group: string;
}

export interface SettingsMap {
  [key: string]: string;
}

export interface VillageProfile {
  village_name: string;
  village_head: string;
  village_vision: string;
  village_mission: string;
  village_history: string;
  village_area: string;
  village_population: string;
  village_address: string;
  village_postal_code: string;
  village_district: string;
  village_regency: string;
  village_province: string;
}

export interface GeneralSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
}

export interface SocialSettings {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
}
