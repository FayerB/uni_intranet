import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/index';
import { useStore } from '../context/useStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function useNotifications() {
  const { user } = useStore();
  const [notificaciones, setNotificaciones] = useState([]);
  const [count, setCount] = useState(0);
  const socketRef = useRef(null);

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notificaciones/count');
      setCount(data.count);
    } catch { /* silencioso */ }
  }, []);

  const fetchRecientes = useCallback(async () => {
    try {
      const { data } = await api.get('/notificaciones?limit=10');
      setNotificaciones(data);
      setCount(data.filter((n) => !n.leida).length);
    } catch { /* silencioso */ }
  }, []);

  const marcarLeida = useCallback(async (id) => {
    await api.patch(`/notificaciones/${id}/leer`);
    setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const marcarTodas = useCallback(async () => {
    await api.patch('/notificaciones/leer-todas');
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setCount(0);
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchRecientes();

    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('notificacion', (notif) => {
      setNotificaciones((prev) => [notif, ...prev].slice(0, 30));
      setCount((c) => c + 1);
    });

    return () => socket.disconnect();
  }, [user, fetchRecientes]);

  return { notificaciones, count, marcarLeida, marcarTodas, refresh: fetchRecientes };
}
