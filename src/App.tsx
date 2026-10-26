import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { ProfessionalProfile } from '@/components/ProfessionalProfile';
import { ContactVerificationModal } from '@/components/ContactVerificationModal';
import { RegisterModal } from '@/components/RegisterModal';
import { CourseModal } from '@/components/CourseModal';
import { AdvertiseModal } from '@/components/AdvertiseModal';
import { CoursesView } from '@/components/CoursesView';
import { AdCard } from '@/components/AdCard';
import { InterstitialAd } from '@/components/InterstitialAd';
import { LegalPage } from '@/components/LegalPage';
import { ReviewPage } from '@/components/ReviewPage';
import { AdminPanel } from '@/components/AdminPanel';
import {
  fetchProfessionals,
  fetchAds,
  incrementProfessionalClicks,
  incrementAdClicks,
  incrementCourseClicks,
} from '@/lib/api';
import type { CategoryId, Professional, Ad, Course } from '@/types';
import { SearchX, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';

type View = 'home' | 'courses' | 'legal' | 'review' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [reviewToken, setReviewToken] = useState('');

  // Modals
  const [registerOpen, setRegisterOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [advertiseOpen, setAdvertiseOpen] = useState(false);
  const [profileProf, setProfileProf] = useState<Professional | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [verifyProf, setVerifyProf] = useState<Professional | null>(null);
  const [verifyCourse, setVerifyCourse] = useState<Course | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Interstitial
  const [interstitialAd, setInterstitialAd] = useState<Ad | null>(null);
  const [pendingWaLink, setPendingWaLink] = useState<string | null>(null);

  // Data
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [neighborhood, setNeighborhood] = useState('Todos los barrios');
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  // Hash-based routing
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === '/terminos') {
        setView('legal');
      } else if (hash === '/cursos') {
        setView('courses');
      } else if (hash === '/admin') {
        setView('admin');
      } else if (hash.startsWith('/calificar/')) {
        setReviewToken(hash.replace('/calificar/', ''));
        setView('review');
      } else {
        setView('home');
      }
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  const navigateTo = (v: View) => {
    if (v === 'legal') window.location.hash = '/terminos';
    else if (v === 'courses') window.location.hash = '/cursos';
    else if (v === 'admin') window.location.hash = '/admin';
    else window.location.hash = '';
    setView(v);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [proData, adData] = await Promise.all([
        fetchProfessionals(),
        fetchAds().catch(() => [] as Ad[]),
      ]);
      setProfessionals(proData);
      setAds(adData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los profesionales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'home') load();
  }, [view, load]);

  const filtered = useMemo(() => {
    return professionals.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.profession.toLowerCase().includes(query.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(query.toLowerCase());
      const matchesNeighborhood =
        neighborhood === 'Todos los barrios' || p.neighborhood === neighborhood;
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesQuery && matchesNeighborhood && matchesCategory;
    });
  }, [professionals, query, neighborhood, activeCategory]);

  // ── Contact handlers ──

  const handleProfessionalContact = useCallback(
    (p: Professional) => {
      incrementProfessionalClicks(p.id).catch(() => {});
      setVerifyCourse(null);
      setVerifyProf(p);
      setVerifyOpen(true);
    },
    []
  );

  const handleCourseContact = useCallback(
    (c: Course) => {
      incrementCourseClicks(c.id).catch(() => {});
      setVerifyProf(null);
      setVerifyCourse(c);
      setVerifyOpen(true);
    },
    []
  );

  const handleVerified = useCallback(
    (whatsapp: string, targetName: string) => {
      const isCourse = Boolean(verifyCourse);
      const waMessage = encodeURIComponent(
        isCourse
          ? `Hola, vi tu curso '${verifyCourse?.nombreCurso}' en TalentoCrux y quiero solicitar más información.`
          : `Hola ${verifyProf?.name || targetName}, te encontré en TalentoCrux y necesito consultar por tus servicios.`
      );
      const waLink = `https://wa.me/${whatsapp}?text=${waMessage}`;
      if (ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setPendingWaLink(waLink);
        setInterstitialAd(randomAd);
      } else {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }
    },
    [ads, verifyProf, verifyCourse]
  );

  const handleAdClick = useCallback((ad: Ad) => {
    incrementAdClicks(ad.id).catch(() => {});
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleInterstitialComplete = useCallback(() => {
    setInterstitialAd(null);
    if (pendingWaLink) {
      window.open(pendingWaLink, '_blank', 'noopener,noreferrer');
      setPendingWaLink(null);
    }
  }, [pendingWaLink]);

  // ── Profile handler ──
  const handleProfile = useCallback((p: Professional) => {
    setProfileProf(p);
    setProfileOpen(true);
  }, []);

  // ── Render grid ──
  const renderGrid = () => {
    const items: React.ReactNode[] = [];
    let adIndex = 0;
    filtered.forEach((p, i) => {
      items.push(
        <div key={p.id} className="card-enter" style={{ animationDelay: `${i * 60}ms` }}>
          <ProfessionalCard professional={p} onContact={handleProfessionalContact} onProfile={handleProfile} />
        </div>
      );
      if ((i + 1) % 3 === 0 && ads.length > 0) {
        const ad = ads[adIndex % ads.length];
        adIndex++;
        if (ad.imagenUrl || ad.linkVideo) {
          items.push(
            <div key={`ad-${i}`} className="sm:col-span-2 lg:col-span-3">
              <AdCard ad={ad} onClick={handleAdClick} />
            </div>
          );
        }
      }
    });
    return items;
  };

  // ── Footer ──
  const Footer = () => (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://drive.google.com/thumbnail?id=1ZFie6HPH6APbh4fxmAVdHfGbbIAPBd4C&sz=w500"
              alt="TalentoCrux"
              className="h-8 w-auto rounded-md"
            />
            <span className="font-bold text-slate-800">TalentoCrux</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <button onClick={() => navigateTo('legal')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-semibold transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Términos y Condiciones
            </button>
            <button onClick={() => navigateTo('legal')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-semibold transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              Política de Privacidad
            </button>
            <button onClick={() => navigateTo('admin')} className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold transition-colors bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Panel Admin (/#/admin)
            </button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            © 2026 TalentoCrux. Todos los derechos reservados. El punto donde encontrás la solución que buscás en CABA.
          </p>
          <p className="text-[11px] text-slate-400">
            Extensión de administración: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-semibold">/#/admin</code>
          </p>
        </div>
      </div>
    </footer>
  );

  // ── Admin view ──
  if (view === 'admin') {
    return <AdminPanel onExit={() => navigateTo('home')} />;
  }

  // ── Review view ──
  if (view === 'review') {
    return <ReviewPage token={reviewToken} onBack={() => navigateTo('home')} />;
  }

  // ── Legal page view ──
  if (view === 'legal') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <LegalPage onBack={() => navigateTo('home')} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onRegisterClick={() => setRegisterOpen(true)}
        onCourseClick={() => navigateTo('courses')}
        onTeachClick={() => setCourseModalOpen(true)}
        onAdvertiseClick={() => setAdvertiseOpen(true)}
        onLogoClick={() => navigateTo('home')}
      />

      {view === 'courses' ? (
        <CoursesView onBack={() => navigateTo('home')} onContactCourse={handleCourseContact} />
      ) : (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-violet-700 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-52 h-52 bg-violet-300 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
                Encontrá al profesional que necesitás
              </h2>
              <p className="text-sm sm:text-lg text-blue-100 mt-2 max-w-2xl">
                Conectá con trabajadores independientes de tu barrio en Buenos Aires. Rápido, directo y sin intermediarios.
              </p>
            </div>
          </section>

          {/* Search & filters */}
          <section className="sticky top-16 sm:top-20 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                neighborhood={neighborhood}
                onNeighborhoodChange={setNeighborhood}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </section>

          {/* Results */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-sm text-slate-500">Cargando profesionales…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No pudimos cargar los profesionales</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">{error}</p>
                <button onClick={load} className="mt-5 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
                  Reintentar
                </button>
              </div>
            ) : filtered.length > 0 ? (
              <>
                <p className="text-sm text-slate-500 mb-4">
                  {filtered.length} {filtered.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {renderGrid()}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">No encontramos resultados</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  Probá con otra palabra clave, cambiá el barrio o quitá el filtro de categoría.
                </p>
                <button
                  onClick={() => { setQuery(''); setNeighborhood('Todos los barrios'); setActiveCategory(null); }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>

          <Footer />
        </>
      )}

      {/* Modals */}
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onRegistered={load} />
      <CourseModal open={courseModalOpen} onClose={() => setCourseModalOpen(false)} />
      <AdvertiseModal open={advertiseOpen} onClose={() => setAdvertiseOpen(false)} />
      <ProfessionalProfile professional={profileProf} open={profileOpen} onClose={() => setProfileOpen(false)} onContact={handleProfessionalContact} />
      <ContactVerificationModal
        professional={verifyProf}
        course={verifyCourse}
        open={verifyOpen}
        onClose={() => {
          setVerifyOpen(false);
          setVerifyProf(null);
          setVerifyCourse(null);
        }}
        onVerified={handleVerified}
      />

      {/* Interstitial */}
      <InterstitialAd ad={interstitialAd} onComplete={handleInterstitialComplete} />
    </div>
  );
}
