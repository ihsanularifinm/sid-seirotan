import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://seirotan.desa.id';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/profil`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/pemerintahan`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/potensi`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
    },
  ];
}