import axios from 'axios';

const API_URL = (typeof window === 'undefined' && process.env.INTERNAL_API_URL)
  ? process.env.INTERNAL_API_URL
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;
