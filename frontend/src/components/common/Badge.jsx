import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-1 rounded-pill text-[12px] font-medium leading-none';
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-light text-primary-hover',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger:  'bg-danger-light text-danger',
    active:  'bg-blue-100 text-blue-800',
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${currentVariant} ${className}`}>
      {children}
    </span>
  );
}
