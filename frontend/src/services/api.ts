import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = (typeof window === 'undefined' && process.env.INTERNAL_API_URL)
  ? process.env.INTERNAL_API_URL
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type News = {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  featured_image_url: string;
};

export type VillageOfficial = {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  hamlet_number?: number;
  hamlet_name?: string;
  hamlet_id?: string;
  bio?: string;
  display_order: number;
};

export type NewsApiResponse = {
  data: News[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export const getNews = async (page: number = 1, limit: number = 9): Promise<NewsApiResponse> => {
  const response = await api.get(`/api/v1/posts?page=${page}&limit=${limit}`);
  return response.data;
};

export type Potential = {
  id: number;
  title: string;
  description: string;
  cover_image_url: string;
  type: string;
};

export type Service = {
  id: number;
  service_name: string;
  description: string;
  requirements: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const getPotentials = async (): Promise<Potential[]> => {
  const response = await api.get('/api/v1/potentials');
  return response.data;
};

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get('/api/v1/services');
  return response.data;
};

export const createContact = async (data: Omit<Contact, 'id'>): Promise<void> => {
  await api.post('/api/v1/contacts', data);
};

export const getNewsBySlug = async (slug: string): Promise<News> => {
  const response = await api.get(`/api/v1/posts/slug/${slug}`);
  return response.data;
};

export const getNewsById = async (id: number): Promise<News> => {
  const response = await api.get(`/api/v1/posts/${id}`);
  return response.data;
};

export const getOfficials = async (): Promise<VillageOfficial[]> => {
  const response = await api.get('/api/v1/officials');
  return response.data;
};

// Hero Sliders (Public)
export const getHeroSliders = async () => {
  const response = await api.get('/api/v1/hero-sliders');
  return response.data;
};

// Hero Sliders (Admin)
export const getAllHeroSliders = async () => {
  const response = await api.get('/api/v1/admin/hero-sliders');
  return response.data;
};

export const getHeroSliderById = async (id: number) => {
  const response = await api.get(`/api/v1/admin/hero-sliders/${id}`);
  return response.data;
};

export const createHeroSlider = async (data: any) => {
  const response = await api.post('/api/v1/admin/hero-sliders', data);
  return response.data;
};

export const updateHeroSlider = async (id: number, data: any) => {
  const response = await api.put(`/api/v1/admin/hero-sliders/${id}`, data);
  return response.data;
};

export const deleteHeroSlider = async (id: number) => {
  const response = await api.delete(`/api/v1/admin/hero-sliders/${id}`);
  return response.data;
};

// Settings (Public)
export const getSettings = async () => {
  const response = await api.get('/api/v1/settings');
  return response.data;
};

export const getSettingsByGroup = async (group: string) => {
  const response = await api.get(`/api/v1/settings/${group}`);
  return response.data;
};

// Settings (Admin)
export const getAllSettingsAdmin = async () => {
  const response = await api.get('/api/v1/admin/settings');
  return response.data;
};

export const bulkUpdateSettings = async (settings: any[]) => {
  const response = await api.put('/api/v1/admin/settings', settings);
  return response.data;
};

export const upsertSetting = async (setting: any) => {
  const response = await api.post('/api/v1/admin/settings', setting);
  return response.data;
};

// Change Password
export const changePassword = async (data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/api/v1/admin/profile/change-password', data);
  return response.data;
};

export default api;


// Dashboard Types
export interface DashboardStats {
  content_stats: ContentStats;
  recent_news: RecentNews[];
  recent_contacts: RecentContact[];
  analytics: AnalyticsStats;
  popular_pages: PopularPage[];
  system_info?: SystemInfo;
}

export interface ContentStats {
  total_news: number;
  total_officials: number;
  total_potentials: number;
  total_services: number;
  total_contacts: number;
  unread_contacts: number;
}

export interface AnalyticsStats {
  today_views: number;
  today_visitors: number;
  week_views: number;
  week_visitors: number;
  month_views: number;
  month_visitors: number;
}

export interface RecentNews {
  id: number;
  title: string;
  slug: string;
  image_url?: string;
  published_at?: string;
}

export interface RecentContact {
  id: number;
  name: string;
  subject: string;
  is_read: boolean;
  created_at: string;
}

export interface PopularPage {
  page_url: string;
  page_title: string;
  view_count: number;
}

export interface SystemInfo {
  last_login?: string;
  current_user: string;
  current_role: string;
  app_version: string;
  database_status: string;
}

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/api/v1/admin/dashboard/stats');
  return response.data;
};
