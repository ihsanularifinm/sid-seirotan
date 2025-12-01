import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { fetchSettingsForMetadata, generateMetadata as createMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for contact page
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettingsForMetadata();
  const siteName = settings?.general?.site_name || 'Website Desa';
  
  return createMetadata(settings, {
    pageTitle: 'Kontak Kami',
    pageDescription: `Hubungi Pemerintah ${siteName}. Temukan informasi kontak, alamat, telepon, email, dan media sosial kami.`,
    pageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seirotan.desa.id'}/kontak`,
  });
}

export default function ContactPage() {
  return <ContactPageClient />;
}
