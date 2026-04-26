import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', error, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        className={`flex w-full rounded-2xl border bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm transition-all duration-200 
          file:border-0 file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-700 dark:focus:ring-offset-gray-900
          ${Icon ? 'pl-10' : ''}
          ${error 
            ? 'border-destructive focus:border-destructive focus:ring-destructive' 
            : 'border-gray-200 focus:border-primary focus:ring-primary'
          }
          ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 text-xs text-destructive flex items-center">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
