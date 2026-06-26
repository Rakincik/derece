'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Target, GraduationCap, PlaySquare, FileText, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ProductTabs({ product }) {
  const showOutcomes = product.showOutcomes !== false;
  const showDemo = product.showDemo !== false;
  const showFaq = product.showFaq !== false && product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0;
  const showInstructor = product.showInstructor !== undefined && product.showInstructor !== null
    ? product.showInstructor
    : (product.type === 'Video Ders Seti' || product.type === 'Kombo Paket');

  const tabs = [
    { id: 'contents', label: 'İçindekiler', icon: List },
    showOutcomes && { id: 'outcomes', label: 'Kazanımlar', icon: Target },
    showInstructor && { id: 'instructor', label: 'Eğitmen', icon: GraduationCap },
    showDemo && { id: 'demo', label: 'Örnek İçerik', icon: PlaySquare },
    showFaq && { id: 'faq', label: 'SSS', icon: HelpCircle },
  ].filter(Boolean);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'contents');

  return (
    <div className="glass-card overflow-hidden">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap shrink-0 ${
                isActive ? 'text-accent-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
              {tab.id === 'contents' && product.contents && (
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-500'}`}>
                  {product.contents.length}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="p-6 bg-white min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Contents Tab */}
            {activeTab === 'contents' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Eğitim İçeriği</h3>
                {product.contents && product.contents.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.contents.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-accent-200 hover:bg-accent-50/50 transition-colors group"
                      >
                        <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 group-hover:text-accent-600 group-hover:border-accent-300 group-hover:bg-white transition-colors">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-sm text-slate-700 pt-1 group-hover:text-slate-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">İçerik detayı bulunmuyor.</p>
                )}
              </div>
            )}

            {/* Outcomes Tab */}
            {activeTab === 'outcomes' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Bu Eğitimden Neler Kazanacaksınız?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Bu içerik, sınav müfredatına birebir uyumlu olarak hazırlanmıştır ve hedeflerine hızlıca ulaşmak isteyen tüm öğrenciler için uygundur. Bu paketi bitirdiğinizde şunları kazanacaksınız:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(product.outcomes && product.outcomes.length > 0
                    ? product.outcomes
                    : ['Konu eksiklerini tamamen kapatma', 'Sınav pratikliğini artırma', 'Zaman yönetimini öğrenme', 'Farklı soru tiplerine aşinalık', 'Netlerde garantili artış', 'Stres yönetimi ve motivasyon']
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={2} />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Eğitmen Hakkında</h3>
                <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-150 flex items-center justify-center text-3xl text-white font-bold shadow-lg relative bg-slate-100">
                    {product.instructorImage ? (
                      <img 
                        src={product.instructorImage} 
                        alt={product.instructorName || 'Eğitmen'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent-400 to-orange-600 flex items-center justify-center">
                        {product.instructorAvatar || 'E'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{product.instructorName || 'Uzman Eğitmen Kadrosu'}</h4>
                    <p className="text-sm text-accent-600 font-bold mb-4">{product.instructorExperience || '10+ Yıl Deneyim'}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {product.instructorDescription || 'DereceUzem eğitmenleri, alanında uzman, binlerce öğrencinin derece yapmasına rehberlik etmiş tecrübeli öğretmenlerden oluşur. Müfredata tam hakimiyet ve yeni nesil soru tarzlarına yönelik özel taktiklerle dersleri işlerler. Video içeriklerimizde konular akılda kalıcı yöntemlerle ve sınav odaklı püf noktalarıyla aktarılır.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Tab */}
            {activeTab === 'demo' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Satın Almadan Önce İnceleyin</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-accent-100 flex items-center justify-center shrink-0 shadow-inner">
                    {product.type === 'Dijital Kitap' || product.type === 'Deneme Paketi' ? (
                      <FileText className="w-10 h-10 text-accent-600" strokeWidth={1.5} />
                    ) : (
                      <PlaySquare className="w-10 h-10 text-accent-600" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Örnek İçerik</h4>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      Eğitim kalitemizi ve anlatım tarzımızı kendi gözlerinizle görün. İlgili bölümlerin kısa bir önizlemesi veya PDF örnek sayfaları sizin için ücretsiz sunulmaktadır.
                    </p>
                    <button 
                      onClick={() => product.demoUrl && window.open(product.demoUrl, '_blank')}
                      disabled={!product.demoUrl}
                      className="px-6 py-2.5 rounded-xl bg-accent-600 disabled:opacity-50 text-white font-semibold text-sm hover:bg-accent-700 hover:shadow-lg hover:shadow-accent-500/30 transition-all"
                    >
                      {product.demoUrl 
                        ? (product.type === 'Dijital Kitap' || product.type === 'Deneme Paketi' ? 'Örnek PDF İndir' : 'Demo Videosunu İzle')
                        : 'Örnek İçerik Yakında'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Sıkça Sorulan Sorular</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0 ? (
                    product.faqs.map((faq, i) => (
                      <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent-500" />
                          {faq.q}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent-500" />
                          Ne zaman erişebilirim?
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">Ödemeniz onaylandığı saniye içerik {"\"Hesabım\""} panelinize tanımlanır ve anında kullanmaya başlayabilirsiniz.</p>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent-500" />
                          İndirebilir miyim?
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">PDF formatındaki içerikler indirilebilir. Video dersler ise platformumuz üzerinden ömür boyu online olarak izlenebilir.</p>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent-500" />
                          Kime sorabilirim?
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">Kullanıcı panelinizde yer alan 7/24 Teknik Destek sistemi üzerinden soru ve sorunlarınızı anında bize iletebilirsiniz.</p>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-accent-500" />
                          Erişim süresi nedir?
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">Satın aldığınız ürünlere erişiminiz ömür boyu sürer, herhangi bir kullanım veya süre kısıtlaması bulunmaz.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
