import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Kontak Kami',
  description: 'Hubungi Pemerintah Desa Sei Rotan. Temukan informasi kontak, alamat, telepon, email, dan media sosial kami.',
};

export default function ContactPage() {
  return <ContactPageClient />;
}
