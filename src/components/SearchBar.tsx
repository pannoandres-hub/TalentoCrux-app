import { Search, MapPin } from 'lucide-react';
import { CATEGORIES, NEIGHBORHOODS } from '@/types';
import type { CategoryId } from '@/types';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (n: string) => void;
  activeCategory: CategoryId | null;
  onCategoryChange: (c: CategoryId | null) => void;
}

export function SearchBar({
  query,
  onQueryChange,
  neighborhood,
  onNeighborhoodChange,
  activeCategory,
  onCategoryChange,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar: gasista, limpieza, diseñador…"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <select
            value={neighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all cursor-pointer"
          >
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
            activeCategory === null
              ? 'bg-blue-700 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-blue-700 text-white shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
