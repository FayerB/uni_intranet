import { Card, CardContent } from './Card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function Statistic({ title, value, icon, trend, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card hover className="h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 scale-150">
          {icon}
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              {icon}
            </div>
          </div>
          
          {trend && (
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">vs mes anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
