import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LogOut, Loader2, AlertCircle, CheckCircle2, XCircle, Pause, Play,
  Trash2, Edit3, Star, Eye, Image as ImageIcon, KeyRound, Mail, Lock,
  ChevronLeft, Users, Megaphone, MessageSquare, ShieldCheck,
  FileText, X, Save, Copy, Check, GraduationCap, ExternalLink, Link2,
  PhoneCall, MessageCircle, Send, AtSign, Clock, Filter, Search, User, RotateCcw
} from 'lucide-react';
import {
  adminSignIn, adminSignOut, adminChangePassword, adminResetPassword,
  adminChangeEmail, adminSetNewPassword, adminGetAdminEmail,
  adminListProfessionals, adminSetProfessionalEstado, adminUpdateProfessional, adminDeleteProfessional,
  adminListCourses, adminSetCourseEstado, adminUpdateCourse, adminDeleteCourse,
  adminListAds, adminSetAdEstado, adminUpdateAd, adminDeleteAd,
  adminListReviews, adminSetReviewEstado, adminDeleteReview, adminListContactLogs, adminDeleteContactLog,
  adminRegenerateContactCode, adminReactivateContactCode, adminDeleteProfessionalMedia, adminDeleteAdMedia,
  getPrivateImageUrl, getAdminSession, getProfessionalReviewUrl,
  type AdminProfessional, type AdminAd, type AdminReview, type ContactLog,
  type ProfessionalMediaType,
} from '@/lib/api';
import type { Course } from '@/types';

type Tab = 'professionals' | 'contacts' | 'courses' | 'ads' | 'reviews';

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('professionals');
  const [currentAdminEmail, setCurrentAdminEmail] = useState(adminGetAdminEmail());

  useEffect(() => {
    getAdminSession().then((user) => {
      setAuthed(!!user);
      if (user && typeof user === 'object' && 'email' in user) {
        setCurrentAdminEmail(String((user as { email: string }).email));
      }
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
        setCurrentAdminEmail(adminGetAdminEmail());
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
    return (
      <LoginScreen
        email={email}
        password={password}
        loginError={loginError}
        loggingIn={loggingIn}
        onEmail={setEmail}
        onPassword={setPassword}
        onSubmit={handleLogin}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h1 className="text-base font-bold">Panel de Administración</h1>
              <p className="text-[10px] text-slate-400">{currentAdminEmail} · Ruta: /#/admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <EmailChanger
              currentEmail={currentAdminEmail}
              onEmailUpdated={(newMail) => setCurrentAdminEmail(newMail)}
            />
            <PasswordChanger />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Ver sitio</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1">
          <TabBtn
            active={tab === 'professionals'}
            onClick={() => setTab('professionals')}
            icon={<Users className="w-4 h-4" />}
            label="Profesionales"
          />
          <TabBtn
            active={tab === 'contacts'}
            onClick={() => setTab('contacts')}
            icon={<PhoneCall className="w-4 h-4" />}
            label="Contactos & Calificaciones"
          />
          <TabBtn
            active={tab === 'courses'}
            onClick={() => setTab('courses')}
            icon={<GraduationCap className="w-4 h-4" />}
            label="Cursos"
          />
          <TabBtn
            active={tab === 'ads'}
            onClick={() => setTab('ads')}
            icon={<Megaphone className="w-4 h-4" />}
            label="Anuncios"
          />
          <TabBtn
            active={tab === 'reviews'}
            onClick={() => setTab('reviews')}
            icon={<MessageSquare className="w-4 h-4" />}
            label="Opiniones"
          />
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {tab === 'professionals' && <ProfessionalsTab />}
        {tab === 'contacts' && <ContactsTab />}
        {tab === 'courses' && <CoursesTab />}
        {tab === 'ads' && <AdsTab />}
        {tab === 'reviews' && <ReviewsTab />}
      </main>
    </div>
  );
}

// ── Login Screen with "Olvidé mi contraseña" ──

function LoginScreen({
  email,
  password,
  loginError,
  loggingIn,
  onEmail,
  onPassword,
  onSubmit,
  onExit,
}: {
  email: string;
  password: string;
  loginError: string | null;
  loggingIn: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onExit: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'forgot_form' | 'email_received' | 'reset_password'>('login');
  const [forgotEmail, setForgotEmail] = useState(adminGetAdminEmail());
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Reset form states
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setSending(true);
    try {
      await adminResetPassword(forgotEmail);
      setMode('email_received');
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'No se pudo procesar la solicitud');
    } finally {
      setSending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newPass.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await adminSetNewPassword(newPass);
      setResetSuccess(true);
      onPassword(newPass);
      setTimeout(() => {
        setResetSuccess(false);
        setMode('login');
      }, 2000);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleFillDemo = () => {
    onEmail(adminGetAdminEmail());
    onPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6 bg-slate-900 text-center border-b border-slate-800">
          <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
          <p className="text-xs text-slate-400 mt-1">TalentoCrux · Gestión CABA</p>
        </div>

        {/* Info card with credentials */}
        {mode === 'login' && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 flex-1">
              <p className="font-bold">Credenciales de acceso vigentes:</p>
              <p className="font-mono mt-0.5">Email: <strong>{adminGetAdminEmail()}</strong></p>
              <p className="font-mono">Clave por defecto: <strong>admin123</strong></p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors"
              >
                Completar automáticamente
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {mode === 'login' && (
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
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => onEmail(e.target.value)}
                    placeholder={adminGetAdminEmail()}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => onPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {loggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingresando…</> : 'Ingresar al panel'}
              </button>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot_form')}
                  className="text-xs text-slate-500 hover:text-blue-700 font-semibold"
                >
                  Olvidé mi contraseña
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  ← Volver al sitio
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot_form' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {forgotError}
                </div>
              )}
              <h2 className="text-base font-bold text-slate-900">Recuperar contraseña</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingresá tu correo de administrador para recibir el correo con el enlace directo para restablecerla.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo de Administrador</label>
                <input
                  required
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar correo de recuperación
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold text-center"
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          )}

          {mode === 'email_received' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Bandeja de Entrada: Correo Recibido
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs space-y-2 text-slate-700 shadow-sm">
                  <p className="font-semibold text-slate-900">De: soporte@talentocrux.com</p>
                  <p>Para: <strong>{forgotEmail}</strong></p>
                  <hr className="border-slate-100 my-1" />
                  <p className="leading-relaxed">
                    Hola Administrador. Recibimos una solicitud para restablecer tu contraseña en TalentoCrux.
                  </p>
                  {/* The requested specific phrasing */}
                  <div className="py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('reset_password')}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Si olvidaste la clave haz click aquí para reestablecerla
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    (Al hacer clic podés definir directamente la contraseña que quieras).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold text-center"
              >
                ← Volver
              </button>
            </div>
          )}

          {mode === 'reset_password' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Definir nueva contraseña</h2>
              <p className="text-xs text-slate-600">
                Elegí la contraseña que prefieras para tu cuenta de administrador ({forgotEmail}).
              </p>

              {resetSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">¡Contraseña restablecida con éxito!</p>
                  <p className="text-xs text-slate-500">Redirigiendo al inicio de sesión…</p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  {resetError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                      {resetError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nueva contraseña</label>
                    <input
                      required
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Confirmar nueva contraseña</label>
                    <input
                      required
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repetí la contraseña"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Guardar nueva contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-xs text-slate-500 hover:text-slate-700 font-semibold text-center"
                  >
                    Cancelar y volver
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email Changer (Requires current password to validate identity) ──

function EmailChanger({
  currentEmail,
  onEmailUpdated,
}: {
  currentEmail: string;
  onEmailUpdated: (email: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminChangeEmail(password, newEmail);
      setSuccess(true);
      onEmailUpdated(newEmail.trim().toLowerCase());
      setPassword('');
      setNewEmail('');
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar email');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setNewEmail(currentEmail); }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
        title="Cambiar correo de administrador"
      >
        <AtSign className="w-4 h-4 text-blue-400" />
        <span className="hidden sm:inline">Cambiar email</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Cambiar email de admin</h3>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">¡Email de admin actualizado!</p>
            <p className="text-xs text-slate-500 mt-1">El nuevo correo es tu identificador para los próximos inicios de sesión.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}
            <p className="text-xs text-slate-500">
              Para cambiar tu correo de administrador, ingresá tu contraseña actual para validar tu identidad.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nuevo correo electrónico</label>
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@cruxtalento.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña actual (para validar)</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar nuevo email
            </button>
          </form>
        )}
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
    if (next.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (next !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await adminChangePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
      >
        <KeyRound className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Cambiar clave</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Cambiar clave de admin</h3>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">¡Contraseña actualizada!</p>
            <p className="text-xs text-slate-500 mt-1">Podrás usar tu nueva contraseña en los próximos inicios de sesión.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña actual</label>
              <input
                required
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Ingresá contraseña actual (ej. admin123)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nueva contraseña</label>
              <input
                required
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirmar nueva contraseña</label>
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repetí la nueva contraseña"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar nueva clave
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
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
        active ? 'border-blue-600 text-blue-700 bg-blue-50/40' : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ── NEW: Contacts Tab (Qué persona contactó a qué profesional & envío de link a 2 semanas) ──

function ContactsTab() {
  const [contacts, setContacts] = useState<ContactLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContacts(await adminListContactLogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCopyReviewLink = async (log: ContactLog) => {
    const url = getProfessionalReviewUrl(log.professional_id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(log.id);
      setTimeout(() => setCopiedId(null), 3500);
    } catch {
      // fallback
    }
  };

  const getDaysElapsed = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diffMs / 86400000);
  };

  const getWaReminderLink = (log: ContactLog) => {
    const ratingUrl = getProfessionalReviewUrl(log.professional_id);
    const isCourse = log.target_type === 'course';
    const targetDesc = isCourse ? `el curso '${log.professional_name}'` : `el servicio de ${log.professional_name} (${log.professional_profession})`;
    const codeNotice = log.rating_code
      ? `\n\nTu CÓDIGO DE CALIFICACIÓN DE ÚNICO USO es: *${log.rating_code}* (deberás ingresarlo en el enlace para validar tu opinión).`
      : '';
    const text = `Hola ${log.client_name}, pasaron 2 semanas desde que consultaste por ${targetDesc} en TalentoCrux. Te invitamos a compartir tu experiencia y dejar tu calificación en este enlace:\n${ratingUrl}${codeNotice}`;
    const cleanPhone = log.client_phone.replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
  };

  const getMailReminderLink = (log: ContactLog) => {
    const ratingUrl = getProfessionalReviewUrl(log.professional_id);
    const isCourse = log.target_type === 'course';
    const subject = isCourse
      ? `Tu opinión sobre el curso ${log.professional_name} en TalentoCrux`
      : `Tu opinión sobre ${log.professional_name} en TalentoCrux`;
    const codeNotice = log.rating_code
      ? `\n\nTu CÓDIGO DE CALIFICACIÓN DE ÚNICO USO es: ${log.rating_code}\n(Ingresá este código en el formulario para validar tu calificación de forma segura).`
      : '';
    const body = `Hola ${log.client_name},\n\nPasaron 2 semanas desde que consultaste por ${isCourse ? 'el curso ' : ''}${log.professional_name} (${log.professional_profession}) a través de TalentoCrux.\n\nNos gustaría saber cómo fue tu experiencia. Por favor dejanos tu comentario y calificación haciendo clic en el siguiente enlace:\n${ratingUrl}${codeNotice}\n\n¡Muchas gracias!\nEquipo de TalentoCrux`;
    return `mailto:${log.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRegenerateCode = async (log: ContactLog) => {
    try {
      const newCode = await adminRegenerateContactCode(log.id);
      alert(`Nuevo código generado para ${log.client_name}: ${newCode}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al generar código');
    }
  };

  const handleReactivateCode = async (log: ContactLog) => {
    try {
      await adminReactivateContactCode(log.id);
      alert(`Código ${log.rating_code} reactivado con éxito para ${log.client_name}.`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al reactivar código');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Registro de Contactos y Códigos de Calificación ({contacts.length})
          </h2>
          <p className="text-xs text-slate-500">
            Personas que contactaron a profesionales o cursos. Cada contacto tiene un código único para calificar a las 2 semanas.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          Aún no se han registrado contactos. Los contactos aparecerán cuando un usuario complete la verificación en el sitio.
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((log) => {
            const days = getDaysElapsed(log.created_at);
            const isTwoWeeks = days >= 14;
            const isUsed = log.code_status === 'usado';
            const isCourse = log.target_type === 'course';

            return (
              <div
                key={log.id}
                className={`bg-white rounded-xl border p-4 shadow-sm space-y-3 transition-all ${
                  isTwoWeeks ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{log.client_name}</span>
                    <span className="text-xs text-slate-400">contactó a</span>
                    <span className="font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                      {isCourse ? <GraduationCap className="w-3.5 h-3.5" /> : null}
                      {log.professional_name} ({log.professional_profession})
                    </span>
                    {isCourse && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">
                        Curso
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isTwoWeeks ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ¡2 Semanas cumplidas! ({days} días)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Hace {days === 0 ? 'hoy' : `${days} días`}
                      </span>
                    )}

                    {log.verified ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">
                        Verificado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px]">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact data and rating code block */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono / WhatsApp</span>
                    <span className="font-semibold text-slate-700">{log.client_phone || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Correo Electrónico</span>
                    <span className="font-semibold text-slate-700 truncate block">{log.client_email || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha de Contacto</span>
                    <span className="text-slate-600">
                      {new Date(log.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Rating Code & Status */}
                  <div className="bg-white p-2 rounded-md border border-slate-200 flex flex-col justify-between">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Código de Único Uso</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono font-black text-sm text-blue-700 tracking-wider">
                        {log.rating_code || 'TC-PEND'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isUsed
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                      >
                        {isUsed ? 'Usado' : 'Activo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-blue-900 truncate">
                      <Link2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                        {getProfessionalReviewUrl(log.professional_id)}
                      </span>
                    </div>

                    {/* Code management buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRegenerateCode(log)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Generar un código nuevo para este contacto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Nuevo código
                      </button>

                      {isUsed && (
                        <button
                          onClick={() => handleReactivateCode(log)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                          title="Permitir que este código pueda volver a usarse"
                        >
                          <Play className="w-3 h-3" />
                          Reactivar código
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleCopyReviewLink(log)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedId === log.id ? 'bg-green-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === log.id ? '¡Link copiado!' : 'Copiar link'}
                    </button>

                    {log.client_phone && (
                      <a
                        href={getWaReminderLink(log)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all"
                        title="Enviar recordatorio con código por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Enviar por WhatsApp
                      </a>
                    )}

                    {log.client_email && (
                      <a
                        href={getMailReminderLink(log)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all border border-blue-200"
                        title="Enviar correo con código pidiendo calificación"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Enviar por Email
                      </a>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar registro de contacto de ${log.client_name}?`)) {
                          adminDeleteContactLog(log.id).then(load);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Professionals Tab ──

function ProfessionalsTab() {
  const [list, setList] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProfessional | null>(null);
  const [filter, setFilter] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await adminListProfessionals());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'Todos' ? list : list.filter((p) => p.estado === filter);

  const handleCopyReviewLink = async (p: AdminProfessional) => {
    const url = getProfessionalReviewUrl(p.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 3500);
    } catch {
      // fallback
    }
  };

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
        <div>
          <h2 className="text-lg font-bold text-slate-800">Profesionales ({list.length})</h2>
          <p className="text-xs text-slate-500">Revisá multimedia, DNI, matrículas y copiá el link para calificar a las 2 semanas.</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todos', 'Pendiente', 'Aprobado', 'Rechazado', 'Pausado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          No hay profesionales en este estado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-36 h-36 sm:h-auto flex-shrink-0 bg-slate-100 relative">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  {p.verificado && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white p-1 rounded-full shadow" title="Matriculado verificado">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-blue-700 font-semibold">{p.profession} · {p.neighborhood}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Horarios: {p.schedule} | WA: {p.whatsapp}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${estadoBadge(p.estado)}`}>
                      {p.estado}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {p.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {p.numero_matricula && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
                        Matrícula: {p.numero_matricula}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {p.rating_avg.toFixed(1)} ({p.review_count} {p.review_count === 1 ? 'opinión' : 'opiniones'})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {p.clicks_contacto} clicks
                    </span>
                  </div>

                  {/* Rating 2-week URL copy bar */}
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-blue-900 min-w-0">
                      <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold truncate">URL para calificar a las 2 semanas:</span>
                      <code className="text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 truncate max-w-[200px] sm:max-w-xs">
                        {getProfessionalReviewUrl(p.id)}
                      </code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyReviewLink(p)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          copiedId === p.id
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {copiedId === p.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === p.id ? '¡Copiado!' : 'Copiar link'}
                      </button>
                      <a
                        href={getProfessionalReviewUrl(p.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                        title="Abrir formulario de calificación"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Admin actions */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {p.estado !== 'Aprobado' && (
                      <ActBtn
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        label="Aprobar"
                        color="green"
                        onClick={() => adminSetProfessionalEstado(p.id, 'Aprobado').then(load)}
                      />
                    )}
                    {p.estado !== 'Rechazado' && (
                      <ActBtn
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        label="Rechazar"
                        color="red"
                        onClick={() => adminSetProfessionalEstado(p.id, 'Rechazado').then(load)}
                      />
                    )}
                    {p.estado === 'Aprobado' && (
                      <ActBtn
                        icon={<Pause className="w-3.5 h-3.5" />}
                        label="Pausar"
                        color="slate"
                        onClick={() => adminSetProfessionalEstado(p.id, 'Pausado').then(load)}
                      />
                    )}
                    {p.estado === 'Pausado' && (
                      <ActBtn
                        icon={<Play className="w-3.5 h-3.5" />}
                        label="Reactivar"
                        color="green"
                        onClick={() => adminSetProfessionalEstado(p.id, 'Aprobado').then(load)}
                      />
                    )}
                    <ActBtn
                      icon={<Eye className="w-3.5 h-3.5" />}
                      label="Ver multimedia & docs"
                      color="blue"
                      onClick={() => setEditing(p)}
                    />
                    <ActBtn
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      label="Editar info"
                      color="slate"
                      onClick={() => setEditing(p)}
                    />
                    <ActBtn
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      label="Eliminar"
                      color="red"
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${p.name}? Esta acción borrará al profesional.`)) {
                          adminDeleteProfessional(p.id).then(load);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditProfessionalModal
          prof={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

// ── Edit Professional Modal ──

function EditProfessionalModal({
  prof,
  onClose,
  onSaved,
}: {
  prof: AdminProfessional;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: prof.name,
    profession: prof.profession,
    neighborhood: prof.neighborhood,
    schedule: prof.schedule,
    whatsapp: prof.whatsapp,
    description: prof.description,
    category: prof.category,
    numero_matricula: prof.numero_matricula,
    verificado: prof.verificado,
    photo_url: prof.photo_url,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dniFrente, setDniFrente] = useState('');
  const [dniDorso, setDniDorso] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loadingImgs, setLoadingImgs] = useState(true);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  useEffect(() => {
    setLoadingImgs(true);
    Promise.all([
      getPrivateImageUrl(prof.dni_frente_path).catch(() => ''),
      getPrivateImageUrl(prof.dni_dorso_path).catch(() => ''),
      getPrivateImageUrl(prof.foto_matricula_path).catch(() => ''),
    ])
      .then(([f, d, m]) => {
        setDniFrente(f || prof.dni_frente_path);
        setDniDorso(d || prof.dni_dorso_path);
        setMatricula(m || prof.foto_matricula_path);
      })
      .finally(() => setLoadingImgs(false));
  }, [prof]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminUpdateProfessional(prof.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (type: ProfessionalMediaType) => {
    if (!confirm('¿Seguro que deseas eliminar este archivo multimedia? Esta acción vaciará el campo.')) return;
    try {
      await adminDeleteProfessionalMedia(prof.id, type);
      if (type === 'photo_url') setForm((f) => ({ ...f, photo_url: '' }));
      if (type === 'dni_frente_path') setDniFrente('');
      if (type === 'dni_dorso_path') setDniDorso('');
      if (type === 'foto_matricula_path') setMatricula('');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar multimedia');
    }
  };

  const cls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-slate-900 text-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold">Revisión de Profesional & Multimedia</h3>
            <p className="text-xs text-slate-400">Inspeccioná documentos, eliminá fotos inadecuadas y editá sus datos</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>}

          {/* Section: Multimedia & Documents */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Documentación y Fotos Subidas (Auditoría Admin)
              </h4>
              <span className="text-[11px] text-slate-500">
                Podés eliminar fotos de perfil o documentos específicos
              </span>
            </div>
            {loadingImgs ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PrivateImg
                  label="Foto de Perfil"
                  url={form.photo_url}
                  onClick={() => setActiveMedia(form.photo_url)}
                  onDelete={() => handleDeleteMedia('photo_url')}
                />
                <PrivateImg
                  label="DNI Frente"
                  url={dniFrente}
                  onClick={() => dniFrente && setActiveMedia(dniFrente)}
                  onDelete={() => handleDeleteMedia('dni_frente_path')}
                />
                <PrivateImg
                  label="DNI Dorso"
                  url={dniDorso}
                  onClick={() => dniDorso && setActiveMedia(dniDorso)}
                  onDelete={() => handleDeleteMedia('dni_dorso_path')}
                />
                <PrivateImg
                  label="Foto Matrícula"
                  url={matricula}
                  onClick={() => matricula && setActiveMedia(matricula)}
                  onDelete={() => handleDeleteMedia('foto_matricula_path')}
                />
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Hacé clic en cualquier imagen para verla en pantalla completa, o tocá "Borrar" para eliminar ese archivo.
            </p>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre completo">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} />
            </Field>
            <Field label="Oficio / Profesión">
              <input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className={cls} />
            </Field>
            <Field label="Barrio en CABA">
              <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={cls} />
            </Field>
            <Field label="Horarios de atención">
              <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className={cls} />
            </Field>
            <Field label="WhatsApp (sin 0 ni 15)">
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={cls} />
            </Field>
            <Field label="Categoría (hogar, diseno, etc.)">
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cls} />
            </Field>
            <Field label="N° de Matrícula (opcional)">
              <input value={form.numero_matricula} onChange={(e) => setForm({ ...form, numero_matricula: e.target.value })} className={cls} />
            </Field>
            <Field label="URL Foto de Perfil">
              <div className="flex gap-1.5">
                <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className={cls} />
                {form.photo_url && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia('photo_url')}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                    title="Eliminar foto de perfil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                )}
              </div>
            </Field>
          </div>

          <Field label="Descripción de servicios">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${cls} resize-none`}
            />
          </Field>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={form.verificado}
              onChange={(e) => setForm({ ...form, verificado: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-slate-800">
              Marcar como Matriculado / Verificado (muestra la insignia de verificación en su tarjeta)
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center gap-2 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Fullscreen media viewer */}
      {activeMedia && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80" onClick={() => setActiveMedia(null)}>
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activeMedia} alt="Documento" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function PrivateImg({
  label,
  url,
  onClick,
  onDelete,
}: {
  label: string;
  url: string;
  onClick?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide truncate">{label}</p>
        {url && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5 hover:underline font-semibold"
            title={`Eliminar ${label}`}
          >
            <Trash2 className="w-2.5 h-2.5" />
            Borrar
          </button>
        )}
      </div>
      {url ? (
        <div className="relative group">
          <button
            type="button"
            onClick={onClick}
            className="w-full h-24 rounded-lg border border-slate-200 overflow-hidden hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all bg-white relative block"
          >
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
              <Eye className="w-4 h-4" />
            </div>
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Eliminar ${label}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-24 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-300 bg-white p-2 text-center">
          <ImageIcon className="w-5 h-5 mb-1" />
          <span className="text-[9px] text-slate-400">Sin archivo</span>
        </div>
      )}
    </div>
  );
}

// ── Courses Tab ──

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await adminListCourses());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const estadoBadge = (estado?: string) => {
    const s = estado || 'Activo';
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
      Activo: 'bg-green-100 text-green-700 border-green-200',
      Pausado: 'bg-slate-200 text-slate-600 border-slate-300',
      Rechazado: 'bg-red-100 text-red-700 border-red-200',
    };
    return map[s] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Cursos y Talleres ({courses.length})</h2>
          <p className="text-xs text-slate-500">Aprobá, modificá los precios o pausá cursos publicados por profesionales.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          No hay cursos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.nombreCurso}</h3>
                  <p className="text-xs text-blue-700 font-semibold">Instructor: {c.instructor}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${estadoBadge(c.estado)}`}>
                  {c.estado || 'Activo'}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                {c.descripcion}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="font-bold text-green-700 text-sm">
                  ${c.precioARS.toLocaleString('es-AR')} ARS
                </span>
                <span className="text-slate-500 text-[11px]">
                  Duración: {c.duracionHoras}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                WhatsApp: {c.whatsapp} | Clicks: {c.clicksContacto}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {c.estado !== 'Activo' && (
                  <ActBtn
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    label="Activar"
                    color="green"
                    onClick={() => adminSetCourseEstado(c.id, 'Activo').then(load)}
                  />
                )}
                {c.estado === 'Activo' && (
                  <ActBtn
                    icon={<Pause className="w-3.5 h-3.5" />}
                    label="Pausar"
                    color="slate"
                    onClick={() => adminSetCourseEstado(c.id, 'Pausado').then(load)}
                  />
                )}
                <ActBtn
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  label="Editar"
                  color="slate"
                  onClick={() => setEditing(c)}
                />
                <ActBtn
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  label="Eliminar"
                  color="red"
                  onClick={() => {
                    if (confirm(`¿Eliminar el curso "${c.nombreCurso}"?`)) {
                      adminDeleteCourse(c.id).then(load);
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditCourseModal
          course={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function EditCourseModal({ course, onClose, onSaved }: { course: Course; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nombreCurso: course.nombreCurso,
    instructor: course.instructor,
    whatsapp: course.whatsapp,
    email: course.email,
    descripcion: course.descripcion,
    duracionHoras: course.duracionHoras,
    precioARS: course.precioARS,
    estado: course.estado || 'Activo',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateCourse(course.id, form);
      onSaved();
      onClose();
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const cls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Editar Curso</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nombre del Curso">
            <input value={form.nombreCurso} onChange={(e) => setForm({ ...form, nombreCurso: e.target.value })} className={cls} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instructor">
              <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={cls} required />
            </Field>
            <Field label="WhatsApp">
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={cls} required />
            </Field>
            <Field label="Precio ARS ($)">
              <input type="number" value={form.precioARS} onChange={(e) => setForm({ ...form, precioARS: Number(e.target.value) })} className={cls} required />
            </Field>
            <Field label="Duración">
              <input value={form.duracionHoras} onChange={(e) => setForm({ ...form, duracionHoras: e.target.value })} className={cls} required />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className={`${cls} resize-none`} required />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Ads Tab ──

function AdsTab() {
  const [list, setList] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [editing, setEditing] = useState<AdminAd | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await adminListAds());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
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
        <div>
          <h2 className="text-lg font-bold text-slate-800">Publicidades y Anuncios ({list.length})</h2>
          <p className="text-xs text-slate-500">Revisá banners, videos, links y autorizá o pausá anuncios comerciales.</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todos', 'Pendiente', 'Activo', 'Rechazado', 'Pausado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200">
          No hay anuncios en este estado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3 p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                  {ad.imagen_path ? (
                    <img src={ad.imagen_path} alt={ad.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{ad.titulo}</h3>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex-shrink-0 ${estadoBadge(ad.estado)}`}>
                      {ad.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{ad.descripcion}</p>
                  {ad.plan_nombre && <p className="text-[11px] text-blue-700 font-semibold">Plan: {ad.plan_nombre}</p>}
                  {ad.link && <p className="text-[10px] text-slate-400 truncate">Link: {ad.link}</p>}
                  {ad.link_video && <p className="text-[10px] text-purple-600 truncate">Video: {ad.link_video}</p>}
                  <p className="text-[10px] text-slate-400">Clicks: {ad.clicks_contacto}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-1 border-t border-slate-100">
                {ad.estado !== 'Activo' && (
                  <ActBtn
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    label="Activar"
                    color="green"
                    onClick={() => adminSetAdEstado(ad.id, 'Activo').then(load)}
                  />
                )}
                {ad.estado !== 'Rechazado' && (
                  <ActBtn
                    icon={<XCircle className="w-3.5 h-3.5" />}
                    label="Rechazar"
                    color="red"
                    onClick={() => adminSetAdEstado(ad.id, 'Rechazado').then(load)}
                  />
                )}
                {ad.estado === 'Activo' && (
                  <ActBtn
                    icon={<Pause className="w-3.5 h-3.5" />}
                    label="Pausar"
                    color="slate"
                    onClick={() => adminSetAdEstado(ad.id, 'Pausado').then(load)}
                  />
                )}
                {ad.imagen_path && (
                  <>
                    <a
                      href={ad.imagen_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver imagen
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar la imagen de este anuncio?')) {
                          adminDeleteAdMedia(ad.id, 'imagen_path').then(load);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      title="Eliminar banner publicitario"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar imagen
                    </button>
                  </>
                )}
                {ad.link_video && (
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar el video de este anuncio?')) {
                        adminDeleteAdMedia(ad.id, 'link_video').then(load);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                    title="Eliminar link de video"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Borrar video
                  </button>
                )}
                <ActBtn
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  label="Editar"
                  color="slate"
                  onClick={() => setEditing(ad)}
                />
                <ActBtn
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  label="Eliminar"
                  color="red"
                  onClick={() => {
                    if (confirm('¿Eliminar este anuncio?')) adminDeleteAd(ad.id).then(load);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditAdModal
          ad={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function EditAdModal({ ad, onClose, onSaved }: { ad: AdminAd; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    titulo: ad.titulo,
    descripcion: ad.descripcion,
    link: ad.link,
    link_video: ad.link_video,
    imagen_path: ad.imagen_path,
    plan_nombre: ad.plan_nombre,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateAd(ad.id, form);
      onSaved();
      onClose();
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const cls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Editar Anuncio</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Título">
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={cls} required />
          </Field>
          <Field label="Descripción">
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className={`${cls} resize-none`} required />
          </Field>
          <Field label="URL de Imagen / Banner">
            <div className="flex gap-1.5">
              <input value={form.imagen_path} onChange={(e) => setForm({ ...form, imagen_path: e.target.value })} className={cls} />
              {form.imagen_path && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagen_path: '' })}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                  title="Quitar imagen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar
                </button>
              )}
            </div>
          </Field>
          <Field label="Link de Destino / WhatsApp">
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={cls} />
          </Field>
          <Field label="Link de Video (YouTube/Vimeo)">
            <div className="flex gap-1.5">
              <input value={form.link_video} onChange={(e) => setForm({ ...form, link_video: e.target.value })} className={cls} />
              {form.link_video && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, link_video: '' })}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                  title="Quitar video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Quitar
                </button>
              )}
            </div>
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Reviews Tab ──

function ReviewsTab() {
  const [list, setList] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [textFilter, setTextFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('Todos');
  const [sentimentFilter, setSentimentFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Todos');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await adminListReviews());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Unique professionals/courses for the dropdown
  const uniqueTargets = useMemo(() => {
    const map = new Map<string, string>();
    list.forEach((r) => {
      if (r.professional_id) {
        map.set(r.professional_id, r.professional_name || r.professional_id);
      }
    });
    return Array.from(map.entries());
  }, [list]);

  const hasActiveFilters =
    statusFilter !== 'Todos' ||
    textFilter.trim() !== '' ||
    clientFilter.trim() !== '' ||
    targetFilter !== 'Todos' ||
    sentimentFilter !== 'Todos' ||
    dateFilter !== 'Todos';

  const resetFilters = () => {
    setStatusFilter('Todos');
    setTextFilter('');
    setClientFilter('');
    setTargetFilter('Todos');
    setSentimentFilter('Todos');
    setDateFilter('Todos');
  };

  const filtered = useMemo(() => {
    return list.filter((r) => {
      // Status
      if (statusFilter !== 'Todos' && r.estado !== statusFilter) return false;
      // Words in comment
      if (textFilter.trim()) {
        const q = textFilter.toLowerCase().trim();
        if (!(r.comment || '').toLowerCase().includes(q)) return false;
      }
      // Reviewer / Client name
      if (clientFilter.trim()) {
        const q = clientFilter.toLowerCase().trim();
        if (!(r.client_name || '').toLowerCase().includes(q)) return false;
      }
      // Target professional or course
      if (targetFilter !== 'Todos') {
        if (r.professional_id !== targetFilter && r.professional_name !== targetFilter) return false;
      }
      // Sentiment / Stars
      if (sentimentFilter === 'Buenas' && r.rating < 4) return false;
      if (sentimentFilter === 'Regulares' && r.rating !== 3) return false;
      if (sentimentFilter === 'Malas' && r.rating > 2) return false;
      if (['5', '4', '3', '2', '1'].includes(sentimentFilter) && r.rating !== Number(sentimentFilter)) return false;
      // Date filter
      if (dateFilter !== 'Todos') {
        const days = (Date.now() - new Date(r.created_at).getTime()) / 86400000;
        if (dateFilter === '7d' && days > 7) return false;
        if (dateFilter === '30d' && days > 30) return false;
        if (dateFilter === '90d' && days > 90) return false;
      }
      return true;
    });
  }, [list, statusFilter, textFilter, clientFilter, targetFilter, sentimentFilter, dateFilter]);

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Opiniones y Calificaciones ({list.length})
          </h2>
          <p className="text-xs text-slate-500">
            Filtra por cliente, profesional o curso, sentimientos, palabras y fecha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            Mostrando {filtered.length} de {list.length}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          Filtros de búsqueda avanzada
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Words in comment */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Palabras en el comentario</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                placeholder="Ej: puntual, tablero, excelente…"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Reviewer / Client name */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Persona que lo escribió</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                placeholder="Ej: Luciana, Fernando, Silva…"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Professional or Course */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Profesional o Curso</label>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
            >
              <option value="Todos">Todos los profesionales y cursos</option>
              {uniqueTargets.map(([id, name]) => (
                <option key={id} value={id}>
                  {id.startsWith('course-') ? `[Curso] ${name}` : `[Prof] ${name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment / Rating */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Calificación / Sentimiento</label>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
            >
              <option value="Todos">Todas las calificaciones</option>
              <option value="Buenas">Buenas opiniones (4 y 5 ★)</option>
              <option value="Regulares">Regulares (3 ★)</option>
              <option value="Malas">Malas opiniones (1 y 2 ★)</option>
              <option value="5">Solo 5 Estrellas ★★★★★</option>
              <option value="4">Solo 4 Estrellas ★★★★☆</option>
              <option value="3">Solo 3 Estrellas ★★★☆☆</option>
              <option value="2">Solo 2 Estrellas ★★☆☆☆</option>
              <option value="1">Solo 1 Estrella ★☆☆☆☆</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Fecha</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
            >
              <option value="Todos">Todas las fechas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>

          {/* Status buttons */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Estado de moderación</label>
            <div className="flex gap-1 flex-wrap">
              {['Todos', 'Pendiente', 'Aprobado', 'Rechazado', 'Oculto'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    statusFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400 bg-white rounded-xl border border-slate-200 space-y-2">
          <p className="font-semibold text-slate-600">No se encontraron opiniones con los filtros seleccionados.</p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-700 underline font-semibold"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isCourse = r.target_type === 'course' || (r.professional_id && r.professional_id.startsWith('course-'));
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${estadoBadge(r.estado)}`}>
                      {r.estado}
                    </span>

                    <span className="font-bold text-xs text-slate-900">
                      {r.client_name || 'Cliente'}
                    </span>

                    <span className="text-xs text-slate-400">calificó a</span>

                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                      {isCourse ? <GraduationCap className="w-3 h-3" /> : null}
                      {r.professional_name || r.professional_id}
                    </span>

                    {r.rating_code && (
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        Código: {r.rating_code}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {new Date(r.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {r.comment && (
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-100">
                    "{r.comment}"
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                  {r.estado !== 'Aprobado' && (
                    <ActBtn
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      label="Aprobar"
                      color="green"
                      onClick={() => adminSetReviewEstado(r.id, 'Aprobado').then(load)}
                    />
                  )}
                  {r.estado !== 'Rechazado' && (
                    <ActBtn
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      label="Rechazar"
                      color="red"
                      onClick={() => adminSetReviewEstado(r.id, 'Rechazado').then(load)}
                    />
                  )}
                  {r.estado !== 'Oculto' && (
                    <ActBtn
                      icon={<Eye className="w-3.5 h-3.5" />}
                      label="Ocultar"
                      color="slate"
                      onClick={() => adminSetReviewEstado(r.id, 'Oculto').then(load)}
                    />
                  )}
                  <ActBtn
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    label="Eliminar"
                    color="red"
                    onClick={() => {
                      if (confirm('¿Eliminar definitivamente este comentario?')) {
                        adminDeleteReview(r.id).then(load);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ActBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: 'green' | 'red' | 'slate' | 'blue';
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
    red: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
    slate: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${colors[color]}`}
    >
      {icon} {label}
    </button>
  );
}
