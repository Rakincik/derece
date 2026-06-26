'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Phone, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun (Ad Soyad, E-posta, Mesaj).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Mesajınız başarıyla iletildi! En kısa sürede geri dönüş yapacağız.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Mesajınız gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 (850) 123 45 67',
      link: 'tel:+908501234567'
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'iletisim@dereceuzem.com',
      link: 'mailto:iletisim@dereceuzem.com'
    },
    {
      icon: MapPin,
      title: 'Adres',
      content: 'Eğitim Vadisi, Teknopark Binası No:1 Istanbul / Türkiye',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">İletişime Geçin</h1>
            <p className="text-slate-600 text-lg">
              Sorularınız, önerileriniz veya iş birlikleri için bizimle iletişime geçmekten çekinmeyin. Ekibimiz size en kısa sürede dönüş yapacaktır.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <motion.a
                href={info.link}
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-accent-400 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center text-accent-600 group-hover:scale-110 transition-transform">
                  <info.icon strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{info.title}</h3>
                  <p className="text-slate-600">{info.content}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
          >
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Mesaj Gönderin</h3>
            
            {/* Feedback Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-600 text-xs font-semibold p-4 rounded-xl border border-red-100 mb-6 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 text-emerald-600 text-xs font-semibold p-4 rounded-xl border border-emerald-100 mb-6 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 transition-colors"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">E-posta Adresiniz *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-slate-700">Konu</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 transition-colors"
                  placeholder="Mesajınızın konusu"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">Mesajınız *</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 transition-colors resize-none"
                  placeholder="Mesajınızı buraya yazabilirsiniz..."
                ></textarea>
              </div>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading}
                icon={Send} 
                className="w-full sm:w-auto px-8"
              >
                {isLoading ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
