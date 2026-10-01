import { useState, useEffect, useMemo } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { fetchCourses } from '@/lib/api';
import type { Course } from '@/types';
import { Loader2, AlertCircle, SearchX, ArrowLeft, Search } from 'lucide-react';

interface CoursesViewProps {
  onBack: () => void;
  onContactCourse: (course: Course) => void;
}

export function CoursesView({ onBack, onContactCourse }: CoursesViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los cursos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return courses;
    const q = query.toLowerCase();
    return courses.filter(
      (c) =>
        c.nombreCurso.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sub-header */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cursos…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Cursos disponibles</h2>
          <p className="text-sm text-slate-500 mt-1">Capacitate con los mejores instructores de CABA.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Cargando cursos…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No pudimos cargar los cursos</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {filtered.length} {filtered.length === 1 ? 'curso disponible' : 'cursos disponibles'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((c, i) => (
                <div key={c.id} className="card-enter" style={{ animationDelay: `${i * 80}ms` }}>
                  <CourseCard course={c} onContact={onContactCourse} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {query ? 'No encontramos cursos' : 'Todavía no hay cursos publicados'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {query ? 'Probá con otra palabra clave.' : 'Volvé pronto para ver nuevos cursos.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
