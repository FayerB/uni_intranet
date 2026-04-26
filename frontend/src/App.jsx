import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useStore } from './context/useStore';
import { useEffect } from 'react';
import './index.css';

function App() {
  const { theme } = useStore();
  
  useEffect(() => {
    // Aplicar clase persistente en el HTML/Body para que Tailwind lo lea
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <div className={`theme-${theme} text-gray-900 dark:text-gray-100 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
