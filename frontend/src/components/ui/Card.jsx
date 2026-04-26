import { motion } from 'framer-motion';

export function Card({ className = '', children, hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm
                  transition-all duration-200 
                  ${hover ? 'hover:shadow-premium dark:hover:shadow-premium-dark cursor-pointer' : ''}
                  ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`flex flex-col space-y-1.5 p-6 border-b border-gray-100 dark:border-gray-700/50 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>;
}

export function CardContent({ className = '', children }) {
  return <div className={`p-6 pt-0 mt-6 ${className}`}>{children}</div>;
}
