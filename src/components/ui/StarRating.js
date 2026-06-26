'use client';

import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, maxRating = 5, size = 'sm', showCount = false, count = 0 }) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(maxRating)].map((_, i) => {
          const fillPercentage = Math.min(100, Math.max(0, (rating - i) * 100));
          
          return (
            <div key={i} className="relative">
              {/* Background star (empty) */}
              <Star 
                className={`${sizes[size]} text-slate-600`} 
                strokeWidth={1.5}
              />
              {/* Foreground star (filled) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star 
                  className={`${sizes[size]} text-amber-400 fill-amber-400`} 
                  strokeWidth={1.5}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-slate-400 ml-1">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
