import { useState } from 'react';
import { useStore } from '../context/useStore';
import Swal from 'sweetalert2';

export function useProfile() {
  const { user, setUser } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = async (data) => {
    setIsSaving(true);
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedUser = {
      ...user,
      ...data,
    };
    
    setUser(updatedUser);
    setIsSaving(false);

    Swal.fire({
      icon: 'success',
      title: 'Perfil actualizado',
      text: 'Tus datos han sido guardados correctamente.',
      confirmButtonColor: '#1e3a8a',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return {
    user,
    isSaving,
    updateProfile,
  };
}
