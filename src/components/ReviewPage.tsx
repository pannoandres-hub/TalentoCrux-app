import { useState, useEffect } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2, ChevronLeft, KeyRound, User, GraduationCap, Info } from 'lucide-react';
import { checkReviewToken, submitReview } from '@/lib/api';

interface ReviewPageProps {
  token: string;
  onBack: () => void;
}

type State = 'loading' | 'valid' | 'used' | 'expired' | 'submitted';

export function ReviewPage({ token, onBack }: ReviewPageProps) {
  const [state, setState] = useState<State>('loading');
  const [targetType, setTargetType] = useState<'professional' | 'course'>('professional');
  const [targetName, setTargetName] = useState('');
  const [targetProfession, setTargetProfession] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingCode, setRatingCode] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    checkReviewToken(token)
      .then((data) => {
        if (data.professionalName) {
          setTargetName(data.professionalName);
          setTargetProfession(data.professionalProfession ?? '');
          setTargetType(data.targetType ?? 'professional');
        }
        if (data.valid) {
          setState('valid');
        } else {
          setState('used');
        }
      })
      .catch(() => setState('expired'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Por favor seleccioná una calificación de 1 a 5 estrellas.');
      return;
    }
    const cleanCode = ratingCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Debés ingresar el código de calificación de único uso.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitReview(token, rating, comment, cleanCode, authorName);
      setState('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {targetType === 'course' ? (
              <GraduationCap className="w-5 h-5 text-blue-200" />
            ) : (
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            )}
            <h1 className="text-base font-bold">
              {targetType === 'course' ? 'Calificar Curso / Taller' : 'Calificar Profesional'}
            </h1>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
            TalentoCrux
          </span>
        </div>

        <div className="p-5 sm:p-7">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Verificando enlace de calificación…</p>
            </div>
          )}

          {state === 'expired' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Enlace no disponible</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">
                No pudimos validar este enlace. Si crees que se trata de un error, contactate con el equipo de TalentoCrux.
              </p>
              <button
                onClick={onBack}
                className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {state === 'used' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Enlace ya utilizado</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">
                {targetName ? `Ya calificaste a ${targetName}.` : 'Este enlace ya fue utilizado.'}{' '}
                Cada código de contacto permite una única calificación para mantener la transparencia.
              </p>
              <button
                onClick={onBack}
                className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {state === 'submitted' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">¡Muchas gracias por tu opinión!</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed">
                Tu comentario y calificación fueron registrados con éxito. Tu opinión ayuda a la comunidad de vecinos de CABA a elegir con confianza.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                Tu código de único uso ha sido validado correctamente y no podrá volver a usarse.
              </div>
              <button
                onClick={onBack}
                className="mt-6 px-6 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 transition-colors shadow"
              >
                Volver a TalentoCrux
              </button>
            </div>
          )}

          {state === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  {targetType === 'course' ? 'Estás calificando el curso:' : 'Estás calificando a:'}
                </p>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{targetName}</h2>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">{targetProfession}</p>
              </div>

              {/* Star selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  ¿Cómo calificarías tu experiencia? <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 p-1"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          (hoverRating || rating) > i
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-xs text-slate-600 mt-1 font-bold">
                    {['', '1/5 — Muy malo', '2/5 — Malo', '3/5 — Regular', '4/5 — Bueno', '5/5 — Excelente'][rating]}
                  </p>
                )}
              </div>

              {/* Single-use code input + explanation */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">¿Dónde encuentro mi código?</span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      El código de único uso (ejemplo: <strong>TC-7412</strong>) está en el mensaje que te enviamos por WhatsApp o email al cumplirse las 2 semanas desde tu contacto.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Código de calificación de único uso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      required
                      type="text"
                      value={ratingCode}
                      onChange={(e) => setRatingCode(e.target.value.toUpperCase())}
                      placeholder="Ej: TC-7412"
                      maxLength={12}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-amber-300 bg-white text-sm font-mono font-bold tracking-wider text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cada contacto tiene un código irrepetible para asegurar que solo clientes reales califiquen.
                  </p>
                </div>
              </div>

              {/* Author name input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tu nombre o apodo (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ej: Luciana H. o Tu Nombre"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              {/* Comment textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tu comentario u opinión
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contá cómo fue la puntualidad, el trato, el trabajo realizado o el contenido del curso…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || rating < 1 || !ratingCode.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando código y enviando…
                  </>
                ) : (
                  'Enviar mi opinión'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver a TalentoCrux
          </button>
          <span className="text-[11px] text-slate-400">Buenos Aires, CABA</span>
        </div>
      </div>
    </div>
  );
}
