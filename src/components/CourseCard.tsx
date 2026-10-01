import { Clock, DollarSign, MessageCircle, GraduationCap, User } from 'lucide-react';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  onContact: (course: Course) => void;
}

export function CourseCard({ course, onContact }: CourseCardProps) {
  return (
    <article className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header banner */}
      <div className="relative h-28 bg-gradient-to-br from-blue-700 to-violet-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <GraduationCap className="absolute right-4 bottom-2 w-24 h-24 text-white" />
        </div>
        <div className="relative p-4">
          <div className="flex items-center gap-1.5 text-blue-100 text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            CURSO
          </div>
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{course.nombreCurso}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Por {course.instructor}</span>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{course.descripcion}</p>

        {/* Duration + Price */}
        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">{course.duracionHoras} hs</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">${course.precioARS} ARS</span>
          </div>
        </div>

        <button
          onClick={() => onContact(course)}
          className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold shadow-md shadow-green-200/50 hover:shadow-lg hover:shadow-green-300/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Consultar por WhatsApp
        </button>
      </div>
    </article>
  );
}
