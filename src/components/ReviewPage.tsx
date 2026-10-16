import { useState, useEffect } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { checkReviewToken, submitReview } from '@/lib/api';

interface ReviewPageProps {
  token: string;
  onBack: () => void;
}

type State = 'loading' | 'valid' | 'used' | 'expired' | 'submitted';

export function ReviewPage({ token, onBack }: ReviewPageProps) {
  const [state, setState] = useState<State>('loading');
  const [profName, setProfName] = useState('');
  const [profProfession, setProfProfession] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    checkReviewToken(token)
      .then((data) => {
        if (data.professionalName) {
          setProfName(data.professionalName);
          setProfProfession(data.professionalProfession ?? '');
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
      setError('Seleccioná una calificación de 1 a 5 estrellas.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(token, rating, comment);
      setState('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-violet-600">
          <h1 className="text-lg font-bold text-white">Calificar profesional</h1>
        </div>

        <div className="p-5 sm:p-7">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Verificando enlace…</p>
            </div>
          )}

          {state === 'expired' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Enlace no válido</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">Este enlace ha vencido o no es válido. Si crees que es un error, contactate con TalentoCrux.</p>
              <button onClick={onBack} className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
                Volver al inicio
              </button>
            </div>
          )}

          {state === 'used' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Ya utilizaste este enlace</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">
                {profName ? `Ya calificaste a ${profName}.` : 'Este enlace ya fue utilizado.'} Cada contacto solo puede calificarse una vez.
              </p>
              <button onClick={onBack} className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
                Volver al inicio
              </button>
            </div>
          )}

          {state === 'submitted' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">¡Gracias por tu opinión!</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">Tu calificación será publicada después de que el equipo de TalentoCrux la revise. Esto ayuda a otros usuarios a elegir mejor.</p>
              <button onClick={onBack} className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
                Volver al inicio
              </button>
            </div>
          )}

          {state === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Tu opinión sobre</p>
                <h2 className="text-xl font-bold text-slate-900">{profName}</h2>
                <p className="text-sm text-blue-700 font-semibold">{profProfession}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 text-center">¿Cómo calificarías el servicio?</label>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${(hoverRating || rating) > i ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-xs text-slate-500 mt-2 font-semibold">
                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tu comentario (opcional)</label>
                <textarea
                  name="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contá cómo fue tu experiencia con este profesional…"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || rating < 1}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enviando…</>) : 'Enviar calificación'}
              </button>
            </form>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100">
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold">
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver a TalentoCrux
          </button>
        </div>
      </div>
    </div>
  );
}
