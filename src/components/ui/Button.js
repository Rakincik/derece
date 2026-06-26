'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-accent-400 to-orange-500 text-white shadow-lg shadow-accent-400/25 hover:shadow-accent-400/40',
  secondary: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 hover:border-slate-400',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25',
  blue: 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center gap-2 
        font-semibold rounded-xl 
        transition-all duration-200 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" strokeWidth={1.5} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" strokeWidth={1.5} />}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
