import React from 'react';

export default function SkeletonLoader({ className }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>
  );
}
