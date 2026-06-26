'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, List } from 'lucide-react';

export default function ProductContents({ contents }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!contents || contents.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-accent-600" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-slate-900">İçindekiler</h3>
          <span className="text-xs text-slate-500">({contents.length} öğe)</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
        </motion.div>
      </button>

      {/* Content List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <ul className="space-y-2">
                {contents.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-mono text-slate-600 shrink-0 group-hover:text-accent-600 group-hover:border-accent-200 transition-colors">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm text-slate-700 pt-0.5">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
