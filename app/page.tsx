'use client'

import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'

const TEAM = ['Emmanuel', 'Jessica Juárez', 'Regina González', 'Regina Elorza', 'Andrea Piña']

const ELEMENTS = [
  { num: '01', title: 'Cargar lámina', desc: 'Posicionamiento manual de la lámina metálica sobre la mesa de corte.' },
  { num: '02', title: 'Configurar CNC', desc: 'Importación del archivo de diseño (DXF) y ajuste de parámetros de corte en el software de control.' },
  { num: '03', title: 'Posicionar cero', desc: 'Establecimiento del punto de referencia para el inicio del corte.' },
  { num: '04', title: 'Ejecutar corte', desc: 'Operación automática de la máquina; el operario supervisa el proceso.' },
  { num: '05', title: 'Retirar piezas', desc: 'Extracción manual de las piezas cortadas de la mesa.' },
  { num: '06', title: 'Limpieza y retal', desc: 'Remoción del retal sobrante y limpieza del área de trabajo.' },
]

const OPERATORS = [
  { label: 'Operario 1', level: 'Experimentado', exp: '+3 años', tsp: '15.14 min', cycles: '27 ciclos/jornada', badge: 'bg-[#E8192C] text-white' },
  { label: 'Operario 2', level: 'Intermedio',    exp: '~1 año',   tsp: '16.89 min', cycles: '24 ciclos/jornada', badge: 'bg-red-800 text-white' },
  { label: 'Operario 3', level: 'Novato',        exp: '<3 meses', tsp: '18.64 min', cycles: '22 ciclos/jornada', badge: 'bg-neutral-500 text-white' },
]

const MARCO_TEORICO = [
  { term: 'Tiempo Observado (T.O.)', def: 'Tiempo promedio que toma un operario en realizar un elemento de la tarea, calculado a partir de las observaciones registradas en varios ciclos.' },
  { term: 'Sistema Westinghouse',    def: 'Método de calificación que evalúa cuatro factores: habilidad, esfuerzo, condiciones y consistencia. F.C. = 1 + C.' },
  { term: 'Tiempo Normal (T.N.)',    def: 'Tiempo que tomaría un operario calificado en condiciones normales: T.N. = T.O. × F.C.' },
  { term: 'Suplementos por descanso', def: 'Tiempo adicional para recuperarse de la fatiga y atender necesidades personales. Se dividen en constantes y variables.' },
  { term: 'Tiempo Estándar (T.E.S.)', def: 'Tiempo total asignado considerando suplementos: T.E.S. = T.N. × (1 + %Suplementos).' },
  { term: 'Tiempo Estándar Permitido (T.S.P.)', def: 'Considera el tiempo real productivo dentro de una jornada laboral, descontando los suplementos del tiempo disponible.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-1">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M4 4L16 14L4 24" stroke="#E8192C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-900 font-bold text-xl tracking-wide ml-1">Herraidea</span>
          <span className="w-2 h-2 bg-[#E8192C] rounded-sm ml-1 mb-3 inline-block" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="#empresa"     className="hover:text-[#E8192C] transition-colors">Empresa</a>
          <a href="#proyecto"    className="hover:text-[#E8192C] transition-colors">Proyecto</a>
          <a href="#metodologia" className="hover:text-[#E8192C] transition-colors">Metodología</a>
          <a href="#analisis"    className="hover:text-[#E8192C] transition-colors">Análisis</a>
          <a href="#conclusiones" className="hover:text-[#E8192C] transition-colors">Conclusiones</a>
        </div>
        <a href="#descarga" className="bg-[#E8192C] hover:bg-[#b91224] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Descargar Reporte
        </a>
      </nav>

      {/* HERO — dark kept intentionally for the 3D Spline scene */}
      <section className="relative w-full h-screen bg-black/[0.96] overflow-hidden pt-16">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="flex h-full">
          <div className="flex-1 p-8 md:p-16 relative z-10 flex flex-col justify-center">
            <span className="inline-block text-[#E8192C] text-sm font-semibold tracking-widest uppercase mb-4">
              Estudio del Trabajo · La Salle Bajío
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Estudio de<br />Tiempos
            </h1>
            <p className="mt-2 text-2xl md:text-3xl font-semibold text-[#E8192C]">
              Cortadora Láser Fibra
            </p>
            <p className="mt-5 text-neutral-300 max-w-md text-base leading-relaxed">
              Análisis de la operación completa de una cortadora láser fibra de metal en{' '}
              <strong className="text-white">Herraidea</strong>, León, Guanajuato. Determinación del
              Tiempo Estándar Permitido con sistema de calificación Westinghouse.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#descarga" className="bg-[#E8192C] hover:bg-[#b91224] text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105">
                Descargar Reporte Excel
              </a>
              <a href="#empresa" className="border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-lg transition-all hover:bg-white/5">
                Ver contenido
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              <HeroStat label="Operarios evaluados"     value="3" />
              <HeroStat label="Elementos cronometrados" value="6" />
              <HeroStat label="T.S.P. mínimo"           value="15.14 min" />
              <HeroStat label="Diferencia productividad" value="23%" />
            </div>
          </div>
          <div className="hidden md:flex flex-1 relative">
            <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
          </div>
        </div>
      </section>

      {/* EMPRESA */}
      <section id="empresa" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>Sobre la empresa</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-gray-900">Herraidea</h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Herraidea es una empresa ubicada en{' '}
              <strong className="text-gray-900">León, Guanajuato</strong>, dedicada a la fabricación y
              comercialización de{' '}
              <strong className="text-gray-900">herrajes de acero inoxidable 304</strong>.
            </p>
            <p>
              Dentro de sus procesos productivos cuenta con una{' '}
              <strong className="text-gray-900">cortadora láser fibra de metal</strong>, equipo de alta
              precisión utilizado para el corte de láminas metálicas que posteriormente serán trabajadas
              en otros procesos de manufactura.
            </p>
            <p>
              El presente estudio se realizó directamente en sus instalaciones, analizando la operación
              completa desde la carga de material hasta la limpieza del área de trabajo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-xl bg-gray-50 border border-gray-200 h-52 flex items-center justify-center">
              <div className="text-center p-6">
                <svg className="w-12 h-12 mx-auto mb-3 text-[#E8192C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Cortadora Láser Fibra de Metal</p>
                <p className="text-xs text-gray-400 mt-1">Instalada en taller Herraidea · León, Gto.</p>
              </div>
            </div>
            <LightInfoCard label="Material" value="Acero Inoxidable 304" />
            <LightInfoCard label="Proceso"  value="Corte láser fibra" />
          </div>
        </div>
      </section>

      <LightDivider />

      {/* PROYECTO */}
      <section id="proyecto" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>El proyecto</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-10 text-gray-900">Información del equipo</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Integrantes del equipo</p>
            <ul className="space-y-3">
              {TEAM.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#E8192C] flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <LightMetaCard label="Universidad" value="La Salle Bajío" />
            <LightMetaCard label="Carrera"     value="Ingeniería Industrial" />
            <LightMetaCard label="Materia"     value="Estudio del Trabajo" />
            <LightMetaCard label="Profesora"   value="Mariana Álvarez De La Cadena" />
            <LightMetaCard label="Fecha"       value="Mayo 2026" />
          </div>
        </div>
      </section>

      <LightDivider />

      {/* INTRODUCCIÓN */}
      <section id="introduccion" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>01 · Introducción</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-8 text-gray-900">¿Qué es el estudio de tiempos?</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <p className="text-gray-600 leading-relaxed">
            El estudio de tiempos es una de las técnicas fundamentales de la ingeniería de métodos,
            utilizada para determinar el <strong className="text-gray-900">tiempo estándar</strong> que
            debe asignarse a una tarea específica realizada por un trabajador calificado.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Esta herramienta resulta indispensable para la planeación de la producción, el balanceo de
            líneas, la determinación de costos de mano de obra y la evaluación del desempeño de los operarios.
          </p>
        </div>
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Objetivos del estudio</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Dividir la tarea en elementos cronometrables y registrar tiempos en cuatro ciclos por operario.',
            'Aplicar el sistema de calificación Westinghouse para determinar el factor de calificación.',
            'Calcular el T.N., T.E.S. y T.S.P. considerando una jornada laboral de 480 minutos.',
            'Comparar el desempeño de tres operarios y emitir recomendaciones de mejora.',
          ].map((obj, i) => (
            <div key={i} className="flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <span className="text-[#E8192C] font-bold text-lg flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-gray-600 text-sm leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </section>

      <LightDivider />

      {/* MARCO TEÓRICO */}
      <section id="marco" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>02 · Marco Teórico</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-10 text-gray-900">Conceptos clave</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {MARCO_TEORICO.map(({ term, def }) => (
            <div key={term} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-[#E8192C]/40 transition-colors">
              <p className="text-[#E8192C] font-semibold text-sm mb-2">{term}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{def}</p>
            </div>
          ))}
        </div>
      </section>

      <LightDivider />

      {/* DESCRIPCIÓN DE LA TAREA */}
      <section id="tarea" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>03 · Descripción de la tarea</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900">Elementos cronometrados</h2>
        <p className="text-gray-500 mb-10 max-w-2xl">
          La operación de la cortadora láser fue dividida en seis elementos cronometrables que abarcan
          desde la carga de material hasta la limpieza del área de trabajo.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ELEMENTS.map(({ num, title, desc }) => (
            <div key={num} className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-[#E8192C]/50 hover:shadow-md transition-all">
              <span className="text-5xl font-black text-[#E8192C]/15 group-hover:text-[#E8192C]/30 transition-colors">{num}</span>
              <h3 className="text-gray-900 font-semibold mt-2 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <LightDivider />

      {/* METODOLOGÍA */}
      <section id="metodologia" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>04 · Metodología</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-10 text-gray-900">Método de cronometraje</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Vuelta a cero',
              desc: 'Método de cronometraje con vuelta a cero, tomando cuatro ciclos completos por cada operario.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
            },
            {
              title: 'Westinghouse',
              desc: 'Calificación de actuación evaluando habilidad, esfuerzo, condiciones y consistencia de cada operario.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
            },
            {
              title: '3 Operarios',
              desc: 'Experimentado, intermedio y novato para reflejar la variabilidad real del personal de la empresa.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
            },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <svg className="w-8 h-8 text-[#E8192C] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
              <h3 className="text-gray-900 font-semibold mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Los datos fueron capturados en una hoja de cálculo que realiza automáticamente los cálculos de{' '}
            <strong className="text-gray-900">T.O., F.C., T.N., suplementos, T.E.S. y T.S.P.</strong> Los suplementos
            aplicados son los mismos para los tres operarios (<strong className="text-gray-900">14%</strong>),
            dado que comparten el mismo ambiente de trabajo.
          </p>
        </div>
      </section>

      <LightDivider />

      {/* ANÁLISIS COMPARATIVO */}
      <section id="analisis" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>05 · Análisis comparativo</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900">Resultados por operario</h2>
        <p className="text-gray-500 mb-10 max-w-2xl">
          Jornada laboral de 480 minutos. La diferencia entre el operario experimentado y el novato
          representa un <strong className="text-gray-900">23% en productividad</strong> — equivalente a 5 ciclos diarios menos.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {OPERATORS.map(({ label, level, exp, tsp, cycles, badge }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <span className={`${badge} text-xs font-bold px-2 py-1 rounded`}>{level}</span>
                <h3 className="text-gray-900 text-xl font-bold mt-4">{label}</h3>
                <p className="text-gray-400 text-sm mb-6">{exp} de experiencia</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">T.S.P.</span>
                    <span className="text-gray-900 font-semibold">{tsp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ciclos/jornada</span>
                    <span className="text-[#E8192C] font-bold">{cycles}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-gray-900 font-semibold mb-3">Observación clave</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            El elemento <strong className="text-gray-900">&ldquo;Ejecutar corte&rdquo;</strong> presenta tiempos muy similares entre los
            tres operarios (4.05, 4.13 y 4.16 min), ya que está determinado principalmente por la máquina y el
            programa de corte. Las diferencias más significativas se observan en{' '}
            <strong className="text-gray-900">cargar lámina, configurar CNC y limpieza</strong> — actividades que
            dependen directamente de la habilidad del operario.
          </p>
        </div>
      </section>

      <LightDivider />

      {/* CONCLUSIONES */}
      <section id="conclusiones" className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <SectionLabel>06 · Conclusiones</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-10 text-gray-900">Resultados finales</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              El estudio permitió determinar el <strong className="text-gray-900">Tiempo Estándar Permitido</strong> para
              la operación de la cortadora láser fibra, obteniendo valores entre{' '}
              <strong className="text-gray-900">15.14 y 18.64 minutos por ciclo</strong>.
            </p>
            <p>
              Se confirma que la experiencia tiene un{' '}
              <strong className="text-gray-900">impacto significativo en la productividad</strong>,
              especialmente en manipulación manual y configuración de software.
            </p>
            <p>
              La metodología Westinghouse permitió calificar objetivamente a cada operario. Los suplementos
              del <strong className="text-gray-900">14%</strong> garantizan que el tiempo estándar refleje
              condiciones realistas de trabajo.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { value: '23%', text: 'Diferencia de productividad entre el operario experimentado y el novato.' },
              { value: '5',   text: 'Ciclos diarios menos que produce el operario novato respecto al experimentado.' },
              { value: '14%', text: 'Suplementos por descanso aplicados uniformemente a los tres operarios.' },
            ].map(({ value, text }) => (
              <div key={value} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-start shadow-sm">
                <span className="text-[#E8192C] font-black text-2xl min-w-[3.5rem]">{value}</span>
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LightDivider />

      {/* DESCARGA */}
      <section id="descarga" className="py-24 px-6 md:px-16 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel className="justify-center">Reporte completo</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900">Descarga el Excel</h2>
          <p className="text-gray-500 mb-8">
            La hoja de cálculo incluye los datos de los tres operarios, tiempos observados por ciclo,
            factores de calificación Westinghouse, suplementos y cálculo automático de T.N., T.E.S. y T.S.P.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-3 bg-[#E8192C] hover:bg-[#b91224] text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg shadow-lg shadow-red-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Reporte Excel
          </a>
          <p className="mt-4 text-gray-400 text-sm">Enlace disponible próximamente · Google Drive</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-8 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M4 4L16 14L4 24" stroke="#E8192C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-gray-900 font-semibold">Herraidea</span>
            <span className="text-gray-400 ml-1">· León, Guanajuato</span>
          </div>
          <p>Estudio del Trabajo · La Salle Bajío · Ingeniería Industrial · Mayo 2026</p>
        </div>
      </footer>

    </main>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-[#E8192C]">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  )
}

function LightInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-sm">{value}</p>
    </div>
  )
}

function LightMetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-sm">{value}</p>
    </div>
  )
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="w-2 h-2 rounded-full bg-[#E8192C]" />
      <span className="text-[#E8192C] text-xs font-semibold tracking-widest uppercase">{children}</span>
    </div>
  )
}

function LightDivider() {
  return <div className="w-full h-px bg-gray-100 max-w-6xl mx-auto" />
}
