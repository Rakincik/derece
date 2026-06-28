'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const defaultFaqs = [
  {
    id: '1',
    question: 'Dijital kitapları indirdikten sonra internetsiz kullanabilir miyim?',
    answer: 'Evet! Satın aldığınız dijital kitapları (PDF/ePub formatında) cihazınıza indirdikten sonra herhangi bir internet bağlantısına ihtiyaç duymadan, istediğiniz zaman kullanabilirsiniz.'
  },
  {
    id: '2',
    question: 'Satın aldığım kurslara ne kadar süreyle erişebilirim?',
    answer: 'Satın aldığınız video ders ve dijital kurs paketlerine 1 yıl (365 gün) boyunca sınırsız olarak erişim sağlayabilirsiniz. Ayrıca içerik güncellemelerinden ücretsiz olarak faydalanırsınız.'
  },
  {
    id: '3',
    question: 'Kredi kartına taksit imkanı var mı?',
    answer: 'Evet, anlaşmalı olduğumuz bankaların kredi kartlarıyla yapacağınız 200 TL ve üzeri alışverişlerinizde peşin fiyatına 3, toplamda 9 aya varan taksit seçeneklerinden yararlanabilirsiniz.'
  },
  {
    id: '4',
    question: 'Sınav paketlerini birden fazla cihazda kullanabilir miyim?',
    answer: 'Satın aldığınız ürünleri bilgisayar, tablet veya cep telefonunuzdan giriş yaparak kullanabilirsiniz. Güvenlik önlemleri gereği eşzamanlı olarak sadece tek bir cihazdan aktif oturum açabilirsiniz.'
  },
  {
    id: '5',
    question: 'İade politikanız nedir?',
    answer: 'Satın alınan dijital ürünler (PDF kitaplar, video dersler ve online denemeler) anında kullanıma açılan dijital içerikler olduğundan, yasal mevzuat gereği iadesi veya iptali mümkün değildir.'
  }
];

export default function FAQClient({ settings }) {
  // Try to parse database FAQs, otherwise fallback to static default list
  let faqs = defaultFaqs;
  try {
    if (settings?.faqs) {
      faqs = JSON.parse(settings.faqs);
    }
  } catch (e) {
    console.error('Error parsing FAQs setting:', e);
  }

  const [openId, setOpenId] = useState(faqs[0]?.id || null);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent-600">
              <MessageCircleQuestion className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Sıkça Sorulan Sorular</h1>
            <p className="text-slate-600 text-lg">
              DereceUzem ve ürünlerimiz hakkında merak ettiğiniz tüm soruların cevaplarını burada bulabilirsiniz.
            </p>
          </motion.div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-semibold text-slate-900 pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400"
                >
                  <ChevronDown className="w-5 h-5" strokeWidth={2} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 pt-0 border-t border-slate-100 mt-2">
                      <p className="text-slate-600 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
