import * as yup from 'yup';

export const schema = yup.object().shape({
  service_name: yup.string().required('Nama layanan tidak boleh kosong'),
  description: yup.string().required('Deskripsi tidak boleh kosong'),
    requirements: yup.string().optional().default(''),
});

export type ServiceFormData = yup.InferType<typeof schema>;
