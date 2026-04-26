export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <table className="w-full text-left text-sm whitespace-nowrap">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-50/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`px-6 py-4 font-semibold tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </td>
  );
}
