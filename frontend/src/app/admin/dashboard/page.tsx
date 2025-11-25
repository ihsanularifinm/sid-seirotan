'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { getDashboardStats, DashboardStats } from '@/services/api';
import {
  Newspaper,
  Users,
  TrendingUp,
  FileText,
  Mail,
  Eye,
  UserCheck,
  Plus,
  Settings,
  Image as ImageIcon,
  Calendar,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/mediaUrl';
import toast from 'react-hot-toast';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function DashboardPage() {
  // Protect this page - only admin and superadmin can access
  const { loading: roleLoading } = useRoleProtection(['admin', 'superadmin']);
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
      } else if (error.response?.status === 403) {
        // Author role tidak punya akses ke dashboard, redirect ke berita
        toast('Redirecting to news page...', { icon: 'ℹ️' });
        router.push('/admin/news');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || roleLoading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang di panel admin website desa
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Berita"
            value={stats?.content_stats.total_news || 0}
            icon={<Newspaper className="h-6 w-6" />}
            color="blue"
            link="/admin/news"
          />
          <StatCard
            title="Aparatur Desa"
            value={stats?.content_stats.total_officials || 0}
            icon={<Users className="h-6 w-6" />}
            color="green"
            link="/admin/officials"
          />
          <StatCard
            title="Potensi Desa"
            value={stats?.content_stats.total_potentials || 0}
            icon={<TrendingUp className="h-6 w-6" />}
            color="purple"
            link="/admin/potentials"
          />
          <StatCard
            title="Layanan"
            value={stats?.content_stats.total_services || 0}
            icon={<FileText className="h-6 w-6" />}
            color="orange"
            link="/admin/services"
          />
        </div>

        {/* Analytics Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistik Kunjungan Website
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalyticsCard
              title="Hari Ini"
              views={stats?.analytics.today_views || 0}
              visitors={stats?.analytics.today_visitors || 0}
            />
            <AnalyticsCard
              title="7 Hari Terakhir"
              views={stats?.analytics.week_views || 0}
              visitors={stats?.analytics.week_visitors || 0}
            />
            <AnalyticsCard
              title="30 Hari Terakhir"
              views={stats?.analytics.month_views || 0}
              visitors={stats?.analytics.month_visitors || 0}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent News */}
          <RecentNewsSection news={stats?.recent_news || []} />

          {/* Recent Contacts */}
          <RecentContactsSection
            contacts={stats?.recent_contacts || []}
            unreadCount={stats?.content_stats.unread_contacts || 0}
          />
        </div>

        {/* Popular Pages */}
        {stats?.popular_pages && stats.popular_pages.length > 0 && (
          <PopularPagesSection pages={stats.popular_pages} />
        )}

        {/* Quick Actions */}
        <QuickActionsSection />

        {/* System Information */}
        {stats?.system_info && <SystemInfoSection systemInfo={stats.system_info} />}
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  link?: string;
}

function StatCard({ title, value, icon, color, link }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50',
  };

  const [bgColor, textColor, bgLight] = colorClasses[color].split(' ');

  const content = (
    <div
      className={`${bgLight} rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${bgColor} ${textColor} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

// Analytics Card Component
interface AnalyticsCardProps {
  title: string;
  views: number;
  visitors: number;
}

function AnalyticsCard({ title, views, visitors }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Total Views</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">{views}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">Unique Visitors</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {visitors}
          </span>
        </div>
      </div>
    </div>
  );
}

// Recent News Section
interface RecentNewsSectionProps {
  news: any[];
}

function RecentNewsSection({ news }: RecentNewsSectionProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Berita Terbaru
        </h2>
        <Link
          href="/admin/news"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Lihat Semua
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-8">
          <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">Belum ada berita</p>
          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Berita Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/admin/news/edit/${item.id}`)}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {item.image_url ? (
                <img
                  src={getMediaUrl(item.image_url)}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString('id-ID')
                    : 'Draft'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Recent Contacts Section
interface RecentContactsSectionProps {
  contacts: any[];
  unreadCount: number;
}

function RecentContactsSection({
  contacts,
  unreadCount,
}: RecentContactsSectionProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pesan Kontak Terbaru
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        <Link
          href="/admin/contacts"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Lihat Semua
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada pesan kontak</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => router.push('/admin/contacts')}
              className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800">{contact.name}</h3>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {contact.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(contact.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Popular Pages Section
interface PopularPagesSectionProps {
  pages: any[];
}

function PopularPagesSection({ pages }: PopularPagesSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Halaman Populer (30 Hari Terakhir)
      </h2>
      <div className="space-y-3">
        {pages.map((page, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg font-bold text-gray-400">
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {page.page_title || page.page_url}
                </p>
                <p className="text-sm text-gray-500 truncate">{page.page_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Eye className="h-4 w-4" />
              <span className="font-semibold">{page.view_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Section
function QuickActionsSection() {
  const actions = [
    {
      title: 'Tambah Berita',
      description: 'Buat berita baru',
      icon: <Plus className="h-6 w-6" />,
      href: '/admin/news/create',
      color: 'blue',
    },
    {
      title: 'Tambah Aparatur',
      description: 'Tambah aparatur desa',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/officials/create',
      color: 'green',
    },
    {
      title: 'Kelola Settings',
      description: 'Pengaturan website',
      icon: <Settings className="h-6 w-6" />,
      href: '/admin/settings',
      color: 'purple',
    },
    {
      title: 'Hero Slider',
      description: 'Kelola slider homepage',
      icon: <ImageIcon className="h-6 w-6" />,
      href: '/admin/hero-sliders',
      color: 'orange',
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors mb-3">
                {action.icon}
              </div>
              <h3 className="font-medium text-gray-800 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// System Info Section
interface SystemInfoSectionProps {
  systemInfo: {
    last_login?: string;
    current_user: string;
    current_role: string;
    app_version: string;
    database_status: string;
  };
}

function SystemInfoSection({ systemInfo }: SystemInfoSectionProps) {
  const roleDisplay = {
    superadmin: 'Super Administrator',
    admin: 'Administrator',
    author: 'Author',
  }[systemInfo.current_role] || systemInfo.current_role;

  const dbStatusColor = systemInfo.database_status === 'connected' 
    ? 'text-green-600' 
    : 'text-red-600';

  const dbStatusIcon = systemInfo.database_status === 'connected' 
    ? '●' 
    : '○';

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Informasi Sistem
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Pengguna Aktif</p>
          <p className="text-lg font-semibold text-gray-800">{systemInfo.current_user}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Role</p>
          <p className="text-lg font-semibold text-gray-800">{roleDisplay}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Versi Aplikasi</p>
          <p className="text-lg font-semibold text-gray-800">v{systemInfo.app_version}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Status Database</p>
          <p className={`text-lg font-semibold ${dbStatusColor} flex items-center gap-1`}>
            <span>{dbStatusIcon}</span>
            <span className="capitalize">{systemInfo.database_status}</span>
          </p>
        </div>
      </div>
      {systemInfo.last_login && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Login terakhir:{' '}
            <span className="font-medium text-gray-800">
              {new Date(systemInfo.last_login).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
