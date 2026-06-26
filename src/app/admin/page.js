'use client';

import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pt-24 pb-16 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Yönetici Paneli Yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminDashboard />;
}
