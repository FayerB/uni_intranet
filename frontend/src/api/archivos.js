import api from './index';

export const uploadArchivo = (file, entidad_tipo, entidad_id, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  if (entidad_tipo) form.append('entidad_tipo', entidad_tipo);
  if (entidad_id)   form.append('entidad_id', entidad_id);
  return api.post('/archivos/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
};

export const deleteArchivo = (id) => api.delete(`/archivos/${id}`);
