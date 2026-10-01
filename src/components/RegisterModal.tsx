import { useState, useEffect, type FormEvent } from 'react';
import { X, User, Briefcase, MapPin, Clock, Phone, CheckCircle2, Loader2, AlertCircle, ShieldCheck, FileText } from 'lucide-react';
import { NEIGHBORHOODS } from '@/types';
import { registerProfessional } from '@/lib/api';
import { FileUpload } from '@/components/FileUpload';
import { LegalModal } from '@/components/LegalModal';

type LegalSection = 'terms' | 'privacy';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export function RegisterModal({ open, onClose, onRegistered }: RegisterModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [dniFrente, setDniFrente] = useState<string | null>(null);
  const [dniDorso, setDniDorso] = useState<string | null>(null);
  const [fotoMatricula, setFotoMatricula] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSection>('terms');

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setSubmitting(false);
      setError(null);
      setFoto(null);
      setDniFrente(null);
      setDniDorso(null);
      setFotoMatricula(null);
      setConsent(false);
      setLegalOpen(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!foto) {
      setError('La foto de perfil es obligatoria. Subí una imagen para continuar.');
      return;
    }
    if (!dniFrente) {
      setError('La foto del DNI frente es obligatoria. Subí una imagen para continuar.');
      return;
    }
    if (!dniDorso) {
      setError('La foto del DNI dorso es obligatoria. Subí una imagen para continuar.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? ''),
      profession: String(formData.get('profession') ?? ''),
      neighborhood: String(formData.get('neighborhood') ?? ''),
      schedule: String(formData.get('schedule') ?? ''),
      whatsapp: String(formData.get('whatsapp') ?? ''),
      description: String(formData.get('description') ?? ''),
      foto,
      dniFrente,
      dniDorso,
      numeroMatricula: String(formData.get('numeroMatricula') ?? ''),
      fotoMatricula: fotoMatricula ?? undefined,
    };

    try {
      await registerProfessional(payload);
      setSubmitted(true);
      onRegistered();
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
          <h2 className="text-lg font-bold text-white">Registrate como profesional</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Registro enviado!</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Gracias por sumarte a TalentoCrux. Revisaremos tu información y, una vez aprobado, aparecerás en la plataforma.
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

            <Field icon={<User className="w-4 h-4" />} label="Nombre completo">
              <input required name="name" type="text" placeholder="Tu nombre y apellido" className={inputCls} />
            </Field>

            <Field icon={<Briefcase className="w-4 h-4" />} label="Profesión u oficio">
              <input required name="profession" type="text" placeholder="Ej: Electricista, Diseñadora, Plomero…" className={inputCls} />
            </Field>

            <Field icon={<MapPin className="w-4 h-4" />} label="Barrio de CABA">
              <select required name="neighborhood" defaultValue="" className={`${inputCls} appearance-none cursor-pointer`}>
                <option value="" disabled>Seleccioná tu barrio</option>
                {NEIGHBORHOODS.filter((n) => n !== 'Todos los barrios').map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>

            <Field icon={<Clock className="w-4 h-4" />} label="Horarios de atención">
              <input required name="schedule" type="text" placeholder="Ej: Lunes a Viernes de 9 a 18 hs" className={inputCls} />
            </Field>

            <Field icon={<Phone className="w-4 h-4" />} label="Número de WhatsApp">
              <input required name="whatsapp" type="tel" placeholder="Ej: 5491101234567" className={inputCls} />
              <p className="text-[11px] text-slate-400 mt-1 pl-1">Incluí código de país y área, sin + ni espacios.</p>
            </Field>

            <Field icon={<FileText className="w-4 h-4" />} label="Descripción (opcional)">
              <textarea name="description" rows={2} placeholder="Contá sobre tu servicio…" className={`${inputCls} resize-none`} />
            </Field>

            <FileUpload label="Foto de perfil" onChange={setFoto} required hint="JPG o PNG desde tu dispositivo" />

            {/* DNI fields — private, mandatory */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Documentación (privado, obligatorio)
              </p>
              <FileUpload label="DNI Frente" onChange={setDniFrente} required hint="Foto del frente del DNI" />
              <FileUpload label="DNI Dorso" onChange={setDniDorso} required hint="Foto del dorso del DNI" />
            </div>

            {/* Matricula verification section */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-3">
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Verificación de matrícula (opcional)
              </p>
              <p className="text-[11px] text-slate-400 -mt-1">
                Si sos matriculado, completá tu número y subí el comprobante. Un administrador lo verificará antes de mostrar el sello.
              </p>
              <Field icon={<FileText className="w-4 h-4" />} label="Número de matrícula">
                <input name="numeroMatricula" type="text" placeholder="Ej: 12345-6" className={inputCls} />
              </Field>
              <FileUpload label="Comprobante / Foto de matrícula" onChange={setFotoMatricula} hint="Foto del documento de matrícula" />
            </div>

            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                required
                name="consent"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40"
              />
              <p className="text-xs leading-relaxed text-slate-600">
                Acepto los{' '}
                <button type="button" onClick={() => { setLegalSection('terms'); setLegalOpen(true); }} className="font-semibold text-blue-600 hover:underline">Términos y Condiciones</button>
                {' '}y la{' '}
                <button type="button" onClick={() => { setLegalSection('privacy'); setLegalOpen(true); }} className="font-semibold text-blue-600 hover:underline">Política de Privacidad</button>
                {' '}de TalentoCrux.
              </p>
            </div>

            <button type="submit" disabled={submitting || !consent} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enviando…</>) : 'Enviar registro'}
            </button>
          </form>
        )}
      </div>
      <LegalModal
        open={legalOpen}
        initialSection={legalSection}
        onClose={() => setLegalOpen(false)}
        onAccept={() => { setConsent(true); setLegalOpen(false); }}
      />
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
