'use client';

import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';

export default function ReviewSection({ reviews, rating, reviewCount }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" strokeWidth={1} />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Henüz yorum yok</h3>
        <p className="text-sm text-slate-600">Bu ürün için ilk yorumu siz yazın!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-4xl font-bold font-mono text-slate-900 mb-1">
              {rating.toFixed(1)}
            </div>
            <StarRating rating={rating} size="md" />
            <p className="text-xs text-slate-500 mt-1">{reviewCount} değerlendirme</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-3">{star}</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{review.author}</h4>
                  <p className="text-[11px] text-slate-500">{review.date}</p>
                </div>
              </div>
              <StarRating rating={review.rating} size="xs" />
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              {review.comment}
            </p>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
              <span>{review.helpful} kişi faydalı buldu</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
