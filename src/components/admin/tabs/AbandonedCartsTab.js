'use client';

import { useState } from 'react';
import { ShoppingCart, Phone, Mail, Clock } from 'lucide-react';

export default function AbandonedCartsTab({ abandonedCarts = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCarts = abandonedCarts.filter(cart => {
    const query = searchQuery.toLowerCase().trim();
    return !query || (
      cart.user.name?.toLowerCase().includes(query) ||
      cart.user.email?.toLowerCase().includes(query) ||
      cart.user.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-slate-200/80 px-6 py-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="text-xs font-bold text-slate-500 mr-2">
            Bulunan Terkedilmiş Sepet: <span className="text-slate-800 font-extrabold">{filteredCarts.length}</span>
          </div>
          <input
            type="text"
            placeholder="İsim, e-posta veya telefon ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none min-w-[250px]"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {filteredCarts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                  <th className="py-4 px-4">Öğrenci Bilgileri</th>
                  <th className="py-4 px-4">Sepetteki Ürünler</th>
                  <th className="py-4 px-4">Toplam Tutar</th>
                  <th className="py-4 px-4">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 text-sm">{cart.user.name || 'İsimsiz Öğrenci'}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="select-all">{cart.user.email}</span>
                        </div>
                        {cart.user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="select-all">{cart.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-2 max-w-sm">
                        {Array.isArray(cart.items) && cart.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                            {item.coverImage ? (
                              <img src={item.coverImage} alt={item.title} className="w-10 h-12 object-cover rounded-md bg-slate-100" />
                            ) : (
                              <div className="w-10 h-12 rounded-md bg-slate-100 flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{item.quantity} adet x {(item.discountedPrice || item.price).toLocaleString('tr-TR')} ₺</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 font-black text-sm rounded-lg border border-amber-100">
                        {cart.subtotal.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{new Date(cart.updatedAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Terkedilmiş Sepet Yok</h3>
            <p className="text-slate-500 text-sm">Şu anda sepetinde ürün bırakıp bekleyen öğrenci bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
