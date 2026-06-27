'use client';

import { Gift, Trash } from 'lucide-react';

export default function CouponsTab({
  coupons,
  products,
  searchQuery,
  handleToggleCouponStatus,
  handleDeleteCoupon
}) {
  const filteredCoupons = coupons.filter(coupon => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return coupon.code?.toLowerCase().includes(query);
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
      {filteredCoupons.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                <th className="py-4 px-3">Kupon Kodu</th>
                <th className="py-4 px-3">İndirim Miktarı</th>
                <th className="py-4 px-3">Limitler</th>
                <th className="py-4 px-3">Son Kullanma</th>
                <th className="py-4 px-3">Durum</th>
                <th className="py-4 px-3 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                  <td className="py-3 px-3">
                    <div className="font-mono font-black text-amber-600 tracking-wider text-xs">{coupon.code}</div>
                    {coupon.productIds && coupon.productIds.length > 0 ? (
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[150px]" title={coupon.productIds.map(id => products.find(p => p.id === id)?.title || 'Bilinmeyen Ürün').join(', ')}>
                        Geçerli Ürünler: {coupon.productIds.map(id => products.find(p => p.id === id)?.title || 'Bilinmeyen Ürün').join(', ')}
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">
                        Tüm Ürünlerde Geçerli (Global)
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-black text-slate-800 text-xs">
                      {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `${coupon.discountValue.toLocaleString('tr-TR')} ₺`}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-550 font-medium text-xs whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>Kullanım: {coupon.uses} / {coupon.maxUses || '∞'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-550 text-xs whitespace-nowrap">
                    {coupon.expiryDate ? (
                      new Date(coupon.expiryDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                    ) : (
                      <span className="text-slate-400 font-medium">Sınırsız</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      coupon.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {coupon.isActive ? 'AKTİF' : 'PASİF'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex justify-end gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleCouponStatus(coupon.id, coupon.isActive)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                          coupon.isActive
                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {coupon.isActive ? 'Pasife Al' : 'Aktife Al'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
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
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <Gift className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Aktif Kupon Kodu Bulunmuyor</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Yeni Kupon Ekle butonuna basarak indirim kodları üretebilirsiniz.</p>
        </div>
      )}
    </div>
  );
}
