'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomeSlider({ sliders = [], isFirst = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const timerRef = useRef(null);

  const activeSliders = (sliders || []).filter(s => s && s.image);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [currentIndex, activeSliders.length]);

  if (activeSliders.length === 0) return null;

  const startTimer = () => {
    stopTimer();
    if (activeSliders.length > 1) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSliders.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeSliders.length) % activeSliders.length);
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const currentSlide = activeSliders[currentIndex];

  const slideContent = (
    <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl shadow-md border border-slate-100 bg-slate-50">
      <img
        src={currentSlide.image}
        alt={currentSlide.title || 'Slayt Görseli'}
        className="w-full h-full object-cover object-center select-none"
        draggable={false}
      />
      {currentSlide.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-6 text-white">
          <h3 className="text-base sm:text-lg font-bold drop-shadow-sm">{currentSlide.title}</h3>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 relative group ${isFirst ? 'pt-20 lg:pt-24' : ''}`}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* Slider Inner Frame (Maintains 1200:500 aspect ratio) */}
      <div className="relative w-full aspect-[2.4/1] overflow-hidden rounded-2xl md:rounded-3xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.link ? (
              <Link href={currentSlide.link} className="block w-full h-full cursor-pointer">
                {slideContent}
              </Link>
            ) : (
              slideContent
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {activeSliders.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 shadow-md hover:shadow-lg active:scale-95 transition-all opacity-0 group-hover:opacity-100 duration-200 z-10"
              aria-label="Önceki Slayt"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 shadow-md hover:shadow-lg active:scale-95 transition-all opacity-0 group-hover:opacity-100 duration-200 z-10"
              aria-label="Sonraki Slayt"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {activeSliders.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {activeSliders.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-accent-400' 
                  : 'w-2 bg-slate-200 hover:bg-slate-350'
              }`}
              aria-label={`Slayt ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
