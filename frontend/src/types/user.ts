import * as yup from 'yup';

export const schema = yup.object().shape({
  full_name: yup.string().required('Nama lengkap tidak boleh kosong'),
  username: yup.string().required('Username tidak boleh kosong'),
  password: yup.string().required('Password tidak boleh kosong'),
  role: yup.string().oneOf(['admin', 'author']).required('Role tidak boleh kosong'),
});

export type UserFormData = yup.InferType<typeof schema>;

export const editSchema = yup.object().shape({
  full_name: yup.string().required('Nama lengkap tidak boleh kosong'),
  username: yup.string().required('Username tidak boleh kosong'),
  password: yup.string().optional(),
  role: yup.string().oneOf(['admin', 'author']).required('Role tidak boleh kosong'),
});

export type EditUserFormData = yup.InferType<typeof editSchema>;
