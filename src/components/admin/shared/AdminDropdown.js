'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function AdminDropdown({ value, onChange, options, placeholder = '', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/40 transition-all cursor-pointer text-left shadow-sm"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 mt-1.5 w-full min-w-[180px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 focus:outline-none"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left font-semibold ${
                    isSelected
                      ? 'bg-amber-50 text-amber-705 text-amber-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
