import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const MOCK_USERS = [
  { id: 1, name: 'Ana Silva', email: 'ana@universidad.edu', role: 'Estudiante', status: 'Activo', initial: 'A' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@universidad.edu', role: 'Docente', status: 'Activo', initial: 'C' },
  { id: 3, name: 'Lucía Méndez', email: 'lucia@universidad.edu', role: 'Estudiante', status: 'Inactivo', initial: 'L' },
  { id: 4, name: 'Marcos Díaz', email: 'marcos@universidad.edu', role: 'Admin', status: 'Activo', initial: 'M' },
  { id: 5, name: 'Sofia Castro', email: 'sofia@universidad.edu', role: 'Docente', status: 'Activo', initial: 'S' },
];

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Admin': return 'primary';
      case 'Docente': return 'secondary';
      case 'Estudiante': return 'success';
      default: return 'gray';
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      reset(user);
    } else {
      reset({ name: '', email: '', role: 'Estudiante', status: 'Activo' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = () => {
    Swal.fire({
      icon: 'success',
      title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
      showConfirmButton: false,
      timer: 1500,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (name) => {
    Swal.fire({
      title: `¿Eliminar a ${name}?`,
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Administra accesos y roles del sistema.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Nuevo Usuario
          </Button>
        </motion.div>
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
              <option value="Todos">Todos los roles</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Admin">Admin</option>
            </select>
            <Filter size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredUsers.map((user) => (
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
                  <Badge variant={getRoleBadge(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Activo' ? 'success' : 'gray'}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.name)}
                      className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        <div className="flex items-center justify-between mt-4 px-4 text-sm text-gray-500">
          <span>Mostrando {filteredUsers.length} de {MOCK_USERS.length} resultados</span>
        </div>
      </motion.div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre Completo</label>
            <Input {...register('name', { required: true })} placeholder="Ej. Juan Pérez" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Correo Electrónico</label>
            <Input {...register('email', { required: true })} type="email" placeholder="juan@universidad.edu" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Rol</label>
              <select {...register('role')} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary">
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <select {...register('status')} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
