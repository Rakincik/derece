'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowUp, ArrowDown, ArrowUpDown, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminDropdown from '../shared/AdminDropdown';

export default function OrdersTab({
  orders,
  users,
  searchQuery,
  orderFilterStatus,
  orderFilterProduct,
  orderFilterType,
  orderFilterStartDate,
  orderFilterEndDate,
  orderSortBy,
  setOrderSortBy,
  setSelectedUser
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, orderFilterStatus, orderFilterProduct, orderFilterType, orderFilterStartDate, orderFilterEndDate]);
  const processedOrders = orders.filter(order => {
    // 1. Search Query filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query) ||
      order.product?.title?.toLowerCase().includes(query)
    );
    
    // 2. Payment Status filter
    let matchesStatus = true;
    if (orderFilterStatus) {
      if (orderFilterStatus === 'ABANDONED') {
        const isAbandoned = order.paymentStatus === 'PENDING' && (new Date() - new Date(order.createdAt)) > 5 * 60 * 1000;
        matchesStatus = isAbandoned;
      } else if (orderFilterStatus === 'PENDING') {
        const isAbandoned = order.paymentStatus === 'PENDING' && (new Date() - new Date(order.createdAt)) > 5 * 60 * 1000;
        matchesStatus = order.paymentStatus === 'PENDING' && !isAbandoned;
      } else {
        matchesStatus = order.paymentStatus === orderFilterStatus;
      }
    }
    
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
    if (orderFilterStartDate || orderFilterEndDate) {
      const orderDate = new Date(order.createdAt);
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      
      if (orderFilterStartDate) {
        const [year, month, day] = orderFilterStartDate.split('-');
        const startOnly = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (orderDateOnly.getTime() < startOnly.getTime()) matchesDate = false;
      }
      
      if (orderFilterEndDate) {
        const [year, month, day] = orderFilterEndDate.split('-');
        const endOnly = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (orderDateOnly.getTime() > endOnly.getTime()) matchesDate = false;
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

  // Pagination calculation
  const totalItems = processedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Safeguard currentPage
  const activePage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = processedOrders.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);

      if (activePage <= 2) {
        end = 3;
      }
      if (activePage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

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
      const statusText = order.paymentStatus === 'SUCCESS' ? 'BAŞARILI' : (order.paymentStatus === 'FAILED' ? 'BAŞARISIZ' : (order.paymentStatus === 'PENDING' && (new Date() - new Date(order.createdAt)) > 5 * 60 * 1000 ? 'TERK EDİLDİ' : 'BEKLİYOR'));
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
          <>
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
                {paginatedOrders.map((order) => (
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="text-[10px] text-slate-400 font-medium">{order.user?.email}</div>
                        {order.user?.phone && (
                          <a 
                            href={`https://wa.me/90${order.user.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                              order.paymentStatus === 'SUCCESS' 
                                ? `Merhaba ${order.user.name?.split(' ')[0] || 'Öğrencimiz'}, DereceUZEM'den yazıyorum. "${order.product?.title || 'Eğitim'}" kaydın başarıyla onaylandı, aramıza hoş geldin! 🚀`
                                : `Merhaba ${order.user.name?.split(' ')[0] || 'Öğrencimiz'}, DereceUZEM'den yazıyorum. "${order.product?.title || 'Eğitim'}" için işlemin yarım kalmış görünüyor, yardımcı olabileceğim bir konu var mı?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-0.5 rounded transition-transform hover:scale-110 text-[#25D366] bg-green-50"
                            title="WhatsApp'tan Mesaj Gönder"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          </a>
                        )}
                      </div>
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
                      {(() => {
                        const isAbandoned = order.paymentStatus === 'PENDING' && (new Date() - new Date(order.createdAt)) > 5 * 60 * 1000;
                        let statusText = 'BEKLİYOR';
                        let badgeClass = 'bg-amber-50 text-amber-600 border-amber-100';
                        
                        if (order.paymentStatus === 'SUCCESS') {
                          statusText = 'BAŞARILI';
                          badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                        } else if (order.paymentStatus === 'FAILED') {
                          statusText = 'BAŞARISIZ';
                          badgeClass = 'bg-red-50 text-red-600 border-red-100';
                        } else if (isAbandoned) {
                          statusText = 'TERK EDİLDİ';
                          badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                        }

                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {statusText}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs">{order.amount.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {processedOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-t border-slate-100 px-6 py-4 text-sm font-medium text-slate-500">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Sayfa Başı Gösterim:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer text-slate-800 font-extrabold"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <span>
                  {processedOrders.length} siparişten {startIndex + 1}-{Math.min(endIndex, processedOrders.length)} arası gösteriliyor
                </span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 select-none">
                  <button
                    type="button"
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          activePage === page
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          </>
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
