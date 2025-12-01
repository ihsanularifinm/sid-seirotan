import * as yup from 'yup';

export const schema = yup.object({
  name: yup.string().required('Nama harus diisi'),
  position: yup.string().required('Jabatan harus diisi'),
  bio: yup.string().optional(),
  display_order: yup.number().required('Urutan tampil harus diisi').typeError('Urutan tampil harus berupa angka'),
});

export interface OfficialFormData {
  name: string;
  position: string;
  bio?: string;
  display_order: number;
  photo_url?: string;
  hamlet_number?: number | null;
  hamlet_name?: string | null;
  hamlet_id?: string | null;
}
