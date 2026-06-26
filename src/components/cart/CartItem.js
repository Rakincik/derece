'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatPrice } from '@/lib/productHelper';


export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();
  const price = item.discountedPrice || item.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
    >
      {/* Image */}
      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100">
        <Image
          src={item.cover}
          alt={item.name}
          width={64}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-900 truncate">
          {item.name}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">{item.type}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <Minus className="w-3 h-3" strokeWidth={2} />
            </motion.button>
            <span className="w-6 text-center text-sm font-mono text-slate-900">
              {item.quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <Plus className="w-3 h-3" strokeWidth={2} />
            </motion.button>
          </div>

          {/* Price */}
          <span className="text-sm font-semibold font-mono text-accent-400">
            {formatPrice(price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => removeItem(item.id)}
        className="self-start p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
}
