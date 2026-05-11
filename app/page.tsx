'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, useCallback } from 'react'

const LaserScene = dynamic(
  () => import('@/components/laser-scene').then(m => ({ default: m.LaserScene })),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded" /> }
)

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useCountUp(end: number, decimals = 0, duration = 1500) {
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  const start = useCallback(() => {
    if (started) return
    setStarted(true)
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((ease * end).toFixed(decimals)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, end, decimals, duration])
  return { val, start }
}

// ── Shared components ─────────────────────────────────────────────────────────

function AnimSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function AnimatedStat({ label, end, suffix = '', decimals = 0 }: { label: string; end: number; suffix?: string; decimals?: number }) {
  const { ref, visible } = useInView(0.3)
  const { val, start } = useCountUp(end, decimals)
  useEffect(() => { if (visible) start() }, [visible, start])
  return (
    <div ref={ref}>
      <p className="text-xl md:text-2xl font-bold text-[#E8192C]">{decimals > 0 ? val.toFixed(decimals) : val}{suffix}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function AnimBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className="h-full bg-gray-100 rounded-lg overflow-hidden">
      <div className="h-full bg-[#E8192C] rounded-lg transition-all duration-1000 ease-out"
        style={{ width: visible ? `${pct}%` : '0%', transitionDelay: `${delay}ms` }} />
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAM = ['Emmanuel', 'Jessica Juárez', 'Regina González', 'Regina Elorza', 'Andrea Piña']

const ELEMENTS = [
  { num: '01', title: 'Cargar lámina',    desc: 'Posicionamiento manual de la lámina metálica sobre la mesa de corte.' },
  { num: '02', title: 'Configurar CNC',   desc: 'Importación del archivo de diseño (DXF) y ajuste de parámetros de corte en el software de control.' },
  { num: '03', title: 'Posicionar cero',  desc: 'Establecimiento del punto de referencia para el inicio del corte.' },
  { num: '04', title: 'Ejecutar corte',   desc: 'Operación automática de la máquina; el operario supervisa el proceso.' },
  { num: '05', title: 'Retirar piezas',   desc: 'Extracción manual de las piezas cortadas de la mesa.' },
  { num: '06', title: 'Limpieza y retal', desc: 'Remoción del retal sobrante y limpieza del área de trabajo.' },
]

const OPERATORS = [
  { label: 'Operario 1', level: 'Experimentado', exp: '+3 años',  tsp: 15.14, cycles: '27 ciclos/jornada', badge: 'bg-[#E8192C] text-white' },
  { label: 'Operario 2', level: 'Intermedio',    exp: '~1 año',   tsp: 16.89, cycles: '24 ciclos/jornada', badge: 'bg-red-800 text-white' },
  { label: 'Operario 3', level: 'Novato',        exp: '<3 meses', tsp: 18.64, cycles: '22 ciclos/jornada', badge: 'bg-neutral-500 text-white' },
]

const ELEMENT_DATA = [
  { element: 'Cargar lámina',    op1: 1.85, op2: 2.10, op3: 2.65 },
  { element: 'Configurar CNC',   op1: 2.45, op2: 2.95, op3: 3.50 },
  { element: 'Posicionar cero',  op1: 1.20, op2: 1.35, op3: 1.55 },
  { element: 'Ejecutar corte',   op1: 4.05, op2: 4.13, op3: 4.16 },
  { element: 'Retirar piezas',   op1: 1.75, op2: 2.00, op3: 2.30 },
  { element: 'Limpieza y retal', op1: 2.00, op2: 2.27, op3: 2.18 },
]

const MARCO_TEORICO = [
  { term: 'Tiempo Observado (T.O.)',            def: 'Tiempo promedio que toma un operario en realizar un elemento de la tarea, calculado a partir de las observaciones registradas en varios ciclos.' },
  { term: 'Sistema Westinghouse',               def: 'Método de calificación que evalúa cuatro factores: habilidad, esfuerzo, condiciones y consistencia. F.C. = 1 + C.' },
  { term: 'Tiempo Normal (T.N.)',               def: 'Tiempo que tomaría un operario calificado en condiciones normales: T.N. = T.O. × F.C.' },
  { term: 'Suplementos por descanso',           def: 'Tiempo adicional para recuperarse de la fatiga y atender necesidades personales. Se dividen en constantes y variables.' },
  { term: 'Tiempo Estándar (T.E.S.)',           def: 'Tiempo total asignado considerando suplementos: T.E.S. = T.N. × (1 + %Suplementos).' },
  { term: 'Tiempo Estándar Permitido (T.S.P.)', def: 'Considera el tiempo real productivo dentro de una jornada laboral, descontando los suplementos del tiempo disponible.' },
]

const GALLERY = [
  { id: '1wpwmDophSGfIeKOxUKC0z3hcdwYCh2kW', label: 'Proceso de corte' },
  { id: '1kZTS2GjyPum91JiZ5HGUSAFlBM7C8bR1', label: 'Piezas terminadas' },
  { id: '1zxO8r4DWDaBWQuAimJZQTfVTze21M6MU', label: 'Operación de la máquina' },
]
const EXCEL_ID = '1OPP_TeAwLtnVYDm_2b4N55g6og1x6FVz'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-1">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M4 4L16 14L4 24" stroke="#E8192C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-900 font-bold text-lg md:text-xl tracking-wide ml-1">Herraidea</span>
          <span className="w-1.5 h-1.5 bg-[#E8192C] rounded-sm ml-1 mb-3 inline-block" />
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <a href="#empresa"      className="hover:text-[#E8192C] transition-colors">Empresa</a>
          <a href="#galeria"      className="hover:text-[#E8192C] transition-colors">Galería</a>
          <a href="#metodologia"  className="hover:text-[#E8192C] transition-colors">Metodología</a>
          <a href="#analisis"     className="hover:text-[#E8192C] transition-colors">Análisis</a>
          <a href="#conclusiones" className="hover:text-[#E8192C] transition-colors">Conclusiones</a>
        </div>
        <a href={`https://drive.google.com/uc?export=download&id=${EXCEL_ID}`} target="_blank" rel="noopener noreferrer"
          className="bg-[#E8192C] hover:bg-[#b91224] text-white text-xs md:text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          Descargar Excel
        </a>
      </nav>

      {/* HERO */}
      <section className="relative w-full bg-white overflow-hidden pt-14 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:h-screen">
          <div className="flex-none md:flex-1 px-6 py-10 md:p-16 relative z-10 flex flex-col justify-center">
            <AnimSection delay={0}>
              <span className="inline-block text-[#E8192C] text-xs md:text-sm font-semibold tracking-widest uppercase mb-3 md:mb-4">
                Estudio del Trabajo · La Salle Bajío
              </span>
              <h1 className="text-3xl md:text-6xl font-bold leading-tight text-gray-900">
                Estudio de<br />Tiempos
              </h1>
              <p className="mt-2 text-xl md:text-3xl font-semibold text-[#E8192C]">
                Cortadora Láser Fibra
              </p>
              <p className="mt-4 text-gray-500 max-w-md text-sm md:text-base leading-relaxed">
                Análisis de la operación completa en <strong className="text-gray-900">Herraidea</strong>,
                León, Guanajuato. Determinación del Tiempo Estándar Permitido con sistema de calificación Westinghouse.
              </p>
              <div className="mt-6 md:mt-8 flex flex-wrap gap-3">
                <a href={`https://drive.google.com/uc?export=download&id=${EXCEL_ID}`} target="_blank" rel="noopener noreferrer"
                  className="bg-[#E8192C] hover:bg-[#b91224] text-white font-semibold px-5 py-2.5 md:px-6 md:py-3 rounded-lg transition-all hover:scale-105 text-sm">
                  Descargar Reporte Excel
                </a>
                <a href="#empresa" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2.5 md:px-6 md:py-3 rounded-lg transition-all hover:bg-gray-50 text-sm">
                  Ver contenido
                </a>
              </div>
            </AnimSection>

            {/* Animated stats */}
            <div className="mt-8 grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6">
              <AnimatedStat label="Operarios evaluados"      end={3} />
              <AnimatedStat label="Elementos cronometrados"  end={6} />
              <AnimatedStat label="T.S.P. mínimo (min)"     end={15.14} decimals={2} />
              <AnimatedStat label="Diferencia productividad" end={23} suffix="%" />
            </div>
          </div>

          <div className="flex-none md:flex-1 h-72 md:h-auto relative bg-gray-50">
            <LaserScene className="w-full h-full" light />
          </div>
        </div>
      </section>

      {/* EMPRESA */}
      <section id="empresa" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>Sobre la empresa</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-6">Herraidea</h2>
        </AnimSection>
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          <AnimSection delay={100} className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Herraidea es una empresa ubicada en <strong className="text-gray-900">León, Guanajuato</strong>,
              dedicada a la fabricación y comercialización de <strong className="text-gray-900">herrajes de acero inoxidable 304</strong>.
            </p>
            <p>
              Dentro de sus procesos productivos cuenta con una <strong className="text-gray-900">cortadora láser fibra de metal</strong>,
              equipo de alta precisión utilizado para el corte de láminas metálicas.
            </p>
            <p>
              El presente estudio se realizó directamente en sus instalaciones, analizando la operación
              completa desde la carga de material hasta la limpieza del área de trabajo.
            </p>
          </AnimSection>
          <AnimSection delay={200} className="grid grid-cols-2 gap-3">
            <LightInfoCard label="Ubicación" value="León, Guanajuato" />
            <LightInfoCard label="Material"  value="Acero Inoxidable 304" />
            <LightInfoCard label="Equipo"    value="Cortadora Láser Fibra" />
            <LightInfoCard label="Ciclos estudiados" value="4 por operario" />
          </AnimSection>
        </div>
      </section>

      <LightDivider />

      {/* GALERÍA */}
      <section id="galeria" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>Galería del proceso</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">Imágenes y videos</h2>
          <p className="text-gray-500 mb-8 md:mb-10 text-sm md:text-base max-w-2xl">
            Material visual del proceso de operación de la cortadora láser fibra en las instalaciones de Herraidea.
          </p>
        </AnimSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {GALLERY.map(({ id, label }, i) => (
            <AnimSection key={id} delay={i * 120}>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white h-full">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe src={`https://drive.google.com/file/d/${id}/preview`}
                    className="absolute inset-0 w-full h-full" allow="autoplay" title={label} />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <a href={`https://drive.google.com/file/d/${id}/view`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#E8192C] hover:underline mt-0.5 inline-block">
                    Abrir en Drive →
                  </a>
                </div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      <LightDivider />

      {/* PROYECTO */}
      <section id="proyecto" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>El proyecto</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-8 md:mb-10">Información del equipo</h2>
        </AnimSection>
        <div className="grid md:grid-cols-3 gap-6">
          <AnimSection delay={100} className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Integrantes del equipo</p>
            <ul className="space-y-3">
              {TEAM.map((name) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#E8192C] flex-shrink-0" />
                  <span className="text-gray-800 font-medium text-sm md:text-base">{name}</span>
                </li>
              ))}
            </ul>
          </AnimSection>
          <AnimSection delay={200} className="space-y-3">
            <LightMetaCard label="Universidad" value="La Salle Bajío" />
            <LightMetaCard label="Carrera"     value="Ingeniería Industrial" />
            <LightMetaCard label="Materia"     value="Estudio del Trabajo" />
            <LightMetaCard label="Profesora"   value="Mariana Álvarez De La Cadena" />
            <LightMetaCard label="Fecha"       value="Mayo 2026" />
          </AnimSection>
        </div>
      </section>

      <LightDivider />

      {/* INTRODUCCIÓN */}
      <section id="introduccion" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>01 · Introducción</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-6 md:mb-8">¿Qué es el estudio de tiempos?</h2>
        </AnimSection>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
          <AnimSection delay={100}>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              El estudio de tiempos es una de las técnicas fundamentales de la ingeniería de métodos,
              utilizada para determinar el <strong className="text-gray-900">tiempo estándar</strong> que
              debe asignarse a una tarea específica realizada por un trabajador calificado.
            </p>
          </AnimSection>
          <AnimSection delay={200}>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Esta herramienta resulta indispensable para la planeación de la producción, el balanceo de
              líneas, la determinación de costos de mano de obra y la evaluación del desempeño de los operarios.
            </p>
          </AnimSection>
        </div>
        <AnimSection delay={100}>
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Objetivos del estudio</h3>
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {[
              'Dividir la tarea en elementos cronometrables y registrar tiempos en cuatro ciclos por operario.',
              'Aplicar el sistema de calificación Westinghouse para determinar el factor de calificación.',
              'Calcular el T.N., T.E.S. y T.S.P. considerando una jornada laboral de 480 minutos.',
              'Comparar el desempeño de tres operarios y emitir recomendaciones de mejora.',
            ].map((obj, i) => (
              <div key={i} className="flex gap-3 md:gap-4 bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                <span className="text-[#E8192C] font-bold text-base md:text-lg flex-shrink-0">{String(i+1).padStart(2,'0')}</span>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </AnimSection>
      </section>

      <LightDivider />

      {/* MARCO TEÓRICO */}
      <section id="marco" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>02 · Marco Teórico</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-8 md:mb-10">Conceptos clave</h2>
        </AnimSection>
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {MARCO_TEORICO.map(({ term, def }, i) => (
            <AnimSection key={term} delay={i * 80}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 hover:border-[#E8192C]/40 transition-colors h-full">
                <p className="text-[#E8192C] font-semibold text-xs md:text-sm mb-2">{term}</p>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{def}</p>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      <LightDivider />

      {/* DESCRIPCIÓN — Timeline */}
      <section id="tarea" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>03 · Descripción de la tarea</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3 md:mb-4">Elementos cronometrados</h2>
          <p className="text-gray-500 mb-10 md:mb-14 max-w-2xl text-sm md:text-base">
            La operación fue dividida en seis elementos cronometrables que abarcan desde la carga de
            material hasta la limpieza del área de trabajo.
          </p>
        </AnimSection>

        {/* Vertical timeline */}
        <div className="relative">
          {/* center line — hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />

          <div className="space-y-8 md:space-y-0">
            {ELEMENTS.map(({ num, title, desc }, i) => {
              const isLeft = i % 2 === 0
              return (
                <AnimSection key={num} delay={i * 100}
                  className={`md:flex md:items-center md:gap-8 md:mb-10 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Card */}
                  <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:border-[#E8192C]/40 hover:shadow-md transition-all inline-block w-full">
                      <div className={`flex items-center gap-3 mb-2 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                        <span className="text-3xl font-black text-[#E8192C]/20">{num}</span>
                        <h3 className="text-gray-900 font-semibold text-sm md:text-base">{title}</h3>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex flex-none w-10 items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-[#E8192C] border-4 border-white shadow" />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </AnimSection>
              )
            })}
          </div>
        </div>
      </section>

      <LightDivider />

      {/* METODOLOGÍA */}
      <section id="metodologia" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>04 · Metodología</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-8 md:mb-10">Método de cronometraje</h2>
        </AnimSection>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { title: 'Vuelta a cero', desc: 'Cuatro ciclos completos por cada operario con cronometraje vuelta a cero.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
            { title: 'Westinghouse', desc: 'Calificación de actuación evaluando habilidad, esfuerzo, condiciones y consistencia.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/> },
            { title: '3 Operarios', desc: 'Experimentado, intermedio y novato para reflejar la variabilidad real del personal.',
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/> },
          ].map(({ title, desc, icon }, i) => (
            <AnimSection key={title} delay={i * 100}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 h-full">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#E8192C] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                <h3 className="text-gray-900 font-semibold mb-1 md:mb-2 text-sm md:text-base">{title}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{desc}</p>
              </div>
            </AnimSection>
          ))}
        </div>
        <AnimSection delay={100}>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-6">
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              Los datos fueron capturados en una hoja de cálculo que calcula automáticamente{' '}
              <strong className="text-gray-900">T.O., F.C., T.N., suplementos, T.E.S. y T.S.P.</strong>{' '}
              Suplementos aplicados: <strong className="text-gray-900">14%</strong> uniforme para los tres operarios.
            </p>
          </div>
        </AnimSection>
      </section>

      <LightDivider />

      {/* TABLA DE TIEMPOS */}
      <section id="tabla" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>04b · Datos del estudio</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3 md:mb-4">Tiempos observados por elemento</h2>
          <p className="text-gray-500 mb-8 text-sm md:text-base max-w-2xl">
            T.O. promedio en minutos por elemento para cada operario (4 ciclos registrados).
          </p>
        </AnimSection>
        <AnimSection delay={100}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Elemento</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-[#E8192C] uppercase tracking-wider">Op. 1</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-red-800 uppercase tracking-wider">Op. 2</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Op. 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ELEMENT_DATA.map(({ element, op1, op2, op3 }, i) => (
                  <tr key={element} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800">{element}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-700">{op1.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-700">{op2.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-700">{op3.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-red-50 border-t-2 border-[#E8192C]/20 font-bold">
                  <td className="px-4 md:px-6 py-3 text-gray-900">T.S.P. Total</td>
                  <td className="px-4 md:px-6 py-3 text-center text-[#E8192C]">15.14 min</td>
                  <td className="px-4 md:px-6 py-3 text-center text-red-800">16.89 min</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-600">18.64 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimSection>
      </section>

      <LightDivider />

      {/* ANÁLISIS COMPARATIVO */}
      <section id="analisis" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>05 · Análisis comparativo</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3 md:mb-4">Resultados por operario</h2>
          <p className="text-gray-500 mb-8 md:mb-10 max-w-2xl text-sm md:text-base">
            Jornada de 480 minutos. La diferencia entre experimentado y novato es del{' '}
            <strong className="text-gray-900">23% en productividad</strong> — 5 ciclos diarios menos.
          </p>
        </AnimSection>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {OPERATORS.map(({ label, level, exp, tsp, cycles, badge }, i) => (
            <AnimSection key={label} delay={i * 120}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="p-4 md:p-6">
                  <span className={`${badge} text-xs font-bold px-2 py-1 rounded`}>{level}</span>
                  <h3 className="text-gray-900 text-lg md:text-xl font-bold mt-3 md:mt-4">{label}</h3>
                  <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">{exp} de experiencia</p>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-400">T.S.P.</span>
                      <span className="text-gray-900 font-semibold">{tsp.toFixed(2)} min</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-400">Ciclos/jornada</span>
                      <span className="text-[#E8192C] font-bold">{cycles}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimSection>
          ))}
        </div>

        {/* Bar chart */}
        <AnimSection delay={100}>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-8">
            <p className="text-sm font-semibold text-gray-700 mb-6">T.S.P. por operario — comparativa visual (min/ciclo)</p>
            <div className="space-y-5">
              {OPERATORS.map(({ label, level, tsp }, i) => {
                const pct = (tsp / 18.64) * 100
                return (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-28 md:w-36 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{level}</p>
                    </div>
                    <div className="flex-1 h-8">
                      <AnimBar pct={pct} delay={i * 150} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-16 text-right flex-shrink-0">
                      {tsp.toFixed(2)} min
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4">* Barras relativas al T.S.P. máximo (Op. 3 = 18.64 min)</p>
          </div>
        </AnimSection>

        <AnimSection delay={200} className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6">
            <h3 className="text-gray-900 font-semibold mb-2 md:mb-3 text-sm md:text-base">Observación clave</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              El elemento <strong className="text-gray-900">&ldquo;Ejecutar corte&rdquo;</strong> es casi idéntico entre operarios
              (4.05, 4.13 y 4.16 min) porque lo controla la máquina. Las diferencias significativas están en{' '}
              <strong className="text-gray-900">cargar lámina, configurar CNC y limpieza</strong>.
            </p>
          </div>
        </AnimSection>
      </section>

      <LightDivider />

      {/* CONCLUSIONES */}
      <section id="conclusiones" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>06 · Conclusiones</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-8 md:mb-10">Resultados finales</h2>
        </AnimSection>
        <div className="grid md:grid-cols-2 gap-8">
          <AnimSection delay={100} className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              El estudio permitió determinar el <strong className="text-gray-900">Tiempo Estándar Permitido</strong> con
              valores entre <strong className="text-gray-900">15.14 y 18.64 minutos por ciclo</strong>.
            </p>
            <p>
              La experiencia tiene un <strong className="text-gray-900">impacto significativo</strong> en actividades
              de manipulación manual y configuración de software, pero no en el tiempo de corte automático.
            </p>
            <p>
              Los suplementos del <strong className="text-gray-900">14%</strong> garantizan que el tiempo estándar
              refleje condiciones realistas de trabajo.
            </p>
          </AnimSection>
          <AnimSection delay={200} className="space-y-3">
            {[
              { value: '23%', text: 'Diferencia de productividad entre el operario experimentado y el novato.' },
              { value: '5',   text: 'Ciclos diarios menos que produce el operario novato respecto al experimentado.' },
              { value: '14%', text: 'Suplementos por descanso aplicados uniformemente a los tres operarios.' },
            ].map(({ value, text }) => (
              <div key={value} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start shadow-sm">
                <span className="text-[#E8192C] font-black text-xl md:text-2xl min-w-[3rem]">{value}</span>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </AnimSection>
        </div>
      </section>

      <LightDivider />

      {/* DESCARGA */}
      <section id="descarga" className="py-16 md:py-24 px-6 md:px-16 bg-gray-50">
        <AnimSection className="max-w-3xl mx-auto text-center">
          <SectionLabel className="justify-center">Reporte completo</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3 md:mb-4">Descarga el Excel</h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">
            La hoja de cálculo incluye los datos de los tres operarios, tiempos observados,
            factores Westinghouse y cálculo automático de T.N., T.E.S. y T.S.P.
          </p>
          <a href={`https://drive.google.com/uc?export=download&id=${EXCEL_ID}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#E8192C] hover:bg-[#b91224] text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all hover:scale-105 text-base md:text-lg shadow-lg shadow-red-200">
            <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Reporte Excel
          </a>
          <p className="mt-3 text-gray-400 text-xs">Descarga directa desde Google Drive</p>
        </AnimSection>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-6 md:py-8 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-gray-400 text-center md:text-left">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
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

// ── Small components ──────────────────────────────────────────────────────────

function LightInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-xs md:text-sm">{value}</p>
    </div>
  )
}

function LightMetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-xs md:text-sm">{value}</p>
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
