import { useState, useEffect, useMemo } from 'react';
import { CourseCard } from '@/components/CourseCard';
import { fetchCourses, fetchCourseReviews, type Review } from '@/lib/api';
import type { Course } from '@/types';
import { Loader2, AlertCircle, SearchX, ArrowLeft, Search, Star, X, GraduationCap, MessageCircle } from 'lucide-react';

interface CoursesViewProps {
  onBack: () => void;
  onContactCourse: (course: Course) => void;
}

export function CoursesView({ onBack, onContactCourse }: CoursesViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Course reviews modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseReviews, setCourseReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  const handleOpenReviews = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingReviews(true);
    try {
      const data = await fetchCourseReviews(course.id);
      setCourseReviews(data);
    } catch {
      setCourseReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

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
              placeholder="Buscar cursos por nombre, instructor o tema…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Cursos y Talleres disponibles</h2>
          <p className="text-sm text-slate-500 mt-1">
            Capacitate con los mejores instructores de CABA. Cada curso incluye opiniones verificadas de alumnos.
          </p>
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
                  <CourseCard
                    course={c}
                    onContact={onContactCourse}
                    onViewReviews={handleOpenReviews}
                  />
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
              {query ? 'No encontramos cursos con esa búsqueda' : 'Todavía no hay cursos publicados'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {query ? 'Probá con otra palabra clave o volvé a ver todos.' : 'Volvé pronto para ver nuevas capacitaciones.'}
            </p>
          </div>
        )}
      </main>

      {/* Course Reviews Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCourse(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 to-violet-600 text-white flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold mb-1">
                  <GraduationCap className="w-4 h-4" />
                  OPINIONES DEL CURSO
                </div>
                <h3 className="text-base sm:text-lg font-bold leading-snug">{selectedCourse.nombreCurso}</h3>
                <p className="text-xs text-blue-100 mt-0.5">Instructor: {selectedCourse.instructor}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-white/80 hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score header */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-amber-950">
                  {(selectedCourse.rating_avg ?? 5.0).toFixed(1)}
                </span>
                <span className="text-xs text-amber-800 font-semibold">de 5 estrellas</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-900 shadow-sm">
                {courseReviews.length} {courseReviews.length === 1 ? 'opinión verificada' : 'opiniones verificadas'}
              </span>
            </div>

            {/* Reviews list */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {loadingReviews ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-400">Cargando opiniones del curso…</p>
                </div>
              ) : courseReviews.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Todavía no hay opiniones para este curso. Los alumnos que lo contactan pueden calificar a las 2 semanas con su código de único uso.
                </div>
              ) : (
                courseReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const c = selectedCourse;
                  setSelectedCourse(null);
                  onContactCourse(c);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
