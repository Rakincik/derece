'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Check, AlertCircle, Lock } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/productHelper';
import Link from 'next/link';


export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    getSubtotal, 
    getDiscount, 
    getTotal, 
    couponDiscount,
    couponCode,
    clearCart 
  } = useCartStore();

  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Checkout Form States
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isAuthAlertOpen, setIsAuthAlertOpen] = useState(false);

  // Cross-sell states
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Fetch Cross Sells
  useEffect(() => {
    if (items.length === 0) {
      setRecommendedProducts([]);
      return;
    }

    const fetchCrossSells = async () => {
      setIsLoadingRecommendations(true);
      try {
        const itemIds = items.map(item => item.id);
        const res = await fetch('/api/products/cross-sells', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemIds: itemIds })
        });
        
        if (res.ok) {
          const data = await res.json();
          setRecommendedProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching cross-sells:', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchCrossSells();
  }, [items]);

  // BIN tracking is no longer needed since card details are processed offsite via Shopier.

  const handleCheckoutClick = async () => {
    setIsCheckingSession(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsCheckoutModalOpen(true);
      } else {
        setIsAuthAlertOpen(true);
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('Oturum kontrolü sırasında hata oluştu.');
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleProcessCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutError('');
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ id: item.id })),
          couponCode: couponCode
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.paymentUrl) {
          // Redirect directly to the Shopier product URL
          window.location.href = data.paymentUrl;
          return;
        }
        if (data.freeCheckout) {
          setCheckoutSuccess(true);
          setTimeout(() => {
            clearCart();
            setIsCheckoutModalOpen(false);
            setCheckoutSuccess(false);
            closeCart();
            window.location.href = '/hesabim';
          }, 2000);
          return;
        }

        setCheckoutSuccess(true);
        setTimeout(() => {
          clearCart();
          setIsCheckoutModalOpen(false);
          setCheckoutSuccess(false);
          closeCart();
          window.location.href = '/hesabim';
        }, 2000);
      } else {
        setCheckoutError(data.error || 'Ödeme başlatılamadı.');
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('Sunucu bağlantısı sırasında hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-accent-500" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Sepetim
                    {items.length > 0 && (
                      <span className="text-sm text-slate-500 ml-2">
                        ({items.length} ürün)
                      </span>
                    )}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCart}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Content */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" strokeWidth={1} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Sepetiniz boş
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Harika dijital ürünlerimizi keşfetmeye başlayın!
                  </p>
                  <Button variant="primary" onClick={closeCart}>
                    Ürünleri Keşfet
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <AnimatePresence>
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </AnimatePresence>

                    {/* Cross-Sell Recommendations */}
                    {recommendedProducts.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Bunu Alanlar Şunu Da Aldı</h4>
                        <div className="space-y-3">
                          {recommendedProducts.map((product) => (
                            <div key={product.id} className="flex gap-3 bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl hover:border-amber-400/50 transition-colors">
                              <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                <img src={product.coverImage || '/placeholder.png'} alt={product.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-center min-w-0">
                                <Link href={`/urun/${product.slug}`} onClick={closeCart} className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-amber-600 transition-colors">
                                  {product.title}
                                </Link>
                                <div className="mt-1 flex items-center justify-between">
                                  <div className="font-mono text-sm font-bold text-accent-600">
                                    {formatPrice(product.discountedPrice || product.price)}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      useCartStore.getState().addItem({
                                        id: product.id,
                                        title: product.title,
                                        price: product.discountedPrice || product.price,
                                        coverImage: product.coverImage,
                                        quantity: 1
                                      });
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white rounded-lg transition-colors"
                                  >
                                    Ekle
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="px-4 pb-2">
                    <CouponInput />
                  </div>

                  {/* Summary */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ara Toplam</span>
                      <span className="text-slate-900 font-mono">
                        {formatPrice(getSubtotal())}
                      </span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Kupon İndirimi (%{couponDiscount})</span>
                        <span className="text-emerald-600 font-mono">
                          -{formatPrice(getDiscount())}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200">
                      <span className="text-slate-900">Toplam</span>
                      <span className="text-accent-600 font-mono text-lg">
                        {formatPrice(getTotal())}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      icon={ArrowRight}
                      iconPosition="right"
                      className="mt-3"
                      disabled={isCheckingSession}
                      onClick={handleCheckoutClick}
                    >
                      {isCheckingSession ? 'Kontrol ediliyor...' : 'Ödemeye Geç'}
                    </Button>

                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      Dijital ürünler anında hesabınıza tanımlanır
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Glassmorphic Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border border-slate-200 p-4 sm:p-5 rounded-[1.5rem] shadow-2xl relative text-slate-800 flex flex-col gap-3 sm:gap-4 max-h-[calc(100vh-2rem)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="pr-8">
                <h3 className="text-sm sm:text-base font-black text-slate-900">Güvenli Ödeme Aşaması</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">Shopier altyapısı ile 3D Secure güvencesiyle ödeyin.</p>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto pr-1 -mr-2 custom-scrollbar space-y-3 sm:space-y-4">
                {checkoutSuccess ? (
                  <div className="py-6 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center animate-bounce">
                      <Check className="w-7 h-7" strokeWidth={3} />
                    </div>
                    <h4 className="text-base font-bold text-emerald-500">Ödeme Başarılı!</h4>
                    <p className="text-xs text-slate-500">Eğitimleriniz hesabınıza tanımlandı. Yönlendiriliyorsunuz...</p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessCheckout} className="space-y-3 sm:space-y-4">
                    {/* Error Message */}
                    {checkoutError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    {/* Order Summary & Customer Info */}
                    {getTotal() > 0 ? (
                      <div className="space-y-3">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pl-0.5">Satın Alınacak Eğitimler</span>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                            {items.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-xs text-slate-700 font-medium pl-0.5">
                                <span className="truncate max-w-[210px]">{item.title}</span>
                                <span className="font-mono text-slate-900 shrink-0">{formatPrice(item.discountedPrice || item.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Information (Read Only) */}
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-2 text-xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pl-0.5">Öğrenci Bilgileri</span>
                          <div className="flex justify-between pl-0.5">
                            <span className="text-slate-500">Ad Soyad:</span>
                            <span className="font-semibold text-slate-800">{user?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between pl-0.5">
                            <span className="text-slate-500">E-posta:</span>
                            <span className="font-semibold text-slate-800">{user?.email || '-'}</span>
                          </div>
                          <div className="flex justify-between pl-0.5">
                            <span className="text-slate-500">Telefon:</span>
                            <span className="font-semibold text-slate-800">{user?.phone || '-'}</span>
                          </div>
                        </div>

                        {/* Secure payment notice */}
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-2.5">
                          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="text-[11px] font-bold text-slate-800">Shopier Güvenli Ödeme Geçidi</h5>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Kart bilgileriniz web sitemizde tutulmaz. 'Ödemeye İlerle' butonuna tıkladıktan sonra ödemenizi Shopier güvencesiyle 3D Secure olarak tamamlayacaksınız.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2 my-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-emerald-600">Ücretsiz İşlem</h4>
                        <p className="text-xs text-emerald-600/80">Sepetiniz 0 TL olduğu için kredi kartı bilgisi girmenize gerek yoktur. Aşağıdaki butona tıklayarak işlemi doğrudan tamamlayabilirsiniz.</p>
                      </div>
                    )}

                    {/* Total & Submit */}
                    <div className="border-t border-slate-150 pt-3 mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block">ÖDENECEK TUTAR</span>
                        <span className="text-base sm:text-lg font-mono font-black text-amber-500">
                          {formatPrice(getTotal())}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-4 sm:px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md shadow-amber-500/10 disabled:opacity-50 text-xs sm:text-sm"
                      >
                        {isProcessing ? 'Yönlendiriliyor...' : (getTotal() > 0 ? 'Ödemeye İlerle' : 'Tamamla')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Auth Alert Modal */}
      <AnimatePresence>
        {isAuthAlertOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-[2rem] shadow-2xl text-slate-800 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Giriş Yapmanız Gerekiyor</h3>
                <p className="text-sm text-slate-650 mt-2 leading-relaxed">
                  Eğitim satın alabilmek için lütfen önce giriş yapın veya kayıt olun. Hesabım sayfasına yönlendirileceksiniz.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    setIsAuthAlertOpen(false);
                    closeCart();
                    window.location.href = '/hesabim';
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all text-sm shadow-md shadow-amber-500/10"
                >
                  Giriş Yap / Kayıt Ol
                </button>
                <button
                  onClick={() => setIsAuthAlertOpen(false)}
                  className="w-full py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors text-xs border border-slate-200/60"
                >
                  Vazgeç
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
