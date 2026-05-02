import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader } from 'lucide-react';
import { uploadArchivo } from '../../api/archivos';

const fmt = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUploader({ onUpload, entidad_tipo, entidad_id, accept, label = 'Subir archivo' }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError('');
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { data } = await uploadArchivo(
        file,
        entidad_tipo,
        entidad_id,
        (e) => setProgress(Math.round((e.loaded / e.total) * 100))
      );
      onUpload?.(data);
      setFile(null);
      setProgress(0);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
        >
          <Upload size={28} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Arrastra o haz clic — máx. 25 MB</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Archivo seleccionado */}
      {file && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{fmt(file.size)}</p>
            </div>
            {!uploading && (
              <button onClick={() => setFile(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Subiendo...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          {!uploading && (
            <button
              onClick={upload}
              className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              Subir archivo
            </button>
          )}
          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader size={14} className="animate-spin" />
              Procesando...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
