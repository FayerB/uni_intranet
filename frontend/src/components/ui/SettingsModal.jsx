import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, BellRing, Shield, Globe } from 'lucide-react';

// Persiste en localStorage y simula guardado en backend.
// TODO: reemplazar localStorage.setItem por api.put('/usuarios/configuracion', ...)
function useSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved === null ? defaultValue : saved === 'true';
  });

  const toggle = () => {
    setValue((prev) => {
      const next = !prev;
      localStorage.setItem(key, next);
      return next;
    });
  };

  return [value, toggle];
}

export function SettingsModal({ isOpen, onClose }) {
  const [notifEnabled,  toggleNotif]      = useSetting('settings_notif_enabled',   true);
  const [isPublic,      togglePrivacidad] = useSetting('settings_privacy_public',  false);

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

              {/* Notificaciones Push */}
              <SettingRow
                icon={<BellRing size={20} />}
                iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                title="Notificaciones Push"
                description="Recibe alertas en tu dispositivo."
              >
                <Toggle checked={notifEnabled} onChange={toggleNotif} />
              </SettingRow>

              {/* Autenticación 2FA */}
              <SettingRow
                icon={<Shield size={20} />}
                iconBg="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                title="Autenticación 2FA"
                description="Protege tu cuenta con dos pasos."
              >
                {/* TODO: abrir flujo de configuración 2FA */}
                <button className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                  Activar
                </button>
              </SettingRow>

              {/* Privacidad Pública */}
              <SettingRow
                icon={<Globe size={20} />}
                iconBg="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                title="Privacidad Pública"
                description="Mostrar mi perfil en el directorio universitario."
              >
                <Toggle checked={isPublic} onChange={togglePrivacidad} />
              </SettingRow>

              <p className="text-center text-xs text-gray-400 pt-2">
                Los cambios se guardan automáticamente en tu sesión.
              </p>
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
