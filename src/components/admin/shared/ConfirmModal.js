'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, title, message, type = 'warning' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center space-y-4"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-sans">
                {title}
              </h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
                {message}
              </p>
            </div>

            <div className="flex w-full gap-3 pt-2">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => onClose(true)}
                className={`flex-1 py-3 text-white rounded-2xl text-xs font-bold transition-all shadow-md ${
                  type === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                }`}
              >
                Onayla
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
