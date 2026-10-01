import { ShieldCheck, FileText } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
}

export function LegalPage({ onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
          >
            <span>← Volver al inicio</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Términos y Condiciones */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Términos y Condiciones</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            <p className="text-xs text-slate-400 italic">Última actualización: septiembre de 2026</p>

            <h2 className="text-base font-bold text-slate-800 mt-6">1. Objeto del servicio</h2>
            <p>
              TalentoCrux es un directorio intermediario de carácter digital que tiene como finalidad conectar
              profesionales independientes con potenciales clientes dentro del ámbito de la Ciudad Autónoma de
              Buenos Aires (CABA). La plataforma actúa exclusivamente como espacio de encuentro y visibilidad,
              sin participar en la prestación de los servicios ni en las transacciones que se generen entre los
              usuarios.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">2. Naturaleza intermediaria</h2>
            <p>
              TalentoCrux no es empleador, socio, representante ni agente de los profesionales que se registran en
              la plataforma. La relación contractual que pudiera surgir se establece única y exclusivamente entre
              el usuario que contrata y el profesional que presta el servicio. TalentoCrux no se responsabiliza
              por el cumplimiento, calidad, plazos ni resultados de los servicios contratados a través de los
              contactos generados en la plataforma.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">3. Derecho de admisión y verificación</h2>
            <p>
              TalentoCrux se reserva el derecho de admisión, aceptación, rechazo, suspensión o eliminación de
              cualquier perfil de profesional o anuncio publicado, sin necesidad de expresar causa y sin derecho
              a indemnización alguna. La plataforma podrá requerir documentación complementaria para validar la
              identidad, matrícula o antecedentes del profesional, y podrá verificar o no verificar dichos datos
              según criterios internos.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">4. Responsabilidad del usuario</h2>
            <p>
              El profesional declara que la información proporcionada al momento del registro es veraz y
              actualizada. El usuario que contrata un servicio lo hace bajo su propia responsabilidad, debiendo
              verificar por sí mismo la idoneidad y antecedentes del profesional. TalentoCrux recomienda tomar
              las precauciones habituales al momento de contratar servicios de terceros.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">5. Publicidad y anuncios</h2>
            <p>
              Los anuncios publicitarios publicados en la plataforma están sujetos a la misma política de
              admisión. TalentoCrux no garantiza resultados, alcance ni efectividad de las publicidades
              contratadas. El contenido de los anuncios es responsabilidad exclusiva del anunciante.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">6. Modificaciones</h2>
            <p>
              TalentoCrux podrá modificar los presentes Términos y Condiciones en cualquier momento. Las
              modificaciones entrarán en vigor desde su publicación en la plataforma. El uso continuado de la
              plataforma implica la aceptación de los términos vigentes.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">7. Jurisdicción</h2>
            <p>
              Para toda cuestión derivada del uso de la plataforma, las partes se someten a la jurisdicción de los
              tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, República Argentina.
            </p>
          </div>
        </section>

        {/* Política de Privacidad */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-700" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Política de Privacidad</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            <p className="text-xs text-slate-400 italic">Última actualización: septiembre de 2026</p>

            <h2 className="text-base font-bold text-slate-800 mt-6">1. Datos recolectados</h2>
            <p>
              TalentoCrux recolecta los siguientes datos personales de los profesionales que se registran: nombre
              completo, profesión, barrio, horarios de atención, número de WhatsApp, fotografía de perfil,
              fotografía del DNI (frente y dorso), número de matrícula (si corresponde) y fotografía del
              comprobante de matrícula (si corresponde).
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">2. Finalidad del tratamiento</h2>
            <p>
              Los datos personales, en particular las imágenes del DNI frente/dorso y la documentación de
              matrícula, son recolectados exclusivamente para la verificación de identidad interna de
              TalentoCrux. Dichos datos no serán compartidos, publicados ni exhibidos públicamente en la
              plataforma ni cedidos a terceros.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">3. Datos visibles públicamente</h2>
            <p>
              Únicamente se muestran públicamente en la plataforma: nombre, profesión, barrio, horarios, foto de
              perfil, descripción y el sello de verificación (si corresponde). El número de WhatsApp se comparte
              únicamente cuando un usuario inicia contacto. Los datos de DNI y matrícula permanecen privados.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">4. Protección de datos personales — Ley 25.326</h2>
            <p>
              El tratamiento de los datos personales se realiza conforme a lo dispuesto por la Ley N° 25.326 de
              Protección de Datos Personales de la República Argentina y su reglamentación. El titular de los
              datos podrá ejercer en cualquier momento los derechos de acceso, rectificación, supresión y
              oposición al tratamiento de sus datos, comunicándose a: admin@cruxtalento.com.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">5. Conservación de datos</h2>
            <p>
              Los datos de documentación (DNI y matrícula) se conservarán mientras el profesional mantenga su
              cuenta activa en la plataforma, o por el plazo que exijan las normas legales aplicables. Una vez
              solicitada la baja, los datos serán eliminados de los sistemas de TalentoCrux dentro de un plazo
              razonable.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">6. Medidas de seguridad</h2>
            <p>
              TalentoCrux implementa medidas técnicas y organizativas apropiadas para proteger los datos
              personales contra accesos no autorizados, alteraciones, divulgaciones o destrucciones. Sin
              embargo, ningún sistema es completamente seguro y TalentoCrux no puede garantizar la seguridad
              absoluta de la información transmitida.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">7. Consentimiento</h2>
            <p>
              Al registrarse en la plataforma, el profesional presta su consentimiento libre, expreso e informado
              para el tratamiento de sus datos personales conforme a los términos de la presente Política de
              Privacidad y la Ley 25.326.
            </p>

            <h2 className="text-base font-bold text-slate-800 mt-6">8. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con la protección de datos, el responsable del tratamiento es
              TalentoCrux, contactable a través del correo electrónico: admin@cruxtalento.com.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
