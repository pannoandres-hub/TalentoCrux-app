import { useState, useEffect, useCallback } from 'react';
import {
  LogOut, Loader2, AlertCircle, CheckCircle2, XCircle, Clock, Pause, Play,
  Trash2, Edit3, Star, Eye, Image as ImageIcon, KeyRound, Mail, Lock,
  ChevronLeft, ChevronRight, Users, Megaphone, MessageSquare, ShieldCheck,
  Phone, FileText, X, Save,
} from 'lucide-react';
import {
  supabase, adminSignIn, adminSignOut, adminChangePassword, adminResetPassword,
  adminListProfessionals, adminSetProfessionalEstado, adminUpdateProfessional, adminDeleteProfessional,
  adminListAds, adminSetAdEstado, adminUpdateAd, adminDeleteAd,
  adminListReviews, adminSetReviewEstado, getPrivateImageUrl,
  getAdminSession,
  type AdminProfessional, type AdminAd, type AdminReview,
} from '@/lib/api';

type Tab = 'professionals' | 'ads' | 'reviews';

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('professionals');

  useEffect(() => {
    getAdminSession().then((user) => {
      setAuthed(!!user);
      setChecking(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await adminSignIn(email, password);
      const user = await getAdminSession();
      if (user) {
        setAuthed(true);
      } else {
        setLoginError('Esta cuenta no tiene permisos de administrador.');
        await adminSignOut();
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    setAuthed(false);
    setEmail('');
    setPassword('');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen email={email} password={password} loginError={loginError} loggingIn={loggingIn} onEmail={setEmail} onPassword={setPassword} onSubmit={handleLogin} onExit={onExit} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h1 className="text-base font-bold">Panel de Administración — TalentoCrux</h1>
          </div>
          <div className="flex items-center gap-3">
            <PasswordChanger />
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors">
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
            <button onClick={onExit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold transition-colors">
              <ChevronLeft className="w-4 h-4" /> Ver sitio
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1">
          <TabBtn active={tab === 'professionals'} onClick={() => setTab('professionals')} icon={<Users className="w-4 h-4" />} label="Profesionales" />
          <TabBtn active={tab === 'ads'} onClick={() => setTab('ads')} icon={<Megaphone className="w-4 h-4" />} label="Anuncios" />
          <TabBtn active={tab === 'reviews'} onClick={() => setTab('reviews')} icon={<MessageSquare className="w-4 h-4" />} label="Opiniones" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'professionals' && <ProfessionalsTab />}
        {tab === 'ads' && <AdsTab />}
        {tab === 'reviews' && <ReviewsTab />}
      </main>
    </div>
  );
}

// ── Login Screen ──

function LoginScreen({ email, password, loginError, loggingIn, onEmail, onPassword, onSubmit, onExit }: {
  email: string; password: string; loginError: string | null; loggingIn: boolean;
  onEmail: (v: string) => void; onPassword: (v: string) => void; onSubmit: (e: React.FormEvent) => void; onExit: () => void;
}) {
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setSending(true);
    try {
      await adminResetPassword(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'No se pudo enviar el correo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-slate-900 text-center">
          <ShieldCheck className="w-10 h-10 text-blue-400 mx-auto mb-2" />
          <h1 className="text-lg font-bold text-white">Administración</h1>
          <p className="text-xs text-slate-400 mt-1">TalentoCrux</p>
        </div>
        <div className="p-6">
          {!forgot ? (
            <form onSubmit={onSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{loginError}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input required type="email" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="admin@cruxtalento.com" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input required type="password" value={password} onChange={(e) => onPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
              </div>
              <button type="submit" disabled={loggingIn} className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando…</> : 'Ingresar'}
              </button>
              <button type="button" onClick={() => setForgot(true)} className="w-full text-xs text-slate-500 hover:text-blue-700 font-semibold">
                Olvidé mi contraseña
              </button>
              <button type="button" onClick={onExit} className="w-full text-xs text-slate-400 hover:text-slate-600 font-semibold">
                ← Volver al sitio
              </button>
            </form>
          ) : forgotSent ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm text-slate-700">Si el correo está registrado, recibiste un enlace para restablecer tu contraseña en <strong>{forgotEmail}</strong>.</p>
              <button onClick={() => { setForgot(false); setForgotSent(false); }} className="text-xs text-blue-700 font-semibold hover:underline">Volver al inicio de sesión</button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              {forgotError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{forgotError}</p>
                </div>
              )}
              <p className="text-sm text-slate-600">Ingresá tu correo y te enviaremos un enlace para generar una nueva contraseña.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo electrónico</label>
                <input required type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="admin@cruxtalento.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              </div>
              <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : 'Enviar enlace'}
              </button>
              <button type="button" onClick={() => setForgot(false)} className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold">← Volver</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Password Changer ──

function PasswordChanger() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    if (next !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await adminChangePassword(current, next);
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
      setTimeout(() => { setOpen(false); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors">
      <KeyRound className="w-4 h-4" /> Cambiar clave
    </button>;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Cambiar contraseña</h3>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-sm text-slate-700">Contraseña cambiada correctamente.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}
            <input required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Contraseña actual" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            <input required type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nueva contraseña (mín. 6 caracteres)" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repetir nueva contraseña" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Tab Button ──

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-sm font-semibold transition-colors ${active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
      {icon} {label}
    </button>
  );
}

// ── Professionals Tab ──

function ProfessionalsTab() {
  const [list, setList] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProfessional | null>(null);
  const [filter, setFilter] = useState<string>('Todos');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setList(await adminListProfessionals()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'Todos' ? list : list.filter((p) => p.estado === filter);

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
      Aprobado: 'bg-green-100 text-green-700 border-green-200',
      Rechazado: 'bg-red-100 text-red-700 border-red-200',
      Pausado: 'bg-slate-200 text-slate-600 border-slate-300',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="text-lg font-bold text-slate-800">Profesionales ({list.length})</h2>
      <div className="flex gap-1.5">
        {['Todos', 'Pendiente', 'Aprobado', 'Rechazado', 'Pausado'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{f}</button>
        ))}
      </div>
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
    ) : error ? (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
    ) : filtered.length === 0 ? (
      <div className="text-center py-16 text-sm text-slate-400">No hay profesionales en este estado.</div>
    ) : (
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 bg-slate-100">
                {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">{p.name.charAt(0)}</div>}
              </div>
              <div className="flex-1 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-blue-700 font-semibold">{p.profession}</p>
                    <p className="text-[11px] text-slate-400">{p.neighborhood} · {p.schedule}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full border text-[10px] font-bold ${estadoBadge(p.estado)}`}>{p.estado}</span>
                </div>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {p.numero_matricula && <span className="text-[10px] text-slate-400">Matrícula: {p.numero_matricula}</span>}
                  {p.verificado && <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-bold"><ShieldCheck className="w-3 h-3" /> Verificado</span>}
                  {p.rating_avg > 0 && <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating_avg.toFixed(1)} ({p.review_count})</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.estado !== 'Aprobado' && <ActBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Aprobar" color="green" onClick={() => adminSetProfessionalEstado(p.id, 'Aprobado').then(load)} />}
                  {p.estado !== 'Rechazado' && <ActBtn icon={<XCircle className="w-3.5 h-3.5" />} label="Rechazar" color="red" onClick={() => adminSetProfessionalEstado(p.id, 'Rechazado').then(load)} />}
                  {p.estado === 'Aprobado' && <ActBtn icon={<Pause className="w-3.5 h-3.5" />} label="Pausar" color="slate" onClick={() => adminSetProfessionalEstado(p.id, 'Pausado').then(load)} />}
                  {p.estado === 'Pausado' && <ActBtn icon={<Play className="w-3.5 h-3.5" />} label="Reactivar" color="green" onClick={() => adminSetProfessionalEstado(p.id, 'Aprobado').then(load)} />}
                  <ActBtn icon={<Eye className="w-3.5 h-3.5" />} label="Ver docs" color="blue" onClick={() => setEditing(p)} />
                  <ActBtn icon={<Edit3 className="w-3.5 h-3.5" />} label="Editar" color="slate" onClick={() => setEditing(p)} />
                  <ActBtn icon={<Trash2 className="w-3.5 h-3.5" />} label="Eliminar" color="red" onClick={() => { if (confirm(`¿Eliminar a ${p.name}? Esta acción no se puede deshacer.`)) adminDeleteProfessional(p.id).then(load); }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {editing && <EditProfessionalModal prof={editing} onClose={() => setEditing(null)} onSaved={load} />}
  </div>
  );
}

// ── Edit Professional Modal (with private image viewer) ──

function EditProfessionalModal({ prof, onClose, onSaved }: { prof: AdminProfessional; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: prof.name, profession: prof.profession, neighborhood: prof.neighborhood,
    schedule: prof.schedule, whatsapp: prof.whatsapp, description: prof.description,
    category: prof.category, numero_matricula: prof.numero_matricula, verificado: prof.verificado,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dniFrente, setDniFrente] = useState('');
  const [dniDorso, setDniDorso] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loadingImgs, setLoadingImgs] = useState(true);

  useEffect(() => {
    setLoadingImgs(true);
    Promise.all([
      getPrivateImageUrl(prof.dni_frente_path).catch(() => ''),
      getPrivateImageUrl(prof.dni_dorso_path).catch(() => ''),
      getPrivateImageUrl(prof.foto_matricula_path).catch(() => ''),
    ]).then(([f, d, m]) => { setDniFrente(f); setDniDorso(d); setMatricula(m); })
      .finally(() => setLoadingImgs(false));
  }, [prof]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await adminUpdateProfessional(prof.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  };

  const cls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-slate-900 text-white rounded-t-2xl z-10">
          <h3 className="text-base font-bold">Editar profesional</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} /></Field>
            <Field label="Profesión"><input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className={cls} /></Field>
            <Field label="Barrio"><input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={cls} /></Field>
            <Field label="Horarios"><input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={cls} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={cls} /></Field>
            <Field label="Categoría"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cls} /></Field>
            <Field label="N° Matrícula"><input value={form.numero_matricula} onChange={(e) => setForm({ ...form, numero_matricula: e.target.value })} className={cls} /></Field>
          </div>
          <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${cls} resize-none`} /></Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.verificado} onChange={(e) => setForm({ ...form, verificado: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            Matrícula verificada
          </label>

          {/* Private documents */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Documentación privada (solo admin)</h4>
            {loadingImgs ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <PrivateImg label="DNI Frente" url={dniFrente} />
                <PrivateImg label="DNI Dorso" url={dniDorso} />
                <PrivateImg label="Matrícula" url={matricula} />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}

function PrivateImg({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-500 mb-1">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-slate-200 overflow-hidden hover:border-blue-300 transition-colors">
          <img src={url} alt={label} className="w-full h-24 object-cover" />
        </a>
      ) : (
        <div className="w-full h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-300" />
        </div>
      )}
    </div>
  );
}

// ── Ads Tab ──

function AdsTab() {
  const [list, setList] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setList(await adminListAds()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'Todos' ? list : list.filter((a) => a.estado === filter);

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
      Activo: 'bg-green-100 text-green-700 border-green-200',
      Rechazado: 'bg-red-100 text-red-700 border-red-200',
      Pausado: 'bg-slate-200 text-slate-600 border-slate-300',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-slate-800">Anuncios ({list.length})</h2>
        <div className="flex gap-1.5">
          {['Todos', 'Pendiente', 'Activo', 'Rechazado', 'Pausado'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      : error ? <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      : filtered.length === 0 ? <div className="text-center py-16 text-sm text-slate-400">No hay anuncios en este estado.</div>
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                  {ad.imagen_path ? <img src={ad.imagen_path} alt={ad.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300" /></div>}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{ad.titulo}</h3>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex-shrink-0 ${estadoBadge(ad.estado)}`}>{ad.estado}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{ad.descripcion}</p>
                  {ad.link_video && <p className="text-[10px] text-blue-600 truncate">Video: {ad.link_video}</p>}
                  {ad.link && <p className="text-[10px] text-blue-600 truncate">Link: {ad.link}</p>}
                  {ad.plan_nombre && <p className="text-[10px] text-slate-400">Plan: {ad.plan_nombre}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {ad.estado !== 'Activo' && <ActBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Activar" color="green" onClick={() => adminSetAdEstado(ad.id, 'Activo').then(load)} />}
                {ad.estado !== 'Rechazado' && <ActBtn icon={<XCircle className="w-3.5 h-3.5" />} label="Rechazar" color="red" onClick={() => adminSetAdEstado(ad.id, 'Rechazado').then(load)} />}
                {ad.estado === 'Activo' && <ActBtn icon={<Pause className="w-3.5 h-3.5" />} label="Pausar" color="slate" onClick={() => adminSetAdEstado(ad.id, 'Pausado').then(load)} />}
                {ad.imagen_path && <a href={ad.imagen_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"><Eye className="w-3.5 h-3.5" /> Ver imagen</a>}
                {ad.link_video && <a href={ad.link_video} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"><Eye className="w-3.5 h-3.5" /> Ver video</a>}
                <ActBtn icon={<Trash2 className="w-3.5 h-3.5" />} label="Eliminar" color="red" onClick={() => { if (confirm('¿Eliminar este anuncio?')) adminDeleteAd(ad.id).then(load); }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Tab ──

function ReviewsTab() {
  const [list, setList] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setList(await adminListReviews()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'Todos' ? list : list.filter((r) => r.estado === filter);

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
      Aprobado: 'bg-green-100 text-green-700 border-green-200',
      Rechazado: 'bg-red-100 text-red-700 border-red-200',
      Oculto: 'bg-slate-200 text-slate-600 border-slate-300',
    };
    return map[estado] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-slate-800">Opiniones ({list.length})</h2>
        <div className="flex gap-1.5">
          {['Todos', 'Pendiente', 'Aprobado', 'Rechazado', 'Oculto'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      : error ? <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      : filtered.length === 0 ? <div className="text-center py-16 text-sm text-slate-400">No hay opiniones en este estado.</div>
      : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${estadoBadge(r.estado)}`}>{r.estado}</span>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('es-AR')}</span>
              </div>
              {r.comment && <p className="text-sm text-slate-600 mb-3">{r.comment}</p>}
              <div className="flex flex-wrap gap-1.5">
                {r.estado !== 'Aprobado' && <ActBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Aprobar" color="green" onClick={() => adminSetReviewEstado(r.id, 'Aprobado').then(load)} />}
                {r.estado !== 'Rechazado' && <ActBtn icon={<XCircle className="w-3.5 h-3.5" />} label="Rechazar" color="red" onClick={() => adminSetReviewEstado(r.id, 'Rechazado').then(load)} />}
                {r.estado !== 'Oculto' && <ActBtn icon={<Eye className="w-3.5 h-3.5" />} label="Ocultar" color="slate" onClick={() => adminSetReviewEstado(r.id, 'Oculto').then(load)} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>{children}</div>;
}

function ActBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: 'green' | 'red' | 'slate' | 'blue'; onClick: () => void }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
    slate: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${colors[color]}`}>
      {icon} {label}
    </button>
  );
}
