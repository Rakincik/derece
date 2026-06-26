'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Target, GraduationCap, HelpCircle, PlaySquare, FileText, CheckCircle2 } from 'lucide-react';

function AccordionItem({ title, icon: Icon, children, isOpen, onToggle }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductExtraDetails({ product }) {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Target Audience & Outcomes */}
      <AccordionItem
        title="Kimler İçin Uygun? / Kazanımlar"
        icon={Target}
        isOpen={openSection === 'outcomes'}
        onToggle={() => toggleSection('outcomes')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Bu içerik, sınav müfredatına birebir uyumlu olarak hazırlanmıştır ve hedeflerine hızlıca ulaşmak isteyen tüm öğrenciler için uygundur. Bu paketi bitirdiğinizde şunları kazanacaksınız:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Konu eksiklerini tamamen kapatma', 'Sınav pratikliğini artırma', 'Zaman yönetimini öğrenme', 'Farklı soru tiplerine aşinalık', 'Netlerde garantili artış', 'Stres yönetimi ve motivasyon'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2} />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </AccordionItem>

      {/* Instructor Info (If applicable) */}
      {(product.type === 'Video Ders Seti' || product.type === 'Kombo Paket') && (
        <AccordionItem
          title="Eğitmen Hakkında"
          icon={GraduationCap}
          isOpen={openSection === 'instructor'}
          onToggle={() => toggleSection('instructor')}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-orange-600 shrink-0 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              E
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900 mb-1">Uzman Eğitmen Kadrosu</h4>
              <p className="text-sm text-accent-600 font-medium mb-3">10+ Yıl Deneyim</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                DereceUzem eğitmenleri, alanında uzman, binlerce öğrencinin derece yapmasına rehberlik etmiş tecrübeli öğretmenlerden oluşur. Müfredata tam hakimiyet ve yeni nesil soru tarzlarına yönelik özel taktiklerle dersleri işlerler.
              </p>
            </div>
          </div>
        </AccordionItem>
      )}

      {/* Demo / Sample Content */}
      <AccordionItem
        title="Örnek İçerik / Demo"
        icon={PlaySquare}
        isOpen={openSection === 'demo'}
        onToggle={() => toggleSection('demo')}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-16 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
            {product.type === 'Dijital Kitap' || product.type === 'Deneme Paketi' ? (
              <FileText className="w-8 h-8 text-accent-600" strokeWidth={1.5} />
            ) : (
              <PlaySquare className="w-8 h-8 text-accent-600" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Satın almadan önce inceleyin</h4>
            <p className="text-xs text-slate-500 mb-3">İçerik kalitemizi görmek için örnek bölümü ücretsiz inceleyebilirsiniz.</p>
            <button className="text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors">
              {product.type === 'Dijital Kitap' || product.type === 'Deneme Paketi' ? 'Örnek PDF İndir' : 'Demo Videosunu İzle'}
            </button>
          </div>
        </div>
      </AccordionItem>

      {/* FAQ */}
      <AccordionItem
        title="Sıkça Sorulan Sorular"
        icon={HelpCircle}
        isOpen={openSection === 'faq'}
        onToggle={() => toggleSection('faq')}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Ürünü satın aldıktan sonra ne zaman erişebilirim?</h4>
            <p className="text-sm text-slate-600">Ödemeniz onaylandığı saniye içerik {"\"Hesabım\""} panelinize tanımlanır ve anında kullanmaya başlayabilirsiniz.</p>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">{"Videoları/PDF'leri indirebilir miyim?"}</h4>
            <p className="text-sm text-slate-600">PDF formatındaki içerikler indirilebilir. Video dersler ise platformumuz üzerinden ömür boyu online olarak erişilebilir durumdadır.</p>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Sorularım olduğunda kime sorabilirim?</h4>
            <p className="text-sm text-slate-600">Kullanıcı panelinizde yer alan 7/24 Teknik Destek sistemi üzerinden soru ve sorunlarınızı anında bize iletebilirsiniz.</p>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}
