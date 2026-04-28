import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../../api';
import { useRole } from '../../hooks/useRole';

const ROLES = ['Todos', 'Estudiante', 'Docente', 'Admin'];

const roleBadgeMap = {
  admin:      'primary',
  docente:    'secondary',
  estudiante: 'success',
};

export default function UsuariosPage() {
  const { isAdmin } = useRole();

  const [usuarios, setUsuarios]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [isLoading, setIsLoading]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving]     = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'Todos') params.role = roleFilter;

      const res = await api.get('/usuarios', { params });
      setUsuarios(res.data);
      setTotal(res.data.length);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de usuarios.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    reset(user
      ? { nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.role, activo: user.status === 'Activo' }
      : { nombre: '', apellido: '', email: '', password: '', rol: 'estudiante' }
    );
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, {
          nombre:   data.nombre,
          apellido: data.apellido,
          email:    data.email,
          rol:      data.rol,
          activo:   data.activo,
        });
      } else {
        await api.post('/usuarios', {
          nombre:   data.nombre,
          apellido: data.apellido,
          email:    data.email,
          password: data.password,
          rol:      data.rol,
        });
      }

      Swal.fire({
        icon: 'success',
        title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
        showConfirmButton: false,
        timer: 1500,
      });
      setIsModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el usuario.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (user) => {
    Swal.fire({
      title: `¿Desactivar a ${user.name}?`,
      text: 'El usuario perderá acceso al sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/usuarios/${user.id}`);
          Swal.fire({ icon: 'success', title: 'Usuario desactivado', showConfirmButton: false, timer: 1500 });
          fetchUsuarios();
        } catch (err) {
          const msg = err.response?.data?.message || 'Error al desactivar el usuario.';
          Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#1e3a8a' });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Administra accesos y roles del sistema.</p>
        </motion.div>

        {isAdmin && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Nuevo Usuario
            </Button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o correo..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-48"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <Filter size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Cargando usuarios...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <tbody>
              {usuarios.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-sm">
                        {user.initial}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeMap[user.role] || 'gray'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Activo' ? 'success' : 'gray'}>{user.status}</Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-10 text-gray-400">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        )}

        <div className="flex items-center justify-between mt-4 px-4 text-sm text-gray-500">
          <span>Mostrando {usuarios.length} de {total} resultados</span>
        </div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <Input
                {...register('nombre', { required: 'Requerido' })}
                placeholder="Ej. Juan"
                error={errors.nombre}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Apellido</label>
              <Input
                {...register('apellido', { required: 'Requerido' })}
                placeholder="Ej. Pérez"
                error={errors.apellido}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Correo Electrónico</label>
            <Input
              {...register('email', { required: 'Requerido' })}
              type="email"
              placeholder="juan@universidad.edu"
              error={errors.email}
            />
          </div>

          {!editingUser && (
            <div>
              <label className="text-sm font-medium mb-1 block">Contraseña</label>
              <Input
                {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                type="password"
                placeholder="••••••••"
                error={errors.password}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Rol</label>
              <select
                {...register('rol')}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editingUser && (
              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <select
                  {...register('activo')}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
