'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, PlusCircle, Trash, Trash2, Package } from 'lucide-react';
import AdminDropdown from '../shared/AdminDropdown';

export default function ProductFormModal({
  isOpen,
  onClose,
  editingId,
  categoriesList,
  handleSaveProduct,
  // Form values and setters
  title, setTitle,
  price, setPrice,
  discountedPrice, setDiscountedPrice,
  sortOrder, setSortOrder,
  isFeatured, setIsFeatured,
  isBestseller, setIsBestseller,
  type, setType,
  categoryId, setCategoryId,
  coverImage, setCoverImage,
  description, setDescription,
  contents, setContents,
  outcomesInput, setOutcomesInput,
  pages, setPages,
  videoCount, setVideoCount,
  duration, setDuration,
  examCount, setExamCount,
  showDemo, setShowDemo,
  demoUrl, setDemoUrl,
  showFaq, setShowFaq,
  faqs, setFaqs,
  showOutcomes, setShowOutcomes,
  showInstructor, setShowInstructor,
  instructorName, setInstructorName,
  instructorExperience, setInstructorExperience,
  instructorDescription, setInstructorDescription,
  instructorAvatar, setInstructorAvatar,
  instructorImage, setInstructorImage,
  // Upload values and handlers
  isUploading,
  handleUploadImage,
  isUploadingInstructor,
  handleUploadInstructorImage
}) {
  const categoryOptions = categoriesList.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const productTypeOptions = [
    { value: 'Video Ders Seti', label: 'Video Ders Seti' },
    { value: 'Dijital Kitap', label: 'Dijital Kitap' },
    { value: 'Deneme Paketi', label: 'Deneme Paketi' },
    { value: 'Kombo Paket', label: 'Kombo Paket' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="text-lg font-black text-slate-900">
                {editingId ? 'Eğitimi Düzenle' : 'Yeni Eğitim Ekle'}
              </h3>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-105 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProduct} data-lenis-prevent className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
              
              {/* Section: Temel Bilgiler */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temel Bilgiler</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitim Başlığı</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: 10. Sınıf Matematik Seti"
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Ürün Tipi / Formatı</label>
                    <AdminDropdown
                      value={type}
                      onChange={setType}
                      options={productTypeOptions}
                      placeholder="Format Seçin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Kategori</label>
                    <AdminDropdown
                      value={categoryId}
                      onChange={setCategoryId}
                      options={categoryOptions}
                      placeholder="Kategori Seçin"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Sıralama (Sıra No)</label>
                    <input 
                      type="number" 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="Örn: 1"
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Fiyatlandırma & Satış */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fiyatlandırma & Satış Seçenekleri</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Fiyat</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Örn: 299"
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">İndirimli Fiyat (Opsiyonel)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={discountedPrice}
                        onChange={(e) => setDiscountedPrice(e.target.value)}
                        placeholder="Örn: 199"
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Switch: Featured */}
                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Öne Çıkan Ürün</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ana sayfadaki vitrinde gösterilsin.</span>
                    </div>
                  </label>

                  {/* Switch: Bestseller */}
                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={isBestseller}
                        onChange={(e) => setIsBestseller(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Çok Satan Ürün</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">&quot;Çok Satan&quot; etiketiyle vurgulansın.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section: Teknik Özellikler (Dinamik) */}
              {(type === 'Dijital Kitap' || type === 'Video Ders Seti' || type === 'Deneme Paketi' || type === 'Kombo Paket') && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitim Detayları & Metrikler</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(type === 'Dijital Kitap' || type === 'Kombo Paket') && (
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Sayfa Sayısı</label>
                        <input 
                          type="number" 
                          value={pages}
                          onChange={(e) => setPages(e.target.value)}
                          placeholder="Örn: 450"
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                        />
                      </div>
                    )}

                    {(type === 'Video Ders Seti' || type === 'Kombo Paket') && (
                      <>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Video Sayısı</label>
                          <input 
                            type="number" 
                            value={videoCount}
                            onChange={(e) => setVideoCount(e.target.value)}
                            placeholder="Örn: 120"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Toplam Süre</label>
                          <input 
                            type="text" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Örn: 96 saat"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>
                      </>
                    )}

                    {(type === 'Deneme Paketi' || type === 'Kombo Paket') && (
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Deneme Sayısı</label>
                        <input 
                          type="number" 
                          value={examCount}
                          onChange={(e) => setExamCount(e.target.value)}
                          placeholder="Örn: 30"
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Görsel Tanımlama */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kapak Görseli</h4>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50/50 border border-slate-200/60 p-4 rounded-3xl">
                  {/* Live Preview Card */}
                  <div className="relative aspect-[5/7] w-32 shrink-0 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                    {coverImage ? (
                      <img 
                        src={coverImage} 
                        alt="Önizleme" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-350" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex items-center justify-between pl-1">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Görsel Dosya Yolu / Dosya Yükle</label>
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Önerilen: 600x840 px (5:7)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        required
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="Örn: /covers/matematik.png"
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-xs font-mono tracking-wide shadow-sm"
                      />
                      <label className="cursor-pointer px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                        {isUploading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            Görsel Yükle
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleUploadImage} 
                          disabled={isUploading}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Eğitim İçerik Detayları */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">İçerik Detayları</h4>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Açıklama</label>
                    <textarea 
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Eğitim içeriğinin kısa açıklaması..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm resize-none shadow-sm font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">İçindekiler</label>
                      <button
                        type="button"
                        onClick={() => setContents([...contents, ''])}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Öğe Ekle
                      </button>
                    </div>
                    
                    {contents.length > 0 ? (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 border border-slate-100 p-2.5 rounded-2xl bg-slate-50/50">
                        {contents.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-405 w-5 text-right shrink-0">
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <input 
                              type="text" 
                              required
                              value={item}
                              onChange={(e) => {
                                const newContents = [...contents];
                                newContents[index] = e.target.value;
                                setContents(newContents);
                              }}
                              placeholder="Örn: 📚 Matematik Konu Anlatımı Kitabı (456 sayfa)"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-800 placeholder-slate-405 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newContents = contents.filter((_, i) => i !== index);
                                setContents(newContents);
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl transition-all shrink-0"
                              title="Müfredat Öğesini Sil"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-medium bg-slate-50/30">
                        Henüz hiçbir içerik eklenmedi. &quot;Öğe Ekle&quot; butonuna basarak başlayın.
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={showOutcomes}
                        onChange={(e) => setShowOutcomes(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Kazanımlar Bölümünü Göster</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Kazanımlar&quot; sekmesi aktif olsun.</span>
                    </div>
                  </label>

                  {showOutcomes && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Kazanımlar / Neler Katacak?</label>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virgülle ayırarak yazın</span>
                      </div>
                      <input 
                        type="text" 
                        value={outcomesInput}
                        onChange={(e) => setOutcomesInput(e.target.value)}
                        placeholder="Örn: Sınav netlerinde artış, Hızlı pratik yapabilme"
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Örnek İçerik */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Örnek İçerik (Demo)</h4>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={showDemo}
                        onChange={(e) => setShowDemo(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Örnek İçerik Bölümünü Göster</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Örnek İçerik&quot; sekmesi aktif olsun.</span>
                    </div>
                  </label>

                  {showDemo && (
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Örnek İçerik Bağlantısı (PDF / Video URL)</label>
                      <input 
                        type="text" 
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="Örn: /uploads/ornek.pdf veya Youtube video linki"
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Sıkça Sorulan Sorular (SSS) */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sıkça Sorulan Sorular (SSS)</h4>
                </div>

                <div className="space-y-6">
                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={showFaq}
                        onChange={(e) => setShowFaq(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">SSS Bölümünü Göster</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;SSS&quot; sekmesi aktif olsun.</span>
                    </div>
                  </label>

                  {showFaq && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Sorular & Cevaplar</label>
                        <button
                          type="button"
                          onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                          className="px-3.5 py-2 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Yeni Soru Ekle
                        </button>
                      </div>
                      
                      {faqs.length > 0 ? (
                        <div className="space-y-4">
                          {faqs.map((faq, i) => (
                            <div key={i} className="flex gap-4 items-start bg-slate-50 border border-slate-200/60 p-5 rounded-[1.5rem] relative">
                              <div className="flex-1 space-y-3.5">
                                <input
                                  type="text"
                                  required
                                  value={faq.q}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[i].q = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                  placeholder="Soru yazın"
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500/40 transition-colors text-xs font-bold"
                                />
                                <textarea
                                  rows={2}
                                  required
                                  value={faq.a}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[i].a = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                  placeholder="Cevap yazın"
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500/40 transition-colors text-xs font-medium resize-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                                className="p-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors self-center shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                          Henüz özel soru eklenmedi. Boş bırakırsanız varsayılan genel sorular gösterilir.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Eğitmen Bilgileri */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitmen Bilgileri</h4>
                </div>

                <div className="space-y-6">
                  <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={showInstructor}
                        onChange={(e) => setShowInstructor(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Eğitmen Bölümünü Göster</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Eğitmen&quot; sekmesi aktif olsun.</span>
                    </div>
                  </label>

                  {showInstructor && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitmen Kadrosu Başlığı / Adı</label>
                          <input 
                            type="text"
                            value={instructorName}
                            onChange={(e) => setInstructorName(e.target.value)}
                            placeholder="Örn: Uzman Eğitmen Kadrosu"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Deneyim / Rol</label>
                          <input 
                            type="text"
                            value={instructorExperience}
                            onChange={(e) => setInstructorExperience(e.target.value)}
                            placeholder="Örn: 10+ Yıl Deneyim"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitmen Açıklaması</label>
                          <textarea 
                            rows={3}
                            value={instructorDescription}
                            onChange={(e) => setInstructorDescription(e.target.value)}
                            placeholder="Eğitmen kadrosu hakkında detaylı bilgi..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm resize-none shadow-sm font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Avatar İnisiyali</label>
                          <input 
                            type="text"
                            maxLength={2}
                            value={instructorAvatar}
                            onChange={(e) => setInstructorAvatar(e.target.value.toUpperCase())}
                            placeholder="Örn: E"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm text-center"
                          />
                        </div>
                      </div>

                      {/* Instructor Image Upload */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50/50 border border-slate-200/60 p-4 rounded-3xl">
                        {/* Live Preview Card */}
                        <div className="relative w-20 h-20 shrink-0 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shadow-sm flex items-center justify-center">
                          {instructorImage ? (
                            <img 
                              src={instructorImage} 
                              alt="Eğitmen Önizleme" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-2xl text-white font-bold">
                              {instructorAvatar || 'E'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-2.5">
                          <div className="flex items-center justify-between pl-1">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Eğitmen Görseli (Dosya Yükle / URL)</label>
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Önerilen: 200x200 px (1:1)</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                              type="text" 
                              value={instructorImage}
                              onChange={(e) => setInstructorImage(e.target.value)}
                              placeholder="Dosya yolu veya yüklenen görsel linki..."
                              className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-xs font-mono tracking-wide shadow-sm"
                            />
                            <label className="cursor-pointer px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                              {isUploadingInstructor ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Yükleniyor...
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-4 h-4" />
                                  Görsel Yükle
                                </>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleUploadInstructorImage} 
                                disabled={isUploadingInstructor}
                                className="hidden" 
                              />
                            </label>
                            {instructorImage && (
                              <button
                                type="button"
                                onClick={() => setInstructorImage('')}
                                className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-2xl text-xs font-bold transition-all"
                              >
                                Görseli Kaldır
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-100 shrink-0">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-650 transition-colors text-sm shadow-sm"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all text-sm shadow-md shadow-amber-500/10"
                >
                  {editingId ? 'Değişiklikleri Kaydet' : 'Eğitimi Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
