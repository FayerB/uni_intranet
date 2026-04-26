import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/useStore';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser = {
        id: 1,
        name: 'Administrador Demo',
        email: data.email,
        role: 'admin',
      };

      localStorage.setItem('token', 'mock-jwt-token');
      setUser(mockUser);
      navigate('/dashboard');
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'Credenciales inválidas. Por favor, intente nuevamente.',
        confirmButtonColor: '#1e3a8a',
        customClass: {
          popup: 'rounded-2xl',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left side - Presentation (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-center items-center text-white p-12">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary blur-3xl" />
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary-400 blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-lg text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
              <BookOpen size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Bienvenido a UniIntranet
          </h1>
          <p className="text-lg text-primary-100 font-light leading-relaxed">
            Plataforma académica integral diseñada para impulsar la excelencia educativa.
            Gestiona tus cursos, notas y horarios de manera eficiente y moderna.
          </p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo on mobile */}
          <div className="lg:hidden flex items-center space-x-3 mb-10">
            <div className="p-2 bg-primary rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">UniIntranet</span>
          </div>

          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Correo Electrónico
              </label>
              <Input
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/i,
                    message: 'Correo electrónico inválido',
                  },
                })}
                type="email"
                placeholder="usuario@universidad.edu"
                icon={Mail}
                error={errors.email}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
                />
                <span>Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    title: 'Recuperar Contraseña',
                    input: 'email',
                    inputLabel: 'Ingresa tu correo institucional',
                    inputPlaceholder: 'usuario@universidad.edu',
                    showCancelButton: true,
                    confirmButtonText: 'Enviar enlace',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#1e3a8a',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Swal.fire('¡Enviado!', 'Revisa tu bandeja de entrada para restablecer tu contraseña.', 'success');
                    }
                  });
                }}
                className="text-sm font-medium text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full text-base py-6"
              isLoading={isLoading}
            >
              Ingresar al portal
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            ¿Problemas para ingresar?{' '}
            <button 
              type="button"
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Soporte IT',
                  text: 'Puedes comunicarte al anexo 1234 o enviar un correo a soporte@universidad.edu para asistencia técnica inmediata.',
                  confirmButtonColor: '#1e3a8a',
                });
              }}
              className="font-medium text-primary hover:underline"
            >
              Contactar a soporte IT
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
