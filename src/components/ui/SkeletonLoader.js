'use client';

export default function SkeletonLoader({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'w-full h-4 rounded-lg',
    circle: 'w-12 h-12 rounded-full',
    card: 'w-full h-64 rounded-xl',
    image: 'w-full aspect-[3/4] rounded-xl',
    text: 'w-3/4 h-3 rounded-md',
    title: 'w-1/2 h-6 rounded-lg',
    button: 'w-32 h-10 rounded-xl',
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-4">
      <SkeletonLoader variant="image" />
      <SkeletonLoader variant="title" />
      <SkeletonLoader variant="text" />
      <div className="flex justify-between items-center pt-2">
        <SkeletonLoader variant="button" className="w-20" />
        <SkeletonLoader variant="button" className="w-24" />
      </div>
    </div>
  );
}
