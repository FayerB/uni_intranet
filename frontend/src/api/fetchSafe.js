/**
 * Ejecuta una llamada a la API y devuelve los datos.
 * - Si el endpoint responde correctamente → devuelve los datos reales.
 * - Si hay 401 → el interceptor de axios ya maneja logout/redirect; retorna fallback
 *   para evitar errores en el componente mientras React navega.
 * - Cualquier otro error (red, 404, 500) → devuelve fallback con datos de demostración.
 */
export async function fetchSafe(request, fallback = []) {
  try {
    const res = await request;
    return res.data;
  } catch (err) {
    const status = err?.response?.status;

    if (status === 401) {
      // El interceptor ya despachó 'auth:expired' y limpiará el token.
      // Retornamos fallback silenciosamente — el componente se desmontará pronto.
      return fallback;
    }

    if (status !== 404) {
      // 404 es esperado en endpoints no implementados; otros errores sí se loguean.
      console.warn(
        `[fetchSafe] Error ${status ?? 'de red'} — usando datos de demostración.`,
        err?.config?.url ?? ''
      );
    }

    return fallback;
  }
}
