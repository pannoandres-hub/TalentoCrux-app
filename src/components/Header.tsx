import { GraduationCap, Megaphone, UserPlus } from 'lucide-react';

interface HeaderProps {
  onRegisterClick: () => void;
  onCourseClick: () => void;
  onTeachClick: () => void;
  onAdvertiseClick: () => void;
  onLogoClick: () => void;
}

export function Header({ onRegisterClick, onCourseClick, onTeachClick, onAdvertiseClick, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo */}
          <button onClick={onLogoClick} className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://drive.google.com/thumbnail?id=1ZFie6HPH6APbh4fxmAVdHfGbbIAPBd4C&sz=w500"
              alt="TalentoCrux"
              className="h-10 sm:h-12 w-auto rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-none">
                Talento<span className="text-blue-700">Crux</span>
              </h1>
              <p className="hidden sm:block text-[11px] text-slate-500 mt-0.5">
                Encontrá la solucion que buscás
              </p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              onClick={onCourseClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Cursos
            </button>
            <button
              onClick={onTeachClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Enseñá lo que sabés
            </button>
            <button
              onClick={onAdvertiseClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Quiero publicitar
            </button>
            <button
              onClick={onRegisterClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Registrate
            </button>
          </nav>

          {/* Mobile: register button only (rest in menu) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onRegisterClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-violet-600 text-white text-xs font-semibold shadow-md shadow-blue-200 active:scale-95 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Registrate</span>
            </button>
          </div>
        </div>

        {/* Mobile nav row */}
        <div className="lg:hidden flex items-center gap-2 pb-2.5 overflow-x-auto">
          <button
            onClick={onCourseClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Cursos
          </button>
          <button
            onClick={onTeachClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Enseñá lo que sabés
          </button>
          <button
            onClick={onAdvertiseClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Quiero publicitar
          </button>
        </div>
      </div>
    </header>
  );
}
