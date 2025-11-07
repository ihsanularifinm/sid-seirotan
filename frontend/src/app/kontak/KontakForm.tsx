'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function KontakForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/v1/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Hubungi Kami</h1>
        <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">Kami siap melayani Anda. Silakan hubungi kami melalui informasi di bawah ini atau kirimkan pesan melalui formulir.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Informasi Kontak</h2>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-start"><FaMapMarkerAlt className="w-5 mr-3 mt-1 text-blue-600" /><span>Jl. Pendidikan, Desa Sei Rotan, Kec. Percut Sei Tuan, Kab. Deli Serdang, Sumatera Utara 20371</span></p>
                <p className="flex items-center"><FaPhone className="w-5 mr-3 text-blue-600" /><span>(061) 123-4567</span></p>
                <p className="flex items-center"><FaEnvelope className="w-5 mr-3 text-blue-600" /><span>desaseirotan@gmail.com</span></p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Jam Operasional Kantor</h2>
              <div className="space-y-2 text-gray-700">
                <p>Senin - Kamis: 08:00 - 16:00 WIB</p>
                <p>Jumat: 08:00 - 15:00 WIB</p>
                <p>Sabtu & Minggu: Tutup</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Kirim Pesan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subjek</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Pesan Anda</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300">
                  {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
              {success && <p className="text-green-600 mt-4">Pesan Anda telah berhasil terkirim!</p>}
              {error && <p className="text-red-600 mt-4">Error: {error}</p>}
            </form>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Lokasi Kami di Peta</h2>
        <div className="rounded-lg shadow-md overflow-hidden">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.5649472914724!2d98.77757822187813!3d3.604560321686881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303136922e3babe5%3A0xbf3e5fa98bba09a4!2sKantor%20Balai%20Desa%2C%20Des.%20Sei%20Rotan!5e1!3m2!1sid!2sid!4v1752924097225!5m2!1sid!2sid" className="w-full aspect-video" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </main>
  );
}