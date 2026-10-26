import { useState, useEffect } from 'react';
import {
  X, Star, MapPin, Clock, MessageCircle, ShieldCheck, Sparkles, Loader2,
  MessageSquare, ThumbsUp
} from 'lucide-react';
import type { Professional } from '@/types';
import { fetchProfessionalReviews, type Review } from '@/lib/api';

interface ProfessionalProfileProps {
  professional: Professional | null;
  open: boolean;
  onClose: () => void;
  onContact: (professional: Professional) => void;
}

export function ProfessionalProfile({ professional, open, onClose, onContact }: ProfessionalProfileProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  useEffect(() => {
    if (open && professional) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
      setStarFilter('all');
      setVisibleCount(10);
      fetchProfessionalReviews(professional.id)
        .then((data) => {
          setReviews(data);
        })
        .catch(() => setReviews([]))
        .finally(() => setLoading(false));
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, professional]);

  if (!open || !professional) return null;

  const isNew = professional.reviews === 0 || professional.rating === 0;
  const hasRating = professional.reviews > 0 && professional.rating > 0;

  const filteredReviews = reviews.filter((r) => {
    if (starFilter === 'all') return true;
    return r.rating === starFilter;
  });

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
        {/* Header with photo */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
          {professional.photo ? (
            <img src={professional.photo} alt={professional.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-6xl font-bold text-slate-300">{professional.name.charAt(0)}</span>
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 shadow-md text-slate-600 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
          {hasRating && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-800">{professional.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({professional.reviews})</span>
            </div>
          )}
          {isNew && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-2 rounded-full bg-violet-600 text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Profesional Nuevo</span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{professional.name}</h2>
                <p className="text-sm text-blue-700 font-semibold mt-0.5">{professional.profession}</p>
              </div>
              {professional.verificado && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold whitespace-nowrap flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Matriculado
                </span>
              )}
            </div>

            {professional.description && (
              <p className="text-sm text-slate-600 leading-relaxed mt-3">{professional.description}</p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-500 mt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{professional.neighborhood}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{professional.schedule}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {/* Contact button */}
          <div>
            <button
              onClick={() => onContact(professional)}
              className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-200/50 hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar por WhatsApp
            </button>
          </div>

          {/* Reviews wall: Full view of all opinions */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Opiniones y calificaciones ({reviews.length})
                </h3>
              </div>
              {reviews.length > 0 && (
                <span className="text-xs text-slate-400 font-medium">
                  {filteredReviews.length} visibles
                </span>
              )}
            </div>

            {hasRating && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-amber-600">{professional.rating.toFixed(1)}</p>
                    <div className="flex gap-0.5 justify-center mt-1">{renderStars(professional.rating)}</div>
                  </div>
                  <div className="border-l border-amber-200 pl-4">
                    <p className="text-sm font-bold text-slate-800">
                      {reviews.length} {reviews.length === 1 ? 'opinión verificada' : 'opiniones verificadas'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Todas las calificaciones provienen de clientes que contactaron al profesional</p>
                  </div>
                </div>

                {/* Rating filter pills */}
                <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => { setStarFilter('all'); setVisibleCount(10); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      starFilter === 'all'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-100/50'
                    }`}
                  >
                    Todas ({reviews.length})
                  </button>
                  <button
                    onClick={() => { setStarFilter(5); setVisibleCount(10); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      starFilter === 5
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-100/50'
                    }`}
                  >
                    5 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> ({reviews.filter((r) => r.rating === 5).length})
                  </button>
                  <button
                    onClick={() => { setStarFilter(4); setVisibleCount(10); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      starFilter === 4
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-100/50'
                    }`}
                  >
                    4 <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> ({reviews.filter((r) => r.rating === 4).length})
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {displayedReviews.map((review, idx) => (
                  <div key={review.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold border border-green-100">
                          <ThumbsUp className="w-2.5 h-2.5" /> Verificado
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(review.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}

                {/* Show more button if there are more reviews */}
                {visibleCount < filteredReviews.length && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Ver más opiniones ({filteredReviews.length - visibleCount} restantes)
                  </button>
                )}

                {filteredReviews.length > 10 && visibleCount >= filteredReviews.length && (
                  <p className="text-center text-xs text-slate-400 py-2">
                    Has visto las {filteredReviews.length} opiniones registradas.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Todavía no hay opiniones para este profesional.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Las opiniones aparecen después de que los clientes contactan al profesional y completan su calificación a las 2 semanas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
