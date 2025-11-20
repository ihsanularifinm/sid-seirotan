import * as yup from 'yup';

export type News = {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
    featured_image_url?: string;
};

export const schema = yup.object().shape({
  title: yup.string().required('Judul tidak boleh kosong'),
  content: yup.string().required('Isi berita tidak boleh kosong'),
  status: yup.string().oneOf(['draft', 'published', 'archived']).required(),
  published_at: yup.string().nullable().optional(),
  featured_image_url: yup.string().optional().default(''),
});

export type NewsFormData = yup.InferType<typeof schema>;
