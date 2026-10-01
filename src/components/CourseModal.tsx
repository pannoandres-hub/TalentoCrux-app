import { useState, useEffect, type FormEvent } from 'react';
import { X, User, Phone, Mail, BookOpen, FileText, Clock, DollarSign, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { registerCourse } from '@/lib/api';

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CourseModal({ open, onClose }: CourseModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setSubmitting(false);
      setError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await registerCourse({
        instructor: String(formData.get('instructor') ?? ''),
        whatsapp: String(formData.get('whatsapp') ?? ''),
        email: String(formData.get('email') ?? ''),
        nombreCurso: String(formData.get('nombreCurso') ?? ''),
        descripcion: String(formData.get('descripcion') ?? ''),
        duracionHoras: String(formData.get('duracionHoras') ?? ''),
        precioARS: Number(formData.get('precioARS') ?? 0),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-violet-600 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Enseñá lo que sabés</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Solicitud recibida!</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Te enviamos un correo a tu email con las instrucciones de pago y activación. Ante dudas escribe a admin@cruxtalento.com.
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Field icon={<User className="w-4 h-4" />} label="Nombre del instructor">
              <input required name="instructor" type="text" placeholder="Tu nombre y apellido" className={inputCls} />
            </Field>
            <Field icon={<Phone className="w-4 h-4" />} label="Contacto de WhatsApp">
              <input required name="whatsapp" type="tel" placeholder="Ej: 5491101234567" className={inputCls} />
            </Field>
            <Field icon={<Mail className="w-4 h-4" />} label="Email">
              <input required name="email" type="email" placeholder="tu@email.com" className={inputCls} />
            </Field>
            <Field icon={<BookOpen className="w-4 h-4" />} label="Nombre del curso">
              <input required name="nombreCurso" type="text" placeholder="Ej: Reparación de celulares nivel inicial" className={inputCls} />
            </Field>
            <Field icon={<FileText className="w-4 h-4" />} label="Descripción del curso">
              <textarea required name="descripcion" rows={3} placeholder="Contá de qué trata el curso, qué van a aprender…" className={`${inputCls} resize-none`} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Clock className="w-4 h-4" />} label="Duración (hs)">
                <input required name="duracionHoras" type="number" min="1" placeholder="Ej: 20" className={inputCls} />
              </Field>
              <Field icon={<DollarSign className="w-4 h-4" />} label="Precio (ARS)">
                <input required name="precioARS" type="number" min="0" placeholder="Ej: 15000" className={inputCls} />
              </Field>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enviando…</>) : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}
