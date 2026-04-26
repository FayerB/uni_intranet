import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BellRing, Shield, Globe } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
              <Settings className="mr-3 text-primary" /> Configurar Cuenta
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl mr-4"><BellRing size={20} /></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Notificaciones Push</h4>
                  <p className="text-xs text-gray-500">Recibe alertas en tu dispositivo.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl mr-4"><Shield size={20} /></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Autenticación 2FA</h4>
                  <p className="text-xs text-gray-500">Protege tu cuenta con dos pasos.</p>
                </div>
              </div>
              <button className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">Activar</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl mr-4"><Globe size={20} /></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Privacidad Pública</h4>
                  <p className="text-xs text-gray-500">Mostrar mi perfil en el directorio universitario.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <p className="text-center text-xs text-gray-400 pt-2">Estas configuraciones se aplican localmente. Las variables son guardadas en la sesión actual.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
