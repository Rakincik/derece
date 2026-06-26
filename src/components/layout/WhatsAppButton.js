'use client';

import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  // Scraped number format: 0543 521 06 34
  // WhatsApp link format: https://wa.me/905435210634
  const phoneNumber = '905435210634';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Merhaba,%20bilgi%20almak%20istiyorum.`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[45] flex items-center group">
      {/* Tooltip text label */}
      <span className="mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
        WhatsApp Canlı Destek
        <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping" />
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Canlı Destek"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:shadow-xl hover:shadow-[#25D366]/50 transition-all duration-300"
      >
        {/* Pulsing ring background */}
        <span className="absolute inset-0 w-full h-full rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none scale-105" />

        {/* Outer scale effect on hover */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center w-full h-full rounded-full"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.116-2.905-6.993-1.876-1.878-4.36-2.91-6.993-2.912-5.45 0-9.88 4.417-9.885 9.864-.002 1.707.453 3.376 1.314 4.848l-.988 3.604 3.703-.972zm10.513-5.714c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </motion.div>
      </a>
    </div>
  );
}
