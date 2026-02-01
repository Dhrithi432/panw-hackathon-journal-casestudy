import React from 'react';
import { cn } from '@/lib/utils.ts';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const { isDark } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded-lg border transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-purple-500',
          error && 'border-red-500',
          className
        )}
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: error ? '#ef4444' : (isDark ? '#374151' : '#d1d5db'),
          color: isDark ? '#f9fafb' : '#111827',
        }}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};