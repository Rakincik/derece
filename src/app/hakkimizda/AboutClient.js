'use client';

import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Trophy } from 'lucide-react';

export default function AboutClient({ settings }) {
  const stats = [
    { label: 'Mutlu Öğrenci', value: '10.000+', icon: Users },
    { label: 'Eğitim İçeriği', value: '500+', icon: BookOpen },
    { label: 'Başarı Oranı', value: '%95', icon: Trophy },
    { label: 'Hedeflenen Sınav', value: 'YKS, LGS', icon: Target },
  ];

  const title = settings?.about_title || 'Eğitimde Yeni Bir Vizyon';
  const subtitle = settings?.about_subtitle || 'DereceUzem olarak, öğrencilerin potansiyellerini en üst düzeye çıkarmaları için yenilikçi, dijital ve erişilebilir eğitim içerikleri üretiyoruz. Amacımız sadece sınav kazandırmak değil, kalıcı öğrenmeyi sağlamak.';
  const missionTitle = settings?.about_mission_title || 'Misyonumuz';
  const missionText = settings?.about_mission_text || 'Öğrencilerin akademik hedeflerine ulaşmaları için ihtiyaç duydukları nitelikli kaynakları, dijital dünyanın sunduğu kolaylıklarla birleştirerek sunmak. Her öğrencinin bireysel öğrenme hızına ve stiline uygun içerikler geliştiriyoruz.';
  const visionTitle = settings?.about_vision_title || 'Vizyonumuz';
  const visionText = settings?.about_vision_text || "Türkiye'nin dijital eğitim alanında en çok tercih edilen ve en yenilikçi platformu olmak. Eğitimde fırsat eşitliği yaratarak, kaliteli içeriği yurdun dört bir yanındaki öğrencilere ulaştırmak.";
  const aboutImg = settings?.about_image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';
  const isDefaultImage = aboutImg.includes('unsplash.com');

  const renderTitle = (text) => {
    const parts = text.split('**');
    if (parts.length >= 3) {
      return (
        <>
          {parts[0]}
          <span className="text-accent-600">
            {parts[1]}
          </span>
          {parts[2]}
        </>
      );
    }
    // Backward compat if they used vizyon without stars
    if (text.includes('Vizyon')) {
      const splitText = text.split('Vizyon');
      return (
        <>
          {splitText[0]}
          <span className="text-accent-600">Vizyon</span>
          {splitText[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {renderTitle(title)}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-600">
                  <stat.icon strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission/Vision Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{missionTitle}</h2>
            <p className="text-slate-600 leading-relaxed mb-10 font-medium">
              {missionText}
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{visionTitle}</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              {visionText}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ${
              isDefaultImage ? '' : 'bg-slate-50 border border-slate-100 flex items-center justify-center p-6'
            }`}
          >
            {isDefaultImage && (
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-600/20 to-blue-600/20 mix-blend-multiply z-10" />
            )}
            <img 
              src={aboutImg} 
              alt="Hakkımızda Görseli" 
              className={`w-full h-full ${isDefaultImage ? 'object-cover' : 'object-contain'}`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
