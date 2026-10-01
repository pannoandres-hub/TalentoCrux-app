import { useEffect, useState } from 'react';
import { FileText, ShieldCheck, X } from 'lucide-react';

type LegalSection = 'terms' | 'privacy';

interface LegalModalProps {
  open: boolean;
  initialSection: LegalSection;
  onClose: () => void;
  onAccept: () => void;
}

export function LegalModal({ open, initialSection, onClose, onAccept }: LegalModalProps) {
  const [section, setSection] = useState<LegalSection>(initialSection);

  useEffect(() => {
    if (open) setSection(initialSection);
  }, [open, initialSection]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Documentos legales">
      <button aria-label="Cerrar documentos legales" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">TalentoCrux</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Documentos legales</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex gap-2 border-b border-slate-200 px-5 pt-3 sm:px-7" aria-label="Documentos legales">
          <button
            onClick={() => setSection('terms')}
            className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${section === 'terms' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <FileText className="h-4 w-4" />
            Términos y Condiciones
          </button>
          <button
            onClick={() => setSection('privacy')}
            className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${section === 'privacy' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <ShieldCheck className="h-4 w-4" />
            Política de Privacidad
          </button>
        </nav>

        <div className="overflow-y-auto px-5 py-6 sm:px-10">
          {section === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        <footer className="border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Volver al registro
            </button>
            <button onClick={onAccept} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800">
              Acepto los Términos y Condiciones y la Política de Privacidad de TalentoCrux
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <article className="legal-copy">
      <p className="text-xs italic text-slate-400">TalentoCrux — Plataforma de Anuncios y Directorio Profesional (CABA, Argentina)</p>
      <h1>Términos, Condiciones y Política de Privacidad</h1>
      <h2>1. Introducción y Marco General</h2>
      <p>El presente documento establece los Términos y Condiciones de Uso, así como la Política de Privacidad que rigen el acceso, registro y uso de la plataforma digital TalentoCrux, en adelante, la Plataforma.</p>
      <ul>
        <li><strong>Naturaleza del Servicio:</strong> TalentoCrux opera exclusivamente como un directorio interactivo intermediario y plataforma publicitaria en línea, cuyo propósito central es conectar a profesionales independientes, técnicos y prestadores de servicios con potenciales clientes dentro del ámbito de la Ciudad Autónoma de Buenos Aires y sus zonas de influencia en la República Argentina.</li>
        <li><strong>Autonomía Operativa:</strong> TalentoCrux no es una empresa de empleo, agencia de colocación ni firma de prestación de servicios profesionales directos. La Plataforma se limita a proveer un espacio digital para la difusión publicitaria.</li>
        <li><strong>Derecho de Admisión y Permanencia:</strong> TalentoCrux se reserva de manera expresa e incondicional el derecho de admisión, permanencia, suspensión o cancelación de cuentas de usuarios y anuncios dentro de la Plataforma, sin necesidad de invocación de causa previa ni responsabilidad de indemnización alguna cuando advierta incumplimiento de las presentes condiciones o vulneración de principios de buena fe y convivencia digital.</li>
      </ul>
      <h2>2. Registro de Profesionales y Verificación de Identidad</h2>
      <p>Para formar parte del directorio e interactuar como prestador dentro de la Plataforma, los profesionales o prestadores deberán completar el procedimiento de registro correspondiente.</p>
      <ul>
        <li><strong>Requisitos de Verificación:</strong> A fin de resguardar la seguridad de la comunidad, TalentoCrux exigirá la validación de identidad mediante la presentación digital del Documento Nacional de Identidad (DNI) y, en aquellos casos donde la actividad lo requiera reglamentariamente, la Matrícula Profesional habilitante emitida por la autoridad competente en la República Argentina.</li>
        <li><strong>Responsabilidad sobre Credenciales:</strong> La veracidad, vigencia y exactitud de los datos e instrumentos presentados son de exclusiva responsabilidad del profesional registrante. El usuario garantiza que posee todas las habilitaciones legales, colegiaturas y permisos requeridos para el ejercicio de la actividad promocionada.</li>
        <li><strong>Calidad del Servicio:</strong> El profesional asume de manera personal e ilimitada la responsabilidad por la idoneidad, calidad, cumplimiento, seguridad y garantismo de los servicios prestados a los clientes contactados a través de la Plataforma.</li>
      </ul>
      <h2>3. Publicación de Anuncios y Contenido Publicitario</h2>
      <p>Los anunciantes que utilicen los espacios publicitarios de TalentoCrux deberán sujetarse a las pautas operativas y legales vigentes.</p>
      <h3>Propiedad Intelectual de Contenidos Cargados</h3>
      <p>El anunciante declara ser el único titular o contar con las licencias correspondientes sobre los derechos de autor, marcas, imágenes, logotipos, videos y textos que suba o solicite publicar en la Plataforma. El anunciante mantendrá indemne a TalentoCrux frente a cualquier reclamo judicial o extrajudicial interpuesto por terceros por infracción a derechos de propiedad intelectual o de imagen.</p>
      <h3>Moderación y Remoción de Contenido</h3>
      <p>TalentoCrux se reserva la facultad discrecional de rechazar, modificar, pausar o eliminar de forma definitiva cualquier anuncio que promueva actividades ilícitas, fraudulentas, engañosas o no autorizadas, contenga material ofensivo, discriminatorio, difamatorio, violento o inapropiado, o infrinja derechos de terceros.</p>
      <h3>Deslinde de Garantías Comerciales y Disponibilidad Técnica</h3>
      <ul>
        <li><strong>Ausencia de Garantía de Conversión:</strong> TalentoCrux no garantiza un volumen mínimo de contactos, ventas, contrataciones ni conversiones comerciales derivadas de la publicación de anuncios.</li>
        <li><strong>Disponibilidad del Sistema:</strong> La Plataforma se proporciona tal cual y según disponibilidad. TalentoCrux no garantiza la disponibilidad ininterrumpida de sus servidores ni limita su responsabilidad por interrupciones técnicas, mantenimiento programado, caídas de red o fallas ajenas a su control directo.</li>
      </ul>
      <h2>4. Jurisdicción y Ley Aplicable</h2>
      <p>Los presentes Términos y Condiciones se rigen e interpretan conforme a las leyes de la República Argentina. Para cualquier controversia que pudiera derivarse del uso de la Plataforma o de la interpretación del presente texto, las partes se someten a la jurisdicción de los Tribunales Ordinarios o Comerciales con asiento en la Ciudad Autónoma de Buenos Aires (CABA), renunciando a cualquier otro fuero o jurisdicción que pudiera corresponderles.</p>
    </article>
  );
}

function PrivacyContent() {
  return (
    <article className="legal-copy">
      <h1>Política de Privacidad</h1>
      <p>TalentoCrux informa a sus usuarios sobre el tratamiento de la información recabada conforme a la Ley de Protección de los Datos Personales N° 25.326, su Decreto Reglamentario N° 1558/2001 y demás normas complementarias aplicables en la República Argentina.</p>
      <h2>1. Datos recolectados y finalidad</h2>
      <p>Los datos sensibles de verificación, incluyendo fotocopia o foto del DNI y matrícula profesional, son recolectados exclusivamente para la validación interna de identidad y antecedentes. Los datos públicos del perfil —nombre, apellido, profesión, WhatsApp, email, descripción e imagen de perfil— se utilizan para la difusión dentro del directorio y para permitir el contacto directo con clientes.</p>
      <h2>2. Tratamiento de Datos Sensibles</h2>
      <p>La documentación personal recabada para la verificación de perfil se almacena bajo estrictas medidas de seguridad físicas y digitales. En ningún caso estos datos sensibles serán vendidos, cedidos o compartidos con terceros ajenos a la estructura operativa de la Plataforma. El DNI, el frente, el dorso y la documentación de matrícula no se muestran públicamente.</p>
      <h2>3. Derechos del titular</h2>
      <p>El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo, y puede solicitar rectificación, actualización o supresión de sus datos personales comunicándose con TalentoCrux.</p>
      <h2>4. Contacto</h2>
      <p>Para consultas sobre privacidad, acceso, rectificación o supresión de datos, el titular puede comunicarse con TalentoCrux a través de admin@cruxtalento.com.</p>
    </article>
  );
}
