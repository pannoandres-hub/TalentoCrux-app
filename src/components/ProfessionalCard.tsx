import { Star, MapPin, Clock, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import type { Professional } from '@/types';

interface ProfessionalCardProps {
  professional: Professional;
  onContact: (professional: Professional) => void;
}

export function ProfessionalCard({ professional, onContact }: ProfessionalCardProps) {
  const isNew = professional.reviews === 0 || professional.rating === 0;
  const hasRating = professional.reviews > 0 && professional.rating > 0;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
        {professional.photo ? (
          <img
            src={professional.photo}
            alt={professional.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-4xl font-bold text-slate-300">
              {professional.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {hasRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">{professional.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({professional.reviews})</span>
          </div>
        )}
        {isNew && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-violet-600 text-white shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-bold">Profesional Nuevo</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-tight">{professional.name}</h3>
            <p className="text-sm text-blue-700 font-semibold mt-0.5">{professional.profession}</p>
          </div>
          {professional.verificado && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold whitespace-nowrap flex-shrink-0">
              <ShieldCheck className="w-3 h-3" />
              Matriculado
            </span>
          )}
        </div>

        {professional.description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {professional.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{professional.neighborhood}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{professional.schedule}</span>
          </div>
        </div>

        {/* WhatsApp button */}
        <button
          onClick={() => onContact(professional)}
          className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-200/50 hover:shadow-lg hover:shadow-green-300/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Contactar por WhatsApp
        </button>
      </div>
    </article>
  );
}
