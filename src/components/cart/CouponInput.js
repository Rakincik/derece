'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const { applyCoupon, removeCoupon, couponCode } = useCartStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    const result = await applyCoupon(code);
    setMessage(result);
    if (result.success) {
      setCode('');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (couponCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
          <span className="text-xs font-medium text-emerald-700">
            Kupon: {couponCode}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={removeCoupon}
          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Kupon kodu"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-400 transition-colors"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleApply}
          className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all"
        >
          Uygula
        </motion.button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`flex items-center gap-1.5 text-xs ${
              message.success ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {message.success ? (
              <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
            ) : (
              <AlertTriangle className="w-3 h-3" strokeWidth={2} />
            )}
            {message.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
