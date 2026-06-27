'use client';

import { useState } from 'react';
import { Trash, ArrowUp, ArrowDown, ArrowUpDown, FileSpreadsheet } from 'lucide-react';
import AdminDropdown from '../shared/AdminDropdown';

export default function StudentsTab({
  users,
  searchQuery,
  currentAdminId,
  handleToggleUserRole,
  handleDeleteUser,
  setSelectedUser
}) {
  const [studentSortBy, setStudentSortBy] = useState('newest'); // 'name-asc', 'name-desc', 'email-asc', 'email-desc', 'newest', 'oldest', 'orders-desc', 'orders-asc'
  const [roleFilter, setRoleFilter] = useState(''); // '' (All), 'ADMIN', 'USER'
  const [enrollmentFilter, setEnrollmentFilter] = useState(''); // '' (All), 'enrolled', 'not-enrolled'

  const filteredUsers = users.filter(item => {
    // 1. Search Query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      item.name?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query) ||
      item.district?.toLowerCase().includes(query)
    );

    // 2. Role filter
    const matchesRole = !roleFilter || item.role === roleFilter;

    // 3. Enrollment status filter
    const orderCount = item._count?.orders || 0;
    let matchesEnrollment = true;
    if (enrollmentFilter === 'enrolled') {
      matchesEnrollment = orderCount > 0;
    } else if (enrollmentFilter === 'not-enrolled') {
      matchesEnrollment = orderCount === 0;
    }

    return matchesSearch && matchesRole && matchesEnrollment;
  });

  // Sort users
  const sortedUsers = [...filteredUsers];
  sortedUsers.sort((a, b) => {
    if (studentSortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '', 'tr');
    }
    if (studentSortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '', 'tr');
    }
    if (studentSortBy === 'email-asc') {
      return (a.email || '').localeCompare(b.email || '', 'tr');
    }
    if (studentSortBy === 'email-desc') {
      return (b.email || '').localeCompare(a.email || '', 'tr');
    }
    if (studentSortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (studentSortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (studentSortBy === 'orders-desc') {
      return (b._count?.orders || 0) - (a._count?.orders || 0);
    }
    if (studentSortBy === 'orders-asc') {
      return (a._count?.orders || 0) - (b._count?.orders || 0);
    }
    return 0;
  });

  // Flawless HTML-based XLS export preserving Turkish characters and formatting
  const handleExportToExcel = () => {
    const headers = ['Ad Soyad', 'E-Posta', 'Telefon', 'İl', 'İlçe', 'Kayıt Tarihi', 'Rol', 'Eğitim Sayısı'];
    
    const tableRows = sortedUsers.map(item => {
      const name = item.name || 'Girilmemiş';
      const email = item.email || '-';
      const phone = item.phone || '-';
      const city = item.city || '-';
      const district = item.district || '-';
      const dateText = new Date(item.createdAt).toLocaleDateString('tr-TR');
      const roleText = item.role === 'ADMIN' ? 'YÖNETİCİ' : 'ÖĞRENCİ';
      const ordersCount = item._count?.orders || 0;
      
      return `<tr>
        <td>${name}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${city}</td>
        <td>${district}</td>
        <td>${dateText}</td>
        <td>${roleText}</td>
        <td>${ordersCount}</td>
      </tr>`;
    }).join('\n');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>OgrenciListesi</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
          th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; color: #334155; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `derece_uzem_ogrenci_raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Action Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-slate-200/80 px-6 py-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="text-xs font-bold text-slate-500 mr-2">
            Bulunan Kayıt: <span className="text-slate-800 font-extrabold">{sortedUsers.length} kişi</span>
          </div>
          
          {/* Custom Dropdown Filters */}
          <AdminDropdown
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Rol: Tümü"
            className="w-[140px]"
            options={[
              { value: '', label: 'Rol: Tümü' },
              { value: 'USER', label: 'Öğrenci' },
              { value: 'ADMIN', label: 'Yönetici' }
            ]}
          />

          <AdminDropdown
            value={enrollmentFilter}
            onChange={setEnrollmentFilter}
            placeholder="Eğitim Durumu: Tümü"
            className="w-[170px]"
            options={[
              { value: '', label: 'Eğitim Durumu: Tümü' },
              { value: 'enrolled', label: 'Eğitimi Var' },
              { value: 'not-enrolled', label: 'Eğitimi Yok' }
            ]}
          />
        </div>
        
        {sortedUsers.length > 0 && (
          <button
            type="button"
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer hover:shadow-emerald-500/20 active:scale-95 animate-fade-in"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Excel ile İndir</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {sortedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  <th 
                    onClick={() => setStudentSortBy(studentSortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Ad Soyad</span>
                      {studentSortBy === 'name-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : studentSortBy === 'name-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => setStudentSortBy(studentSortBy === 'email-asc' ? 'email-desc' : 'email-asc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>E-Posta</span>
                      {studentSortBy === 'email-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : studentSortBy === 'email-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-3">Telefon</th>
                  <th className="py-4 px-3">Konum (İl/İlçe)</th>
                  <th 
                    onClick={() => setStudentSortBy(studentSortBy === 'newest' ? 'oldest' : 'newest')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Kayıt Tarihi</span>
                      {studentSortBy === 'newest' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : studentSortBy === 'oldest' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-3">Rol / Yetki</th>
                  <th 
                    onClick={() => setStudentSortBy(studentSortBy === 'orders-desc' ? 'orders-asc' : 'orders-desc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Eğitim Sayısı</span>
                      {studentSortBy === 'orders-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : studentSortBy === 'orders-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-3 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedUser(item)}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                    title="Öğrenci Detaylarını Göster"
                  >
                    <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-1.5 hover:text-amber-500 transition-colors whitespace-nowrap text-xs">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-650 font-bold shrink-0">
                        {item.name?.substring(0, 2).toUpperCase() || 'ÖG'}
                      </div>
                      <span>{item.name || 'Girilmemiş'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium select-all text-xs truncate max-w-[140px]" onClick={(e) => e.stopPropagation()} title={item.email}>{item.email}</td>
                    <td className="py-3 px-3 text-slate-650 font-semibold select-all text-xs whitespace-nowrap" onClick={(e) => e.stopPropagation()}>{item.phone || '-'}</td>
                    <td className="py-3 px-3 text-slate-550 font-medium text-xs whitespace-nowrap truncate max-w-[120px]" onClick={(e) => e.stopPropagation()} title={item.city ? `${item.district ? item.district + ', ' : ''}${item.city}` : ''}>
                      {item.city ? `${item.district ? item.district + ', ' : ''}${item.city}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-550 text-xs whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        item.role === 'ADMIN' 
                          ? 'bg-red-50 text-red-650 border-red-100' 
                          : 'bg-blue-50 text-blue-650 border-blue-100'
                      }`}>
                        {item.role === 'ADMIN' ? 'YÖNETİCİ' : 'ÖĞRENCİ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-850 font-bold text-xs text-center">{item._count?.orders || 0}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleUserRole(item.id, item.role)}
                          disabled={item.id === currentAdminId}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-30 whitespace-nowrap"
                        >
                          {item.role === 'ADMIN' ? 'Öğrenci Yap' : 'Admin Yap'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(item.id)}
                          disabled={item.id === currentAdminId}
                          className="p-1 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-30"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">Kayıtlı kullanıcı bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
