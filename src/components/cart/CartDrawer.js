'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Check, AlertCircle } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import Button from '@/components/ui/Button';

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
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isAuthAlertOpen, setIsAuthAlertOpen] = useState(false);

  // Installments States
  const [isCheckingBin, setIsCheckingBin] = useState(false);
  const [installments, setInstallments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [lastFetchedBin, setLastFetchedBin] = useState('');

  // Fetch installments when card BIN (first 6 digits) is typed
  const cleanCardNumber = cardNumber.replace(/\s+/g, '');
  const currentBin = cleanCardNumber.substring(0, 6);

  useEffect(() => {
    if (cleanCardNumber.length < 6) {
      if (installments.length > 0) {
        setInstallments([]);
        setSelectedInstallment(null);
        setLastFetchedBin('');
      }
      return;
    }

    if (currentBin.length === 6 && currentBin !== lastFetchedBin) {
      const fetchInstallments = async () => {
        setIsCheckingBin(true);
        try {
          const totalAmount = getTotal();
          const res = await fetch(`/api/checkout/installments?bin=${currentBin}&amount=${totalAmount}`);
          if (res.ok) {
            const data = await res.json();
            setInstallments(data.installments || []);
            // Default select single payment (count === 1)
            const single = data.installments?.find(i => i.count === 1);
            setSelectedInstallment(single || data.installments?.[0] || null);
          } else {
            setInstallments([]);
            setSelectedInstallment(null);
          }
        } catch (err) {
          console.error(err);
          setInstallments([]);
          setSelectedInstallment(null);
        } finally {
          setIsCheckingBin(false);
        }
      };

      setLastFetchedBin(currentBin);
      fetchInstallments();
    }
  }, [cleanCardNumber, currentBin, lastFetchedBin, getTotal, installments.length]);

  const getCardStyle = () => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    const firstDigit = cleanNum.substring(0, 1);
    const firstFour = cleanNum.substring(0, 4);

    if (firstDigit === '4') {
      return {
        brand: 'Visa',
        gradient: 'from-indigo-650 via-blue-700 to-slate-950 bg-indigo-900',
        textColor: 'text-blue-100',
        glowColor: 'bg-blue-500/10'
      };
    } else if (firstDigit === '5') {
      return {
        brand: 'Mastercard',
        gradient: 'from-orange-600 via-red-700 to-slate-950 bg-orange-900',
        textColor: 'text-orange-100',
        glowColor: 'bg-orange-500/10'
      };
    } else if (firstDigit === '9' || firstFour === '9792') {
      return {
        brand: 'Troy',
        gradient: 'from-amber-600 via-yellow-700 to-slate-950 bg-amber-900',
        textColor: 'text-amber-100',
        glowColor: 'bg-amber-500/10'
      };
    } else if (firstDigit === '3') {
      return {
        brand: 'Amex',
        gradient: 'from-teal-600 via-emerald-700 to-slate-950 bg-teal-900',
        textColor: 'text-teal-100',
        glowColor: 'bg-teal-500/10'
      };
    } else {
      return {
        brand: 'Kredi Kartı',
        gradient: 'from-slate-800 via-slate-900 to-slate-950 bg-slate-900',
        textColor: 'text-slate-200',
        glowColor: 'bg-indigo-500/5'
      };
    }
  };

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
    
    if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
      setCheckoutError('Lütfen tüm kart alanlarını doldurun.');
      setIsProcessing(false);
      return;
    }
    
    try {
      const expiryParts = cardExpiry.split('/');
      const expiryMonth = expiryParts[0] ? parseInt(expiryParts[0], 10) : '';
      const expiryYear = expiryParts[1] ? parseInt(expiryParts[1], 10) : '';

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ id: item.id })),
          couponCode: couponCode,
          cardName: cardHolder,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          cvv: parseInt(cardCvv, 10),
          installmentCount: selectedInstallment ? selectedInstallment.count : 1
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data['3dForm']) {
          // If we received a 3D Secure redirect form, write it to document and submit it
          const div = document.createElement('div');
          div.innerHTML = data['3dForm'];
          document.body.appendChild(div);
          const form = div.querySelector('form');
          if (form) {
            form.submit();
          }
          return;
        }

        setCheckoutSuccess(true);
        setTimeout(() => {
          clearCart();
          setIsCheckoutModalOpen(false);
          setCheckoutSuccess(false);
          closeCart();
          // Clear inputs
          setCardHolder('');
          setCardNumber('');
          setCardExpiry('');
          setCardCvv('');
          // Redirect to account dashboard
          window.location.href = '/hesabim';
        }, 2000);
      } else {
        setCheckoutError(data.error || 'Ödeme tamamlanamadı.');
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
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
                        ₺{getSubtotal().toFixed(2)}
                      </span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Kupon İndirimi (%{couponDiscount})</span>
                        <span className="text-emerald-600 font-mono">
                          -₺{getDiscount().toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200">
                      <span className="text-slate-900">Toplam</span>
                      <span className="text-accent-600 font-mono text-lg">
                        ₺{getTotal().toFixed(2)}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-[1.5rem] shadow-2xl relative text-slate-100 flex flex-col gap-3 sm:gap-4 max-h-[calc(100vh-2rem)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="pr-8">
                <h3 className="text-sm sm:text-base font-black text-white">Güvenli Kredi / Banka Kartı Ödemesi</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight">Param POS altyapısı ile 3D Secure güvencesiyle ödeyin.</p>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto pr-1 -mr-2 custom-scrollbar space-y-3 sm:space-y-4">
                {checkoutSuccess ? (
                  <div className="py-6 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                      <Check className="w-7 h-7" strokeWidth={3} />
                    </div>
                    <h4 className="text-base font-bold text-emerald-400">Ödeme Başarılı!</h4>
                    <p className="text-xs text-slate-400">Eğitimleriniz hesabınıza tanımlandı. Yönlendiriliyorsunuz...</p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessCheckout} className="space-y-3 sm:space-y-4">
                    {/* Real-time Mock Card Graphic */}
                    {(() => {
                      const cardStyle = getCardStyle();
                      return (
                        <div className={`aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br ${cardStyle.gradient} p-4 sm:p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/10 transition-all duration-500`}>
                          <div className="absolute -right-6 -top-6 w-24 h-24 sm:w-28 sm:h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
                          <div className={`absolute -left-10 -bottom-10 w-28 h-28 sm:w-32 sm:h-32 ${cardStyle.glowColor} rounded-full blur-3xl pointer-events-none`} />
                          
                          <div className="flex justify-between items-start relative z-10">
                            {/* Gold Chip simulation */}
                            <div className="w-8 h-6 sm:w-9 sm:h-7 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 rounded-md border border-amber-300/40 relative overflow-hidden shadow-inner flex flex-col justify-between p-0.5 sm:p-1">
                              <div className="w-full h-px bg-slate-900/10" />
                              <div className="w-full h-px bg-slate-900/10" />
                              <div className="w-full h-px bg-slate-900/10" />
                            </div>
                            
                            {/* Card Brand Badge */}
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                              {cardStyle.brand}
                            </span>
                          </div>

                          <div className="text-white text-sm sm:text-base md:text-lg font-mono tracking-widest my-2 sm:my-3 pl-1 drop-shadow-md">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end text-[10px] sm:text-xs uppercase tracking-wider text-white/70 relative z-10">
                            <div className="min-w-0">
                              <div className="text-[7px] sm:text-[8px] text-white/40 font-bold uppercase tracking-widest">KART SAHİBİ</div>
                              <div className="font-bold text-white tracking-wide truncate max-w-[120px] sm:max-w-[150px]">{cardHolder || 'AD SOYAD'}</div>
                            </div>
                            <div className="flex gap-3 sm:gap-4 shrink-0 text-right">
                              <div>
                                <div className="text-[7px] sm:text-[8px] text-white/40 font-bold uppercase tracking-widest">SKT</div>
                                <div className="font-bold text-white font-mono">{cardExpiry || 'AA/YY'}</div>
                              </div>
                              <div>
                                <div className="text-[7px] sm:text-[8px] text-white/40 font-bold uppercase tracking-widest">CVV</div>
                                <div className="font-bold text-white font-mono">{cardCvv ? '•'.repeat(cardCvv.length) : '•••'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Error Message */}
                    {checkoutError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-2.5 sm:space-y-3">
                      <div>
                        <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 pl-1">KART SAHİBİ ADI</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="AHMET YILMAZ"
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl text-white font-medium placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 pl-1">KART NUMARASI</label>
                        <input
                          type="text"
                          required
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 16) val = val.substring(0, 16);
                            let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setCardNumber(formatted);
                          }}
                          placeholder="4000 1234 5678 9010"
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs sm:text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 pl-1">SON KULLANMA</label>
                          <input
                            type="text"
                            required
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => {
                              const raw = e.target.value;
                              let val = raw.replace(/\D/g, '');
                              if (val.length > 4) val = val.substring(0, 4);
                              
                              if (e.nativeEvent.inputType === 'deleteContentBackward') {
                                if (val.length > 2) {
                                  setCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
                                } else {
                                  setCardExpiry(val);
                                }
                              } else {
                                if (val.length >= 2) {
                                  setCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
                                } else {
                                  setCardExpiry(val);
                                }
                              }
                            }}
                            placeholder="12/28"
                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 pl-1">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123"
                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Installment Options Grid */}
                    {isCheckingBin && (
                      <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>Taksit seçenekleri sorgulanıyor...</span>
                      </div>
                    )}

                    {!isCheckingBin && installments.length > 0 && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">TAKSİT SEÇENEKLERİ</label>
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 divide-y divide-slate-800/60 text-[11px] sm:text-xs max-h-[140px] overflow-y-auto custom-scrollbar">
                          {installments.map((inst) => (
                            <label
                              key={inst.count}
                              className={`flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer transition-colors ${
                                selectedInstallment?.count === inst.count
                                  ? 'bg-indigo-500/10 text-white font-semibold'
                                  : 'text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <input
                                  type="radio"
                                  name="installment"
                                  checked={selectedInstallment?.count === inst.count}
                                  onChange={() => setSelectedInstallment(inst)}
                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 border-slate-700 bg-slate-900 focus:ring-indigo-500"
                                />
                                <span>
                                  {inst.count === 1 ? 'Tek Çekim' : `${inst.count} Taksit`}
                                </span>
                              </div>
                              <div className="text-right font-mono">
                                <div className="font-bold text-slate-200">
                                  {inst.count === 1 
                                    ? `₺${inst.total.toFixed(2)}` 
                                    : `${inst.count} x ₺${inst.monthlyPayment.toFixed(2)}`
                                  }
                                </div>
                                {inst.count > 1 && inst.rate > 0 && (
                                  <div className="text-[8px] sm:text-[9px] text-slate-500">
                                    Toplam: ₺{inst.total.toFixed(2)} (%{inst.rate.toFixed(2)} komisyon)
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total & Submit */}
                    <div className="border-t border-slate-800 pt-2.5 sm:pt-3 mt-2 sm:mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">TOPLAM TUTAR</span>
                        <span className="text-base sm:text-lg font-mono font-black text-indigo-400">
                          ₺{selectedInstallment ? selectedInstallment.total.toFixed(2) : getTotal().toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-4 sm:px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 text-xs sm:text-sm"
                      >
                        {isProcessing ? 'İşlem yapılıyor...' : 'Ödemeyi Tamamla'}
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
