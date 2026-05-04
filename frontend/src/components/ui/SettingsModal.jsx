import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BellRing } from 'lucide-react';

function useSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved === null ? defaultValue : saved === 'true';
  });
  const toggle = () => setValue((prev) => { const next = !prev; localStorage.setItem(key, next); return next; });
  return [value, toggle];
}

export function SettingsModal({ isOpen, onClose }) {
  const [notifEnabled, toggleNotif] = useSetting('settings_notif_enabled', true);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <Settings size={20} className="text-primary" /> Configuración
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Notificaciones</p>
                    <p className="text-xs text-gray-500">Recibe alertas en este dispositivo.</p>
                  </div>
                </div>
                <Toggle checked={notifEnabled} onChange={toggleNotif} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────────

function SettingRow({ icon, iconBg, title, description, children }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl">
      <div className="flex items-center">
        <div className={`p-2 rounded-xl mr-4 ${iconBg}`}>{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="
        w-11 h-6 rounded-full transition-colors
        bg-gray-200 dark:bg-gray-700
        peer-checked:bg-primary
        peer-focus:outline-none
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border-gray-300 after:border after:rounded-full
        after:h-5 after:w-5 after:transition-all
        peer-checked:after:translate-x-full peer-checked:after:border-white
      " />
    </label>
  );
}
