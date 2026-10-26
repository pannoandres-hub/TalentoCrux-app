import { useState, useEffect, type FormEvent } from 'react';
import { X, User, Phone, Mail, ShieldCheck, Loader2, AlertCircle, MessageCircle, KeyRound, CheckCircle2, GraduationCap } from 'lucide-react';
import type { Professional, Course } from '@/types';
import { startVerification, verifyCode } from '@/lib/api';
import { LegalModal } from '@/components/LegalModal';

type LegalSection = 'terms' | 'privacy';

interface ContactVerificationModalProps {
  open: boolean;
  professional: Professional | null;
  course?: Course | null;
  onClose: () => void;
  onVerified: (whatsapp: string, targetName: string) => void;
}

type Stage = 'form' | 'code' | 'done';

export function ContactVerificationModal({
  open,
  professional,
  course,
  onClose,
  onVerified,
}: ContactVerificationModalProps) {
  const [stage, setStage] = useState<Stage>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactLogId, setContactLogId] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ratingCode, setRatingCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSection>('terms');

  const isCourse = Boolean(course);
  const targetId = course ? course.id : professional?.id ?? '';
  const targetName = course ? course.nombreCurso : professional?.name ?? '';
  const targetSubtitle = course ? `Instructor: ${course.instructor}` : professional?.profession ?? '';
  const targetPhoto = professional?.photo;

  useEffect(() => {
    if (open) {
      setStage('form');
      setSubmitting(false);
      setError(null);
      setContactLogId('');
      setWhatsapp('');
      setRatingCode('');
      setConsent(false);
      setLegalOpen(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || (!professional && !course)) return null;

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    const email = String(formData.get('email') ?? '');

    if (!consent) {
      setError('Debés aceptar los Términos y la Política de Privacidad para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const id = await startVerification(
        targetId,
        name,
        phone,
        email,
        isCourse ? 'course' : 'professional'
      );
      setContactLogId(id);
      setStage('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la verificación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const code = String(formData.get('code') ?? '');

    setSubmitting(true);
    try {
      const result = await verifyCode(contactLogId, code);
      setWhatsapp(result.whatsapp);
      setRatingCode(result.ratingCode);
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto o vencido');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const waMessage = encodeURIComponent(
      isCourse
        ? `Hola ${course?.instructor}, vi el curso '${course?.nombreCurso}' en TalentoCrux y quiero consultar información.`
        : `Hola ${professional?.name}, te encontré en TalentoCrux y necesito consultar por tus servicios.`
    );
    const targetWa = whatsapp || (course ? course.whatsapp : professional?.whatsapp ?? '5491155550101');
    const waLink = `https://wa.me/${targetWa}?text=${waMessage}`;
    window.open(waLink, '_blank', 'noopener,noreferrer');
    onVerified(targetWa, targetName);
    onClose();
  };

  const inputCls =
    'w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-violet-600 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            {isCourse ? <GraduationCap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <h2 className="text-base font-bold">
              {isCourse ? 'Consultar Curso' : `Contactar a ${targetName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            {isCourse ? (
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            ) : targetPhoto ? (
              <img src={targetPhoto} alt={targetName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-400 flex-shrink-0">
                {targetName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{targetName}</p>
              <p className="text-xs text-blue-700 font-semibold truncate">{targetSubtitle}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {stage === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Ingresá tus datos para contactar por WhatsApp. Al completarlo, te generaremos un{' '}
                <strong>código único de calificación</strong> para que a las 2 semanas puedas dejar tu opinión sobre la atención.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input required name="name" type="text" placeholder="Tu nombre y apellido" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Número de teléfono</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input required name="phone" type="tel" placeholder="Ej: 1144558899" className={inputCls} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">Te enviaremos el código de verificación por SMS.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input required name="email" type="email" placeholder="tu@email.com" className={inputCls} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">Recibirás también el código por correo.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40"
                />
                <p className="text-xs leading-relaxed text-slate-600">
                  Acepto los{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalSection('terms');
                      setLegalOpen(true);
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalSection('privacy');
                      setLegalOpen(true);
                    }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Política de Privacidad
                  </button>{' '}
                  de TalentoCrux.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !consent}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando código…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Continuar y verificar
                  </>
                )}
              </button>
            </form>
          )}

          {stage === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-semibold">
                  Ingresá el código de 6 dígitos enviado por SMS/email (código de prueba: <strong>123456</strong>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Código de verificación</label>
                <input
                  required
                  name="code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  defaultValue="123456"
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] py-3 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-200/50 hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar e ir a WhatsApp'}
              </button>

              <button
                type="button"
                onClick={() => setStage('form')}
                className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Volver e ingresar otros datos
              </button>
            </form>
          )}

          {stage === 'done' && (
            <div className="flex flex-col items-center justify-center py-2 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¡Identidad verificada!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Ya podés consultar directamente por WhatsApp.
                </p>
              </div>

              {/* Single-use code card */}
              <div className="w-full p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  Tu código de único uso para calificar a las 2 semanas:
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-200">
                  <span className="font-mono font-black text-base text-blue-700 tracking-wider">
                    {ratingCode || 'TC-8492'}
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    1 solo uso
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Al cumplirse las 2 semanas te enviaremos el enlace para que ingreses tu opinión junto con este código.
                </p>
              </div>

              <button
                onClick={openWhatsApp}
                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-200/50 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir chat de WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      <LegalModal
        open={legalOpen}
        initialSection={legalSection}
        onClose={() => setLegalOpen(false)}
        onAccept={() => {
          setConsent(true);
          setLegalOpen(false);
        }}
      />
    </div>
  );
}
