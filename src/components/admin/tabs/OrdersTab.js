'use client';

import { ShoppingBag, ArrowUp, ArrowDown, ArrowUpDown, FileSpreadsheet } from 'lucide-react';
import AdminDropdown from '../shared/AdminDropdown';

export default function OrdersTab({
  orders,
  users,
  searchQuery,
  orderFilterStatus,
  orderFilterProduct,
  orderFilterType,
  orderFilterDateRange,
  orderSortBy,
  setOrderSortBy,
  setSelectedUser
}) {
  const processedOrders = orders.filter(order => {
    // 1. Search Query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query) ||
      order.product?.title?.toLowerCase().includes(query)
    );
    
    // 2. Payment Status filter
    const matchesStatus = !orderFilterStatus || order.paymentStatus === orderFilterStatus;
    
    // 3. Product filter
    const matchesProduct = !orderFilterProduct || order.productId === orderFilterProduct;

    // 4. Sales/Payment Type filter
    let matchesType = true;
    if (orderFilterType === 'pos') {
      matchesType = order.paymentId !== 'MANUAL_GRANT_BY_ADMIN';
    } else if (orderFilterType === 'manual') {
      matchesType = order.paymentId === 'MANUAL_GRANT_BY_ADMIN';
    }

    // 5. Date Range filter
    let matchesDate = true;
    if (orderFilterDateRange) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (orderFilterDateRange === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (orderFilterDateRange === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (orderFilterDateRange === 'month') {
        matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesProduct && matchesType && matchesDate;
  });
  
  // Sorting
  processedOrders.sort((a, b) => {
    if (orderSortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (orderSortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (orderSortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (orderSortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    if (orderSortBy === 'name-asc') {
      return (a.user?.name || '').localeCompare(b.user?.name || '', 'tr');
    }
    if (orderSortBy === 'name-desc') {
      return (b.user?.name || '').localeCompare(a.user?.name || '', 'tr');
    }
    if (orderSortBy === 'product-asc') {
      return (a.product?.title || '').localeCompare(b.product?.title || '', 'tr');
    }
    if (orderSortBy === 'product-desc') {
      return (b.product?.title || '').localeCompare(a.product?.title || '', 'tr');
    }
    return 0;
  });

  // Flawless HTML-based XLS export preserving Turkish characters and formatting
  const handleExportToExcel = () => {
    const headers = ['Sipariş ID', 'Öğrenci Adı', 'E-Posta', 'Satın Alınan Ürün', 'Format/Tip', 'Tarih', 'Ödeme Durumu', 'Tutar'];
    
    const tableRows = processedOrders.map(order => {
      const orderId = `#${order.id.slice(-6).toUpperCase()}`;
      const name = order.user?.name || 'İsimsiz Kullanıcı';
      const email = order.user?.email || '-';
      const productTitle = order.product?.title || '-';
      const productType = order.product?.type || '-';
      const dateText = new Date(order.createdAt).toLocaleString('tr-TR');
      const statusText = order.paymentStatus === 'SUCCESS' ? 'BAŞARILI' : 'BAŞARISIZ';
      const amountText = `${order.amount.toLocaleString('tr-TR')} ₺`;
      
      return `<tr>
        <td>${orderId}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${productTitle}</td>
        <td>${productType}</td>
        <td>${dateText}</td>
        <td>${statusText}</td>
        <td>${amountText}</td>
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
                <x:Name>SiparisRaporu</x:Name>
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
    link.setAttribute('download', `derece_uzem_siparis_raporu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Action Bar */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 px-6 py-4 rounded-3xl shadow-sm">
        <div className="text-xs font-bold text-slate-500">
          Bulunan Kayıt: <span className="text-slate-800 font-extrabold">{processedOrders.length} sipariş</span>
        </div>
        {processedOrders.length > 0 && (
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
        {processedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  <th 
                    onClick={() => setOrderSortBy(orderSortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Öğrenci / Alıcı</span>
                      {orderSortBy === 'name-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : orderSortBy === 'name-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => setOrderSortBy(orderSortBy === 'product-asc' ? 'product-desc' : 'product-asc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Satın Alınan Ürün</span>
                      {orderSortBy === 'product-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : orderSortBy === 'product-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => setOrderSortBy(orderSortBy === 'newest' ? 'oldest' : 'newest')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tarih</span>
                      {orderSortBy === 'newest' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : orderSortBy === 'oldest' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-3">Ödeme Durumu</th>
                  <th 
                    onClick={() => setOrderSortBy(orderSortBy === 'amount-desc' ? 'amount-asc' : 'amount-desc')}
                    className="py-4 px-3 cursor-pointer hover:text-slate-800 hover:bg-slate-100/50 transition-all select-none group text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tutar</span>
                      {orderSortBy === 'amount-desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : orderSortBy === 'amount-asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => {
                          const targetUser = users.find(u => u.id === order.userId || u.email === order.user?.email);
                          setSelectedUser(targetUser || order.user);
                        }}
                        className="font-bold text-slate-800 text-xs hover:text-indigo-600 hover:underline transition-colors text-left focus:outline-none block"
                      >
                        {order.user?.name || 'İsimsiz Kullanıcı'}
                      </button>
                      <div className="text-[10px] text-slate-400 font-medium">{order.user?.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-700 text-xs line-clamp-1">{order.product?.title}</div>
                      <span className="text-[9px] font-bold text-slate-550 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mt-0.5 inline-block whitespace-nowrap">
                        {order.product?.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        order.paymentStatus === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-650 border-red-100'
                      }`}>
                        {order.paymentStatus === 'SUCCESS' ? 'BAŞARILI' : 'BAŞARISIZ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs">{order.amount.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Henüz Sipariş Kaydı Bulunmuyor</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Öğrenciler satın alım yaptığında kayıtlar burada belirecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
