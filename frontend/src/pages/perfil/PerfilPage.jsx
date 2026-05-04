import { useState } from 'react';
import { User, Mail, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../api';
import Swal from 'sweetalert2';

export default function PerfilPage() {
  const { user } = useStore();
  const [tab, setTab]       = useState('info');
  const [showPass, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({ actual: '', nueva: '', confirmar: '' });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas nuevas no coinciden.', confirmButtonColor: '#1e3a8a' });
      return;
    }
    setSaving(true);
    try {
      await api.patch('/usuarios/perfil/password', { actual: form.actual, nueva: form.nueva });
      Swal.fire({ icon: 'success', title: 'Contraseña actualizada', confirmButtonColor: '#1e3a8a' });
      setForm({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'No se pudo actualizar.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setSaving(false);
    }
  };

  const roleBadgeClass = {
    admin:      'bg-primary/10 text-primary',
    docente:    'bg-secondary/10 text-secondary',
    estudiante: 'bg-success/10 text-success',
  }[user?.role] || 'bg-gray-100 text-gray-600';

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-0">
      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="h-20 w-20 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary text-white text-3xl font-bold flex items-center justify-center">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
              <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${roleBadgeClass}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[['info', 'Información'], ['seguridad', 'Contraseña']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === k
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Información */}
      {tab === 'info' && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <InfoRow icon={User}     label="Nombre completo"      value={user?.name} />
            <InfoRow icon={Mail}     label="Correo institucional" value={user?.email} />
            <InfoRow icon={Briefcase} label="Rol en el sistema"   value={user?.role} capitalize />
          </CardContent>
        </Card>
      )}

      {/* Contraseña */}
      {tab === 'seguridad' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Cambiar contraseña
            </h3>
            <form onSubmit={handleChangePass} className="space-y-4">
              <PassInput label="Contraseña actual"          value={form.actual}    onChange={set('actual')}    show={showPass} toggle={() => setShow(x => !x)} />
              <PassInput label="Nueva contraseña"           value={form.nueva}     onChange={set('nueva')}     show={showPass} toggle={() => setShow(x => !x)} />
              <PassInput label="Confirmar nueva contraseña" value={form.confirmar} onChange={set('confirmar')} show={showPass} toggle={() => setShow(x => !x)} />
              <button type="submit"
                disabled={saving || !form.actual || !form.nueva || !form.confirmar}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {saving ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
        <p className={`font-semibold text-gray-900 dark:text-white truncate ${capitalize ? 'capitalize' : ''}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function PassInput({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          minLength={6}
          className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}
