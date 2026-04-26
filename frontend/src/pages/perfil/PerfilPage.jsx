import { User, Mail, Briefcase } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { Card, CardContent } from '../../components/ui/Card';

const PerfilPage = () => {
  const { user } = useStore();

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-secondary text-white text-3xl font-bold flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de Usuario</h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Informacion principal de tu cuenta institucional.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center">
                <User size={14} className="mr-2" />
                Nombre
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Administrador Demo'}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center">
                <Mail size={14} className="mr-2" />
                Correo
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.email || 'admin@universidad.edu'}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center">
                <Briefcase size={14} className="mr-2" />
                Rol
              </p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfilPage;