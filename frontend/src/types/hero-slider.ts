export type MediaType = 'image' | 'video';

export interface HeroSlider {
  id: number;
  title: string;
  subtitle?: string;
  media_url: string;
  media_type: MediaType;
  link_url?: string;
  link_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
