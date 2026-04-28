/**
 * Ejecuta una llamada a la API y devuelve los datos.
 * Si el endpoint falla (red caída, 404, 500, etc.), retorna `fallback`
 * para que la página siga funcionando con datos de demostración.
 *
 * @param {Promise} request       - Promesa de axios (api.get/post/etc.)
 * @param {*}       fallback      - Datos a usar si el request falla
 * @returns {Promise<*>}          - data real o fallback
 */
export async function fetchSafe(request, fallback) {
  try {
    const res = await request;
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    // Rethrow auth errors — deja que el interceptor de axios maneje el 401
    if (status === 401) throw err;

    console.warn(
      `[fetchSafe] Endpoint no disponible${status ? ` (${status})` : ''} — usando datos de demostración.`,
      err?.config?.url ?? ''
    );
    return fallback;
  }
}
