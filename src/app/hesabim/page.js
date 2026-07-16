'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Lock, Download, Play, FileCheck, Clock, Package, LogIn, LogOut, ArrowRight, ShieldAlert, Phone, MapPin, CheckCircle2, Fingerprint, MessageSquare, CornerDownRight } from 'lucide-react';
import { turkeyCities } from '@/data/turkeyDb';

import { useRouter, useSearchParams } from 'next/navigation';
import useCartStore from '@/store/cartStore';

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowPaymentSuccess(true);
      clearCart();
    }
  }, [searchParams, clearCart]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Şifre Değiştirme State'leri
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isPwLoading, setIsPwLoading] = useState(false);

  // Destek Talepleri State'leri
  const [activeProfileTab, setActiveProfileTab] = useState('courses');
  const [supportMessages, setSupportMessages] = useState([]);
  const [isSupportLoading, setIsSupportLoading] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportError, setSupportError] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [showNewSupportForm, setShowNewSupportForm] = useState(false);

  const fetchSupportMessages = async () => {
    setIsSupportLoading(true);
    try {
      const res = await fetch('/api/student/messages');
      if (res.ok) {
        const data = await res.json();
        setSupportMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Destek mesajları yükleme hatası:', err);
    } finally {
      setIsSupportLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeProfileTab === 'support') {
      fetchSupportMessages();
    }
  }, [isLoggedIn, activeProfileTab]);

  const handleCreateSupportMessage = async (e) => {
    e.preventDefault();
    setSupportError('');
    setSupportSuccess('');
    
    const msg = supportMessage.trim();
    if (!msg) {
      setSupportError('Lütfen mesajınızı yazın.');
      return;
    }

    setIsSubmittingSupport(true);
    try {
      const res = await fetch('/api/student/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: supportSubject.trim() || 'Genel Destek',
          message: msg
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSupportSuccess('Destek talebiniz başarıyla oluşturuldu.');
        setSupportSubject('');
        setSupportMessage('');
        setShowNewSupportForm(false);
        fetchSupportMessages();
      } else {
        setSupportError(data.error || 'Destek talebi oluşturulamadı.');
      }
    } catch (err) {
      setSupportError('Bağlantı hatası oluştu.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  // Sayfa yüklendiğinde aktif oturumu kontrol et
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsLoggedIn(true);
        if (data.user?.role === 'ADMIN') {
          router.push('/admin');
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Profil yükleme hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    setDistrict('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Başarıyla giriş yapıldı!');
        setEmail('');
        setPassword('');
        // Oturum bilgilerini yenile
        await fetchProfile();
      } else {
        setError(data.error || 'Giriş yapılamadı. E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Front-end Ad ve Soyad validation
    const fName = firstName.trim();
    const lName = lastName.trim();
    if (!fName || !lName) {
      setError('Lütfen Ad ve Soyad alanlarını doldurun.');
      return;
    }
    const fullName = `${fName} ${lName}`;
    
    // Front-end TC validation check
    const tcStr = tcNo.trim();
    if (!tcStr || tcStr.length !== 11 || !/^\d+$/.test(tcStr)) {
      setError('T.C. Kimlik Numarası 11 haneli bir sayı olmalıdır.');
      return;
    }

    // Telefon Numarası Kontrolü (Başında 0 olmamalı ve 10 haneli olmalı)
    const phoneStr = phone.trim();
    const cleanPhone = phoneStr.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('0')) {
      setError('Telefon numarasının başı sıfır (0) olamaz.');
      return;
    }
    
    if (cleanPhone.length !== 10) {
      setError('Telefon numarası 10 haneli olmalıdır (örn: 5xx xxx xx xx).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName, phone: cleanPhone, city, district, tcNo: tcStr }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kayıt başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        setIsRegistering(false); // Giriş formuna yönlendir
        setFirstName('');
        setLastName('');
        setPassword('');
        setPhone('');
        setCity('');
        setDistrict('');
        setTcNo('');
      } else {
        setError(data.error || 'Kayıt işlemi başarısız.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setIsLoggedIn(false);
        setUser(null);
        setSuccess('Oturum kapatıldı.');
      }
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== newPasswordConfirm) {
      setPwError('Yeni şifreler eşleşmiyor.');
      return;
    }

    setIsPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setPwSuccess('Şifreniz başarıyla değiştirildi.');
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPwSuccess('');
        }, 2000);
      } else {
        setPwError(data.error || 'Şifre değiştirilemedi.');
      }
    } catch (err) {
      setPwError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsPwLoading(false);
    }
  };

  const actionLabels = {
    'Dijital Kitap': { label: 'İndir', icon: Download },
    'Video Ders Seti': { label: 'İzle', icon: Play },
    'Deneme Paketi': { label: 'Başla', icon: FileCheck },
    'Kombo Paket': { label: 'Eriş', icon: Play },
  };

  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Hesap bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 bg-slate-50 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                <User className="w-7 h-7 text-slate-700" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {isRegistering ? 'Hesap Oluştur' : 'Giriş Yap'}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {isRegistering 
                  ? 'DereceUzem ailesine katılarak eğitimlerinize hemen başlayın.' 
                  : 'Satın aldığınız eğitimlere erişmek için giriş yapın.'}
              </p>
            </div>

            {/* Hata ve Başarı Mesajları */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-600 text-xs font-semibold p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 text-emerald-600 text-xs font-semibold p-4 rounded-xl border border-emerald-100 mb-6"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
              {isRegistering && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                        Ad
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ahmet"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                        Soyad
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Yılmaz"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                      T.C. Kimlik Numarası
                    </label>
                    <div className="relative group">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={tcNo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // digit only validation
                          setTcNo(val);
                        }}
                        placeholder="11 haneli T.C. Kimlik No"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                      Telefon Numarası
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="5xx xxx xx xx"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                        İl
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <select
                          required
                          value={city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all cursor-pointer"
                        >
                          <option value="">İl Seçin</option>
                          {Object.keys(turkeyCities).sort((a, b) => a.localeCompare(b, 'tr')).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                        İlçe
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                        <select
                          required
                          disabled={!city}
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <option value="">İlçe Seçin</option>
                          {city && turkeyCities[city].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  E-Posta Adresi
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Şifre
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" strokeWidth={1.5} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-md font-bold overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  {isLoading ? 'İşlem yapılıyor...' : isRegistering ? 'Hesap Oluştur' : 'Giriş Yap'}
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>

            {/* Giriş / Kayıt Geçişi */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                {isRegistering 
                  ? 'Zaten hesabınız var mı? Giriş yapın.' 
                  : 'Henüz hesabınız yok mu? Hemen kaydolun.'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Satın alınan ürün listesini çek (Orders içinden)
  const purchasedProducts = user?.orders?.map(order => order.product).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Merhaba, {user.name || 'Öğrenci'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-slate-500">{user.email}</p>
                  {user.role === 'ADMIN' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                      YÖNETİCİ
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
                  {user.tcNo && <span>T.C.: {user.tcNo}</span>}
                  {user.tcNo && (user.phone || user.city || user.district) && <span className="text-slate-300">|</span>}
                  {user.phone && <span>Tel: {user.phone}</span>}
                  {user.phone && (user.city || user.district) && <span className="text-slate-300">|</span>}
                  {(user.city || user.district) && (
                    <span>Konum: {user.district ? `${user.district}, ` : ''}{user.city}</span>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-white text-sm hover:bg-amber-600 hover:shadow-lg shadow-sm transition-all"
                  >
                    Admin Paneli
                  </motion.button>
                </Link>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Şifre Değiştir
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Buttons */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-5 mb-8">
          <button
            onClick={() => setActiveProfileTab('courses')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeProfileTab === 'courses'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Package className="w-4 h-4" />
            Eğitimlerim
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeProfileTab === 'courses' ? 'bg-white/20 text-white' : 'bg-slate-105 text-slate-550'
            }`}>
              {purchasedProducts.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveProfileTab('support')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeProfileTab === 'support'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'text-slate-650 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Destek Taleplerim
          </button>
        </div>

        {/* Courses List Section */}
        {activeProfileTab === 'courses' && (
          <>
            {purchasedProducts.length > 0 ? (
              <div className="space-y-4">
                {purchasedProducts.map((product, i) => {
                  const actionConfig = actionLabels[product.type] || { label: 'Eriş', icon: Play };
                  const ActionIcon = actionConfig.icon;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
                        <img
                          src={product.coverImage || '/covers/deneme.png'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{product.title}</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{product.type}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${
                          product.type === 'Video Ders Seti' || product.type === 'Kombo Paket'
                            ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg' 
                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        <ActionIcon className="w-4 h-4" strokeWidth={2} />
                        {actionConfig.label}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Eğitim Satın Alınmamış</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Kataloğumuzdaki zengin dijital ders kitapları, denemeler ve video kursları inceleyerek eğitiminize hemen başlayın.
                </p>
                <Link href="/urunler">
                  <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors">
                    Eğitimleri Keşfet
                  </button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Support Section */}
        {activeProfileTab === 'support' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Destek Talepleriniz</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">Teknik sorunlar ve sorularınız için destek talebi oluşturun.</p>
              </div>
              {!showNewSupportForm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowNewSupportForm(true);
                    setSupportError('');
                    setSupportSuccess('');
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-500/10 hover:bg-amber-600 transition-all cursor-pointer"
                >
                  Yeni Destek Talebi
                </motion.button>
              )}
            </div>

            {/* New Support Request Form */}
            {showNewSupportForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Yeni Destek Talebi Oluştur</h4>
                  <button
                    onClick={() => setShowNewSupportForm(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-650"
                  >
                    Vazgeç
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {supportError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-650 text-xs font-semibold p-4 rounded-xl border border-red-100 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{supportError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleCreateSupportMessage} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Konu</label>
                    <input
                      type="text"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="Destek talebinizin konusu (örn: Eğitim Paketine Erişim Sorunu)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mesajınız *</label>
                    <textarea
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Sorunuzu veya karşılaştığınız problemi detaylıca buraya yazın..."
                      rows={5}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingSupport ? 'Gönderiliyor...' : 'Talebi Gönder'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Success feedback outside form */}
            {supportSuccess && (
              <div className="bg-emerald-50 text-emerald-600 text-xs font-semibold p-4 rounded-xl border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{supportSuccess}</span>
              </div>
            )}

            {/* Loading / List / Empty State */}
            {isSupportLoading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse h-32" />
                ))}
              </div>
            ) : supportMessages.length > 0 ? (
              <div className="space-y-4">
                {supportMessages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-350 transition-all">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-800">{msg.subject || 'Destek Talebi'}</span>
                          <span className="text-slate-200 text-xs">|</span>
                          <span className="text-xs text-slate-455 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                          msg.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {msg.status === 'RESOLVED' ? 'CEVAPLANDI' : 'BEKLEMEDE'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-650 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        {msg.message}
                      </p>
                    </div>

                    {/* Admin Reply */}
                    {msg.reply && (
                      <div className="ml-4 p-4 bg-amber-500/[0.03] rounded-2xl border border-amber-500/10 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-600">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Destek Ekibi Cevabı
                          {msg.repliedAt && (
                            <span className="text-[10px] text-slate-400 font-medium font-mono">
                              ({new Date(msg.repliedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {msg.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
                <MessageSquare className="w-12 h-12 text-slate-350 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Destek Talebiniz Bulunmuyor</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Karşılaştığınız herhangi bir sorunda veya sorunuz olduğunda yeni bir talep oluşturarak bizimle paylaşabilirsiniz.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ödeme Başarılı Pop-up Modalı */}
      <AnimatePresence>
        {showPaymentSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white/95 backdrop-blur-xl border border-emerald-500/25 max-w-sm w-full rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(16,185,129,0.18)] text-center relative overflow-hidden"
            >
              {/* Glow effects */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping opacity-75" />
                <CheckCircle2 className="w-10 h-10 relative z-10" strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Başarılı!
              </h3>
              <p className="text-sm font-semibold text-slate-600 mb-5 leading-relaxed px-2">
                Ödemeniz başarıyla alınmıştır.
              </p>

              {/* LMS Bilgi Kutusu */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">Video Ders & Kurs Erişimi</h4>
                </div>
                <p className="text-[11px] font-medium text-emerald-700 leading-relaxed mb-3">
                  Satın aldığınız video derslere <strong>LMS Panelimizden</strong> aşağıdaki bilgilerle hemen giriş yapabilirsiniz:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kullanıcı Adı</span>
                    <span className="text-xs font-bold text-slate-700">Telefon No (0 olmadan)</span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Şifre</span>
                    <span className="text-xs font-bold text-slate-700">E-Posta Adresiniz</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href="https://dereceuzem.okinar.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  LMS Paneline Giriş Yap
                </a>
                <button
                  onClick={() => {
                    setShowPaymentSuccess(false);
                    router.replace('/hesabim');
                  }}
                  className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Daha Sonra
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Şifre Değiştirme Modalı */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-[2rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                Kapat
              </button>
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-2">Şifremi Değiştir</h3>
                <p className="text-sm text-slate-500 font-medium">Hesap güvenliğiniz için yeni bir şifre belirleyin.</p>
              </div>

              <AnimatePresence mode="wait">
                {pwError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100 mb-4">
                    {pwError}
                  </motion.div>
                )}
                {pwSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-600 text-xs font-semibold p-3 rounded-xl border border-emerald-100 mb-4">
                    {pwSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Mevcut Şifre</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Yeni Şifre</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    required
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPwLoading}
                  className="w-full py-3.5 mt-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isPwLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
