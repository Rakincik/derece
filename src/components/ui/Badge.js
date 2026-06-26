'use client';

const badgeVariants = {
  discount: 'bg-red-50 text-red-600 border border-red-200',
  new: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  bestseller: 'bg-orange-50 text-orange-600 border border-orange-200',
  category: 'bg-blue-50 text-blue-600 border border-blue-200',
  info: 'bg-slate-100 text-slate-600 border border-slate-200',
  premium: 'bg-violet-50 text-violet-600 border border-violet-200',
  stock: 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse-soft',
};

export default function Badge({ children, variant = 'info', className = '', icon: Icon }) {
  return (
    <span className={`
      inline-flex items-center gap-1 
      px-2.5 py-1 
      text-xs font-semibold 
      rounded-full 
      ${badgeVariants[variant]} 
      ${className}
    `}>
      {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
      {children}
    </span>
  );
}
