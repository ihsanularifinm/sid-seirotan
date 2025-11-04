import AdminLayout from '@/components/layout/AdminLayout';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Selamat Datang di Dashboard</h1>
      <p className="mt-4">Ini adalah halaman admin Anda. Fitur-fitur manajemen akan ditambahkan di sini.</p>
    </AdminLayout>
  );
}
