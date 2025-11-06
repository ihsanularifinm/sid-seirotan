import * as yup from 'yup';

export const schema = yup.object().shape({
  title: yup.string().required('Judul tidak boleh kosong'),
  description: yup.string().optional(),
  cover_image_url: yup.string().url('URL tidak valid').optional(),
  type: yup.string().oneOf(['umkm', 'tourism', 'agriculture', 'other']).required('Tipe tidak boleh kosong'),
});

export type PotentialFormData = yup.InferType<typeof schema>;
