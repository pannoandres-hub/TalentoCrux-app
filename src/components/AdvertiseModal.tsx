import { useState, useEffect, type FormEvent } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle, Megaphone, ChevronRight, ChevronLeft, Landmark, Mail } from 'lucide-react';
import { fetchPlans, registerAdvert } from '@/lib/api';
import type { Plan } from '@/types';
import { FileUpload } from '@/components/FileUpload';
import { LegalModal } from '@/components/LegalModal';

type LegalSection = 'terms' | 'privacy';

interface AdvertiseModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdvertiseModal({ open, onClose }: AdvertiseModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSection>('terms');

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedPlan(null);
      setSubmitting(false);
      setError(null);
      setImagenUrl(null);
      setConsent(false);
      setLegalOpen(false);
      document.body.style.overflow = 'hidden';
      (async () => {
        setLoadingPlans(true);
        try {
          const data = await fetchPlans();
          setPlans(data);
        } catch {
          setPlans([]);
        } finally {
          setLoadingPlans(false);
        }
      })();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setError(null);

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const planNombre = String(
      (selectedPlan && (selectedPlan.nombre || (selectedPlan as any).title)) || 'Plan Básico'
    );
    try {
      await registerAdvert({
        planNombre,
        titulo: String(formData.get('titulo') ?? ''),
        descripcion: String(formData.get('descripcion') ?? ''),
        link: String(formData.get('link') ?? ''),
        imagenUrl,
        linkVideo: String(formData.get('linkVideo') ?? ''),
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-violet-600 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Quiero publicitar
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 px-5 pt-4">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
        )}

        {/* Step 1: Plan selection */}
        {step === 1 && (
          <div className="px-5 py-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">Elegí tu plan de publicidad</h3>
            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setSelectedPlan(plan); setStep(2); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{plan.nombre}</h4>
                      {plan.duracionDias > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">{plan.duracionDias} días de publicación</p>
                      )}
                      {plan.descripcion && <p className="text-xs text-slate-400 mt-1">{plan.descripcion}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${plan.precioARS}</p>
                      <p className="text-[10px] text-slate-400">ARS</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No hay planes disponibles en este momento.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Advertiser form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Volver a planes
            </button>

            {selectedPlan && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold">Plan seleccionado: {selectedPlan.nombre} — ${selectedPlan.precioARS} ARS</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Field label="Título del anuncio">
              <input required name="titulo" type="text" placeholder="Ej: Promo en pinturería" className={inputCls} />
            </Field>
            <Field label="Descripción">
              <textarea required name="descripcion" rows={2} placeholder="Contá sobre tu servicio o promo…" className={`${inputCls} resize-none`} />
            </Field>
            <Field label="Link (opcional)">
              <input name="link" type="url" placeholder="https://…" className={inputCls} />
            </Field>
            <FileUpload label="Imagen del anuncio (opcional)" onChange={setImagenUrl} hint="JPG o PNG desde tu dispositivo" />
            <Field label="Enlace del Video (opcional)">
              <input name="linkVideo" type="url" placeholder="YouTube, Instagram, TikTok, Drive…" className={inputCls} />
            </Field>

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
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enviando…</>) : (<>Confirmar y ver datos de pago <ChevronRight className="w-4 h-4" /></>)}
            </button>
          </form>
        )}

        {/* Step 3: Bank details */}
        {step === 3 && (
          <div className="px-5 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Solicitud recibida!</h3>
            <p className="text-sm text-slate-500 mt-2 mb-5">Tu anuncio quedó en estado "Pendiente". Para activarlo, realizá el pago:</p>
            <div className="text-left space-y-3 mb-5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Landmark className="w-3.5 h-3.5" />CBU</div>
                <p className="text-sm font-mono font-bold text-slate-800 select-all">0000003100098621480912</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Landmark className="w-3.5 h-3.5" />Alias</div>
                <p className="text-sm font-mono font-bold text-slate-800 select-all">admin.crux</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Mail className="w-3.5 h-3.5" />Email de contacto y pago</div>
                <p className="text-sm font-bold text-slate-800 select-all">admin@cruxtalento.com</p>
              </div>
            </div>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
              Cerrar
            </button>
          </div>
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

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
