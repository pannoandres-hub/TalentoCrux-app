import { useRef, useState } from 'react';
import { X, ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/compressImage';

interface FileUploadProps {
  label: string;
  onChange: (base64: string | null) => void;
  required?: boolean;
  hint?: string;
}

export function FileUpload({ label, onChange, required, hint }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setProcessing(true);
    setFileName(file.name);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onChange(compressed);
    } catch {
      setFileName('');
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        required={required}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
      {processing ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-blue-200 bg-blue-50/30">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-xs font-semibold text-blue-500">Procesando imagen…</span>
        </div>
      ) : preview ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden group">
          <img src={preview} alt={label} className="w-full h-32 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="px-3 py-1.5 bg-slate-50 text-[11px] text-slate-500 truncate">{fileName}</div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all"
        >
          <ImageIcon className="w-7 h-7" />
          <span className="text-xs font-semibold">Tocá para subir una imagen</span>
          {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </button>
      )}
    </div>
  );
}
