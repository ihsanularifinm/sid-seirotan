import * as yup from 'yup';

export interface OfficialFormData {
  name: string;
  position: string;
  bio: string;
  display_order: number;
  photo_url?: string;
}

export const schema = yup.object().shape({
  name: yup.string().required('Nama harus diisi'),
  position: yup.string().required('Jabatan harus diisi'),
  bio: yup.string().required('Bio harus diisi'),
  display_order: yup.number().required('Urutan tampil harus diisi').typeError('Urutan tampil harus berupa angka'),
});
