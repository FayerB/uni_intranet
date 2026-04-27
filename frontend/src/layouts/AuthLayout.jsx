import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../context/useStore';

export default function AuthLayout() {
  const { user } = useStore();
  const hasSession = Boolean(user && localStorage.getItem('token'));

  if (hasSession) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Outlet />
    </div>
  );
}
