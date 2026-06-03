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

function AnimGroupedBar({ op1, op2, op3, max, delay = 0 }: { op1: number; op2: number; op3: number; max: number; delay?: number }) {
  const { ref, visible } = useInView()
  const bars = [
    { val: op1, color: 'bg-[#E8192C]' },
    { val: op2, color: 'bg-red-800' },
    { val: op3, color: 'bg-neutral-400' },
  ]
  return (
    <div ref={ref} className="space-y-1.5">
      {bars.map(({ val, color }, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: visible ? `${(val / max) * 100}%` : '0%', transitionDelay: `${delay + i * 80}ms` }} />
          </div>
          <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{val.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

function MtmAccordion({ elements }: { elements: typeof MTM_ELEMENTS }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      {elements.map(({ num, title, tmu, tEstandar, subElems, keyMovements, note }) => (
        <div key={num} className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === num ? null : num)}
            className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[#E8192C] font-black text-xl leading-none flex-shrink-0">{num}</span>
              <span className="font-semibold text-gray-800 text-sm md:text-base truncate">{title}</span>
            </div>
            <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-400">TMU</p>
                <p className="text-sm font-bold text-gray-700 tabular-nums">{tmu.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">T. Estándar</p>
                <p className="text-sm font-bold text-[#E8192C] tabular-nums">{tEstandar.toFixed(2)} seg</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === num ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {open === num && (
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 md:px-6 py-4">
              <table className="w-full text-xs mb-3">
                <thead>
                  <tr className="text-gray-400 text-left">
                    <th className="pb-2 font-medium">Sub-elemento</th>
                    <th className="pb-2 font-medium text-right w-20">TMU</th>
                    <th className="pb-2 font-medium text-right w-24">T.Est. (seg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subElems.map(({ desc, tmu: t, tseg }) => (
                    <tr key={desc}>
                      <td className="py-1.5 text-gray-700 pr-4">{desc}</td>
                      <td className="py-1.5 text-right text-gray-500 font-mono tabular-nums">{t.toFixed(1)}</td>
                      <td className="py-1.5 text-right text-gray-900 font-mono font-semibold tabular-nums">{tseg.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-600">Movimientos clave: </span>{keyMovements}
              </p>
              {note && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700"><strong>Nota: </strong>{note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
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
  { element: 'Cargar lámina',    op1: 2.40, op2: 2.88, op3: 3.61 },
  { element: 'Configurar CNC',   op1: 1.23, op2: 1.73, op3: 2.63 },
  { element: 'Posicionar cero',  op1: 0.57, op2: 0.86, op3: 1.31 },
  { element: 'Ejecutar corte',   op1: 4.07, op2: 4.13, op3: 4.16 },
  { element: 'Retirar piezas',   op1: 1.44, op2: 1.83, op3: 2.46 },
  { element: 'Limpieza y retal', op1: 1.06, op2: 1.43, op3: 1.87 },
]

const WESTINGHOUSE = [
  { op: 'Op. 1', level: 'Experimentado', fc: 1.21, badge: 'bg-[#E8192C] text-white', sum: '+0.21',
    factors: [
      { name: 'Habilidad',    grade: 'B2 Excelente', val:  0.08, note: '>3 años operando; parámetros CNC de memoria, posiciona el cero al primer intento.' },
      { name: 'Esfuerzo',     grade: 'B2 Excelente', val:  0.08, note: 'Ritmo constante; aprovecha los tiempos de corte automático para preparar la siguiente lámina.' },
      { name: 'Condiciones',  grade: 'C Buenas',     val:  0.02, note: 'Iluminación y máquina en buen estado; ruido ambiental y temperatura no controlada.' },
      { name: 'Consistencia', grade: 'B Excelente',  val:  0.03, note: 'Variaciones <0.15 min entre ciclos; método completamente interiorizado.' },
    ],
  },
  { op: 'Op. 2', level: 'Intermedio', fc: 1.14, badge: 'bg-red-800 text-white', sum: '+0.14',
    factors: [
      { name: 'Habilidad',    grade: 'C1 Buena',    val:  0.06, note: 'Conoce el flujo pero consulta parámetros ocasionalmente; movimientos correctos, no optimizados.' },
      { name: 'Esfuerzo',     grade: 'C1 Bueno',    val:  0.05, note: 'Buen ritmo; se detiene a verificar decisiones que el experimentado ya automatizó.' },
      { name: 'Condiciones',  grade: 'C Buenas',    val:  0.02, note: 'Mismas condiciones de taller que Op. 1.' },
      { name: 'Consistencia', grade: 'C Buena',     val:  0.01, note: 'Variación moderada ~0.3 min entre ciclos; técnica en proceso de estandarización.' },
    ],
  },
  { op: 'Op. 3', level: 'Novato', fc: 1.00, badge: 'bg-neutral-500 text-white', sum: '±0.00',
    factors: [
      { name: 'Habilidad',    grade: 'D Regular',   val:  0.00, note: 'Titubea al configurar parámetros y posicionar el cero; técnica aún en formación.' },
      { name: 'Esfuerzo',     grade: 'D Regular',   val:  0.00, note: 'Revisa todo dos veces por inseguridad; no es falta de ganas sino de automatización.' },
      { name: 'Condiciones',  grade: 'C Buenas',    val:  0.02, note: 'Mismas condiciones de taller.' },
      { name: 'Consistencia', grade: 'E Aceptable', val: -0.02, note: 'Alta variación entre ciclos; sin método repetible todavía, típico en curva de aprendizaje.' },
    ],
  },
]

const MARCO_TEORICO = [
  { term: 'Tiempo Observado (T.O.)',            def: 'Tiempo promedio que toma un operario en realizar un elemento de la tarea, calculado a partir de las observaciones registradas en varios ciclos.' },
  { term: 'Sistema Westinghouse',               def: 'Método de calificación que evalúa cuatro factores: habilidad, esfuerzo, condiciones y consistencia. F.C. = 1 + C.' },
  { term: 'Tiempo Normal (T.N.)',               def: 'Tiempo que tomaría un operario calificado en condiciones normales: T.N. = T.O. × F.C.' },
  { term: 'Suplementos por descanso',           def: 'Tiempo adicional para recuperarse de la fatiga y atender necesidades personales. Se dividen en constantes y variables.' },
  { term: 'Tiempo Estándar (T.E.S.)',           def: 'Tiempo total asignado considerando suplementos: T.E.S. = T.N. × (1 + %Suplementos).' },
  { term: 'Tiempo Estándar Permitido (T.S.P.)', def: 'Considera el tiempo real productivo dentro de una jornada laboral, descontando los suplementos del tiempo disponible.' },
]

const COMPARISON = [
  { aspect: 'Base del tiempo',         crono: 'Medición directa con cronómetro en producción real',              mtm: 'Tablas de valores predeterminados por movimiento básico (TMU)' },
  { aspect: 'Cuándo aplicar',          crono: 'Solo cuando la operación ya existe y se realiza',                  mtm: 'Antes o durante la producción; incluso por visualización/simulación' },
  { aspect: 'Unidad de tiempo',        crono: 'Minutos / segundos',                                               mtm: '1 TMU = 0.0006 min = 0.036 seg' },
  { aspect: 'Nivel de análisis',       crono: '6 elementos de tarea (análisis macro)',                            mtm: 'Micromovimientos: Alcanzar, Mover, Asir, Soltar, Girar, Posicionar…' },
  { aspect: 'Calificación',            crono: 'Requerida — Sistema Westinghouse (Habilidad, Esfuerzo, Condiciones, Consistencia)', mtm: 'No requerida — tiempos predeterminados son independientes del operario' },
  { aspect: 'Objetividad',             crono: 'Moderada — depende del juicio del analista para calificar',        mtm: 'Alta — valores fijos en tablas, sin calificación subjetiva' },
  { aspect: 'Velocidad de aplicación', crono: 'Rápida — pocos ciclos completos',                                  mtm: 'Lenta — análisis movimiento a movimiento' },
  { aspect: 'Entrenamiento',           crono: 'Básico — cronometraje y sistema Westinghouse',                     mtm: 'Especializado — identificación de 20+ movimientos básicos y tablas TMU' },
  { aspect: 'En este estudio',         crono: '✓ Aplicado — 4 ciclos × 3 operarios',                             mtm: 'No aplicado' },
]

const MTM_MOVEMENTS = [
  { symbol: 'R',  name: 'Alcanzar',         apply: 'Extender el brazo hacia la lámina, los controles del CNC o el botón de inicio.' },
  { symbol: 'M',  name: 'Mover',            apply: 'Desplazar la lámina metálica desde el almacén hasta la mesa de corte.' },
  { symbol: 'G',  name: 'Asir',             apply: 'Tomar la lámina, el retal sobrante o las piezas ya cortadas.' },
  { symbol: 'RL', name: 'Soltar',           apply: 'Depositar las piezas o el retal al concluir su transporte.' },
  { symbol: 'P',  name: 'Posicionar',       apply: 'Alinear la lámina sobre la mesa de corte y fijar el punto cero.' },
  { symbol: 'AP', name: 'Aplicar presión',  apply: 'Presionar teclas del teclado CNC o sujetar la lámina contra la guía.' },
]

const METHOD_SCORES = [
  { label: 'Objetividad',             crono: 55, mtm: 90 },
  { label: 'Velocidad de aplicación', crono: 90, mtm: 25 },
  { label: 'Detalle de análisis',     crono: 45, mtm: 95 },
  { label: 'Facilidad de uso',        crono: 85, mtm: 30 },
]

const MTM_ELEMENTS = [
  { num:'01', title:'Cargar lámina metálica', tmu:324.0, tNivelado:11.66, tolerancia:1.40, tEstandar:13.06, tmuPct:100,
    subElems:[
      { desc:'Traslado al almacén y agarre de lámina', tmu:173.5, tseg:7.00 },
      { desc:'Traslado a mesa y deposición',            tmu:150.5, tseg:6.07 },
    ], keyMovements:'R45B, G1A, AP1, B, AAOK, M60C, P2NSE, W_PO (×5), EF, RL1',
  },
  { num:'02', title:'Configurar CNC', tmu:214.5, tNivelado:7.72, tolerancia:0.93, tEstandar:8.65, tmuPct:66,
    subElems:[
      { desc:'Desplazamiento y acceso al panel', tmu:62.5,  tseg:2.52 },
      { desc:'Navegación al programa',           tmu:64.3,  tseg:2.59 },
      { desc:'Configuración de parámetros',      tmu:87.7,  tseg:3.54 },
    ], keyMovements:'W_PO (×3), R30A, G5, AP1 (×8), EF (×5), ET, RL1',
  },
  { num:'03', title:'Posicionar cero pieza', tmu:90.0, tNivelado:3.24, tolerancia:0.39, tEstandar:3.63, tmuPct:28,
    subElems:[
      { desc:'Toma de joystick',         tmu:18.2, tseg:0.73 },
      { desc:'Movimiento de ejes X y Y', tmu:44.1, tseg:1.78 },
      { desc:'Confirmación del cero',    tmu:27.7, tseg:1.12 },
    ], keyMovements:'R30A, G1C2, M15B, M15C (×2), EF (×4), AP1 (×2), RL1',
  },
  { num:'04', title:'Ejecutar corte (parte manual)', tmu:133.9, tNivelado:4.82, tolerancia:0.58, tEstandar:5.40, tmuPct:41,
    subElems:[
      { desc:'Inicio del corte (manual)',         tmu:56.1, tseg:2.26 },
      { desc:'Monitoreo visual durante el corte', tmu:43.8, tseg:1.77 },
      { desc:'Acercamiento al finalizar',         tmu:34.0, tseg:1.37 },
    ], keyMovements:'W_PO (×2), R30A, AP1, RL1, EF (×6)',
    note:'El tiempo de máquina (~4 min) no es captado por MTM-1. El TMU manual aquí calculado representa únicamente la actividad humana.',
  },
  { num:'05', title:'Retirar piezas cortadas', tmu:176.1, tNivelado:6.34, tolerancia:0.76, tEstandar:7.10, tmuPct:54,
    subElems:[
      { desc:'Aproximación a la mesa',                   tmu:34.0, tseg:1.37 },
      { desc:'Retiro pieza por pieza (3 piezas grandes)', tmu:96.0, tseg:3.87 },
      { desc:'Retiro de grupo de piezas pequeñas',       tmu:38.8, tseg:1.56 },
      { desc:'Inspección final',                          tmu:7.3,  tseg:0.29 },
    ], keyMovements:'W_PO (×2), R30B, R30C, G1A, G4A, M45B (×4), RL1 (×4), EF',
  },
  { num:'06', title:'Limpieza y retal', tmu:299.2, tNivelado:10.77, tolerancia:1.29, tEstandar:12.06, tmuPct:92,
    subElems:[
      { desc:'Levantar y trasladar retal al contenedor', tmu:134.9, tseg:5.44 },
      { desc:'Regreso a la mesa',                         tmu:51.0,  tseg:2.06 },
      { desc:'Limpieza de la mesa con cepillo',           tmu:88.9,  tseg:3.58 },
      { desc:'Verificación y resguardo de herramienta',   tmu:24.4,  tseg:0.98 },
    ], keyMovements:'R45B, G1A, AP1, AAOK, W_PO (×3), M60B (×5), RL1, G1C1, EF',
  },
]

const MTM_COMPARISON_REAL = [
  { elem:'01', desc:'Cargar lámina',   crono:3.31, mtm:0.22, delta:-3.09, pct:-93 },
  { elem:'02', desc:'Configurar CNC',  crono:1.69, mtm:0.14, delta:-1.55, pct:-91 },
  { elem:'03', desc:'Posicionar cero', crono:0.79, mtm:0.06, delta:-0.73, pct:-92 },
  { elem:'04', desc:'Ejecutar corte',  crono:5.61, mtm:0.09, delta:-5.52, pct:-98 },
  { elem:'05', desc:'Retirar piezas',  crono:1.99, mtm:0.12, delta:-1.87, pct:-94 },
  { elem:'06', desc:'Limpieza/retal',  crono:1.46, mtm:0.20, delta:-1.26, pct:-86 },
]

const GALLERY = [
  { id: '1wpwmDophSGfIeKOxUKC0z3hcdwYCh2kW', label: 'Proceso de corte' },
  { id: '1kZTS2GjyPum91JiZ5HGUSAFlBM7C8bR1', label: 'Piezas terminadas' },
  { id: '1zxO8r4DWDaBWQuAimJZQTfVTze21M6MU', label: 'Operación de la máquina' },
  { id: '1mJwAORMU29gQ7-e6emWbjfD42u86R9nX', label: 'Video del proceso' },
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
          <a href="#comparacion"  className="hover:text-[#E8192C] transition-colors">MTM</a>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
                <tr className="bg-gray-100 border-t border-gray-200 font-semibold">
                  <td className="px-4 md:px-6 py-3 text-gray-700">Suma T.O.</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-700">10.77 min</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-700">12.86 min</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-700">16.04 min</td>
                </tr>
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

        {/* Grouped bar chart */}
        <AnimSection delay={200} className="mt-8">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm font-semibold text-gray-700">T.O. promedio por elemento (min)</p>
              <div className="flex gap-4">
                {([['Op. 1','bg-[#E8192C]'],['Op. 2','bg-red-800'],['Op. 3','bg-neutral-400']] as const).map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              {ELEMENT_DATA.map(({ element, op1, op2, op3 }, i) => (
                <div key={element} className="flex items-start gap-4">
                  <div className="w-28 md:w-36 flex-shrink-0 pt-0.5">
                    <p className="text-xs font-medium text-gray-700 leading-tight">{element}</p>
                  </div>
                  <div className="flex-1">
                    <AnimGroupedBar op1={op1} op2={op2} op3={op3} max={4.16} delay={i * 100} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
              <span>Op.1: <strong className="text-gray-800">10.77 min/ciclo</strong></span>
              <span>Op.2: <strong className="text-gray-800">12.86 min/ciclo</strong></span>
              <span>Op.3: <strong className="text-gray-800">16.04 min/ciclo</strong></span>
              <span className="md:ml-auto">Promedio general: <strong className="text-gray-800">13.22 min/ciclo</strong></span>
            </div>
          </div>
        </AnimSection>
      </section>

      <LightDivider />

      {/* WESTINGHOUSE */}
      <section id="westinghouse" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>04c · Calificación de actuación</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3 md:mb-4">Sistema Westinghouse</h2>
          <p className="text-gray-500 mb-8 text-sm md:text-base max-w-2xl">
            Evaluación de cuatro factores por operario. La suma de valores (C) determina el Factor de Calificación:{' '}
            <strong className="text-gray-900">F.C. = 1 + C</strong>.
          </p>
        </AnimSection>

        {/* Overview table */}
        <AnimSection delay={100}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Factor</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-[#E8192C] uppercase tracking-wider">Op. 1 Exp.</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-red-800 uppercase tracking-wider">Op. 2 Inter.</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Op. 3 Novato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {['Habilidad','Esfuerzo','Condiciones','Consistencia'].map((factor, fi) => (
                  <tr key={factor} className={fi % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800">{factor}</td>
                    {WESTINGHOUSE.map(({ factors }, oi) => {
                      const f = factors[fi]
                      return (
                        <td key={oi} className="px-4 md:px-6 py-3 text-center">
                          <span className="text-xs text-gray-600">{f.grade}</span>
                          <span className={`ml-2 text-xs font-bold ${f.val > 0 ? 'text-[#E8192C]' : f.val < 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {f.val > 0 ? `+${f.val.toFixed(2)}` : f.val.toFixed(2)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-red-50 border-t-2 border-[#E8192C]/20 font-bold">
                  <td className="px-4 md:px-6 py-3 text-gray-900">F.C. = 1 + Σ C</td>
                  {WESTINGHOUSE.map(({ fc, sum }, i) => (
                    <td key={i} className="px-4 md:px-6 py-3 text-center">
                      <span className="text-gray-400 text-xs font-normal">{sum} → </span>
                      <span className={`text-sm font-bold ${i === 0 ? 'text-[#E8192C]' : i === 1 ? 'text-red-800' : 'text-gray-600'}`}>{fc.toFixed(2)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </AnimSection>

        {/* Operator cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {WESTINGHOUSE.map(({ op, level, fc, badge, factors }, i) => (
            <AnimSection key={op} delay={i * 120}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`${badge} text-xs font-bold px-2 py-1 rounded`}>{level}</span>
                    <h3 className="text-gray-900 font-bold mt-2 text-base">{op}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">F.C.</p>
                    <p className="text-2xl font-black text-[#E8192C]">{fc.toFixed(2)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {factors.map(({ name, grade, val, note }) => (
                    <div key={name} className="border-l-2 border-gray-100 pl-3">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{name}</span>
                        <span className={`text-xs font-bold whitespace-nowrap ${val > 0 ? 'text-[#E8192C]' : val < 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)} · {grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimSection>
          ))}
        </div>

        {/* Conclusion */}
        <AnimSection delay={300} className="mt-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-6">
            <h3 className="text-gray-900 font-semibold mb-2 text-sm md:text-base">Interpretación</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              El Operario 1 trabaja <strong className="text-gray-900">21% más rápido</strong> que el ritmo normal de referencia;
              el Operario 2, <strong className="text-gray-900">14% más rápido</strong>; y el Operario 3{' '}
              <strong className="text-gray-900">exactamente en el ritmo normal</strong> (F.C. = 1.00), pero con baja consistencia.
              Al calcular T.N. = T.O. × F.C., se normaliza el tiempo de los operarios más rápidos al ritmo promedio estándar.
            </p>
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

      {/* COMPARACIÓN MTM */}
      <section id="comparacion" className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <AnimSection>
          <SectionLabel>07 · Comparación de métodos</SectionLabel>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-6 md:mb-8">Cronometraje vs MTM</h2>
        </AnimSection>

        {/* Aplicación MTM-1 en Herraidea */}
        <AnimSection delay={100}>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6">
            <p className="text-[#E8192C] text-xs font-semibold uppercase tracking-widest mb-2">Aplicación a la operación de Herraidea</p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Se aplicó MTM-1 a los mismos <strong className="text-gray-900">6 elementos</strong> estudiados por cronometraje,
              descomponiendo cada uno en movimientos bimanuales básicos. El análisis arrojó{' '}
              <strong className="text-gray-900">1,237.7 TMU</strong> de movimiento manual, equivalentes a{' '}
              <strong className="text-gray-900">49.9 segundos</strong> de tiempo estándar (con 12% de tolerancia).
              El tiempo de máquina del corte láser (<strong className="text-gray-900">~4 min</strong>) no es captado por MTM-1,
              ya que el método solo contabiliza movimientos humanos.
            </p>
          </div>
        </AnimSection>

        {/* Accordion por elemento */}
        <AnimSection delay={150}>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Análisis de movimientos por elemento</h3>
          <p className="text-gray-500 text-xs md:text-sm mb-4">Haz clic en cada elemento para ver el desglose de sub-elementos y movimientos MTM aplicados.</p>
          <MtmAccordion elements={MTM_ELEMENTS} />
        </AnimSection>

        {/* Resumen consolidado MTM */}
        <AnimSection delay={100} className="mt-8 mb-10">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Resumen consolidado MTM-1</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Elemento</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">TMU Total</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivelado (s)</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">+12%</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-[#E8192C] uppercase tracking-wider">T. Estándar (s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MTM_ELEMENTS.map(({ num, title, tmu, tNivelado, tolerancia, tEstandar }, i) => (
                  <tr key={num} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800 text-xs md:text-sm">{num}. {title}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-600 font-mono text-xs tabular-nums">{tmu.toFixed(1)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-600 font-mono text-xs tabular-nums">{tNivelado.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-400 font-mono text-xs tabular-nums">{tolerancia.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-[#E8192C] font-bold text-xs tabular-nums">{tEstandar.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-red-50 border-t-2 border-[#E8192C]/20 font-bold">
                  <td className="px-4 md:px-6 py-3 text-gray-900">TOTAL</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-700 font-mono text-xs tabular-nums">1,237.7</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-700 font-mono text-xs tabular-nums">44.56</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-400 font-mono text-xs tabular-nums">5.35</td>
                  <td className="px-4 md:px-6 py-3 text-center text-[#E8192C] font-mono text-sm tabular-nums">49.90</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TMU bar chart */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-8">
            <p className="text-sm font-semibold text-gray-700 mb-5">TMU por elemento — parte manual</p>
            <div className="space-y-4">
              {MTM_ELEMENTS.map(({ num, title, tmu, tmuPct }, i) => (
                <div key={num} className="flex items-center gap-4">
                  <div className="w-28 md:w-40 flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700 leading-tight">{num}. {title.split(' ').slice(0, 2).join(' ')}</p>
                  </div>
                  <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden">
                    <AnimBar pct={tmuPct} delay={i * 80} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-20 text-right flex-shrink-0 tabular-nums">{tmu.toFixed(0)} TMU</span>
                </div>
              ))}
            </div>
          </div>
        </AnimSection>

        {/* Comparación real con cronometraje */}
        <AnimSection delay={100} className="mb-10">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Comparación real: Cronometraje vs MTM-1</h3>
          <p className="text-gray-500 text-xs md:text-sm mb-5">Operario 1 (Experimentado) · F.C. = 1.21 · Suplementos = 14% (cronometraje) / 12% (MTM)</p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Elemento</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-[#E8192C] uppercase tracking-wider">Crono T.E.S. (min)</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MTM-1 (min)</th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Δ Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MTM_COMPARISON_REAL.map(({ elem, desc, crono, mtm, delta, pct }, i) => (
                  <tr key={elem} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800 text-xs md:text-sm">{elem}. {desc}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-[#E8192C] font-mono text-xs tabular-nums">{crono.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center text-gray-600 font-mono text-xs tabular-nums">{mtm.toFixed(2)}</td>
                    <td className="px-4 md:px-6 py-3 text-center">
                      <span className="text-xs font-bold text-orange-500 tabular-nums">{delta.toFixed(2)} ({pct}%)</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-50 border-t-2 border-[#E8192C]/20 font-bold">
                  <td className="px-4 md:px-6 py-3 text-gray-900">TOTAL</td>
                  <td className="px-4 md:px-6 py-3 text-center text-[#E8192C] font-mono tabular-nums">14.85</td>
                  <td className="px-4 md:px-6 py-3 text-center text-gray-600 font-mono tabular-nums">0.83</td>
                  <td className="px-4 md:px-6 py-3 text-center text-orange-500 font-bold">−14.02 min</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
            <h4 className="text-gray-900 font-semibold mb-1 text-sm">Lectura de las diferencias</h4>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              La mayor brecha está en el <strong className="text-gray-900">Elemento 4 (Ejecutar corte)</strong>:
              el cronometraje registra 5.61 min y el MTM-1 solo 0.09 min (−98%). No es un error metodológico —
              el corte lo ejecuta la máquina y MTM-1 no contempla tiempo de máquina. En los elementos manuales
              (1, 2, 5 y 6) la diferencia es menor: refleja que MTM asume el método óptimo sin desviaciones,
              mientras el cronometraje mide al operario real con todas sus variaciones.
            </p>
          </div>
        </AnimSection>

        {/* MTM Hero Banner */}
        <AnimSection delay={100}>
          <div className="bg-gray-900 rounded-2xl p-7 md:p-12 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#E8192C]/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E8192C]/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-8 items-start">

              {/* Izquierda: acrónimo + definición */}
              <div>
                <div className="flex gap-0.5 mb-3">
                  {['M','T','M'].map((l, i) => (
                    <span key={i} className={`text-6xl md:text-8xl font-black leading-none ${i % 2 === 0 ? 'text-[#E8192C]' : 'text-white'}`}>{l}</span>
                  ))}
                </div>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Methods Time Measurement · Sistema MTM-1</p>
                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4">
                  Conjunto de tablas de movimientos-tiempo que permite calcular el tiempo estándar descomponiendo
                  cualquier operación manual en movimientos básicos con valores predeterminados —{' '}
                  <strong className="text-white">sin necesidad de cronómetro ni de calificar al operario</strong>.
                </p>
                <p className="text-white/60 text-sm leading-relaxed mb-5">
                  Existen alrededor de <strong className="text-white">50 sistemas diferentes</strong> de tiempos predeterminados.
                  El MTM-1 es el más extendido en la industria manufacturera.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['MTM-1','Work-Factor','MOST','MODAPTS'].map(s => (
                    <span key={s} className={`text-xs px-3 py-1 rounded-full border ${s === 'MTM-1' ? 'bg-[#E8192C]/20 border-[#E8192C]/40 text-[#E8192C]' : 'bg-white/5 border-white/10 text-white/50'}`}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Derecha: datos clave */}
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[#E8192C] text-xs font-semibold uppercase tracking-widest mb-2">Unidad de tiempo — TMU</p>
                  <p className="text-white font-black text-2xl mb-1">1 TMU</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                    <span>= 0.0006 min</span>
                    <span>= 0.036 seg</span>
                    <span>= 0.00001 hr</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[#E8192C] text-xs font-semibold uppercase tracking-widest mb-3">Formas de aplicación</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-white font-semibold text-sm">Observación directa</p>
                      <p className="text-white/40 text-xs mt-1">Sobre el proceso en curso</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-white font-semibold text-sm">Visualización</p>
                      <p className="text-white/40 text-xs mt-1">Sin proceso real, por simulación</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[#E8192C] text-xs font-semibold uppercase tracking-widest mb-2">Procedimiento (5 pasos)</p>
                  <ol className="space-y-1">
                    {[
                      'Dividir la operación en elementos',
                      'Identificar los movimientos básicos',
                      'Obtener valores TMU de las tablas',
                      'Aplicar suplementos por fatiga',
                      'Calcular el tiempo estándar',
                    ].map((paso, i) => (
                      <li key={i} className="flex gap-2 text-xs text-white/60">
                        <span className="text-[#E8192C] font-bold flex-shrink-0">{i+1}.</span>
                        <span>{paso}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </AnimSection>

        {/* Usos del MTM */}
        <AnimSection delay={150}>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Usos del MTM en la industria</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {[
              { n:'01', text:'Desarrollo de buenos métodos antes de que inicie la producción.' },
              { n:'02', text:'Mejoramiento y optimización de los métodos actuales de trabajo.' },
              { n:'03', text:'Establecimiento de normas de tiempo en trabajos individuales.' },
              { n:'04', text:'Cálculo y control de costos de mano de obra.' },
              { n:'05', text:'Entrenamiento de empleados para que tengan conciencia de los métodos.' },
            ].map(({ n, text }) => (
              <div key={n} className="flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-[#E8192C]/30 transition-colors">
                <span className="text-[#E8192C] font-black text-lg flex-shrink-0 leading-tight">{n}</span>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </AnimSection>

        <div className="border-t border-gray-100 mb-10" />

        {/* Tabla comparativa */}
        <AnimSection delay={100}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Aspecto</th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-[#E8192C] uppercase tracking-wider">Cronometraje (usado)</th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MTM-1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON.map(({ aspect, crono, mtm }, i) => (
                  <tr key={aspect} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800 text-xs md:text-sm">{aspect}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm">{crono}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-600 text-xs md:text-sm">{mtm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimSection>

        {/* Scorecard visual */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <AnimSection delay={100}>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-5">Comparativa por dimensión</p>
              <div className="space-y-5">
                {METHOD_SCORES.map(({ label, crono, mtm }, i) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#E8192C] w-24 flex-shrink-0">Cronometraje</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <AnimBar pct={crono} delay={i * 80} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{crono}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-24 flex-shrink-0">MTM-1</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <AnimBar pct={mtm} delay={i * 80 + 100} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{mtm}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>

          {/* Movimientos MTM aplicados */}
          <AnimSection delay={200}>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-5">Movimientos MTM en la operación</p>
              <div className="space-y-3">
                {MTM_MOVEMENTS.map(({ symbol, name, apply }) => (
                  <div key={symbol} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E8192C]/10 text-[#E8192C] font-black text-xs flex items-center justify-center">{symbol}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{name}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{apply}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>

        {/* Conclusión */}
        <AnimSection delay={200}>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-6">
            <h3 className="text-gray-900 font-semibold mb-2 text-sm md:text-base">¿Qué método conviene para esta operación?</h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              El <strong className="text-gray-900">cronometraje con Westinghouse</strong> fue la elección adecuada: la operación
              ya estaba en curso, los ciclos son largos (10-16 min) y el nivel de detalle por elemento es suficiente para los objetivos del estudio.
              El <strong className="text-gray-900">MTM</strong> sería valioso en una etapa de{' '}
              <em>rediseño del método</em> — por ejemplo, para optimizar la carga de lámina o la configuración CNC
              antes de implementar cambios, sin necesidad de observar ciclos reales.
            </p>
          </div>
        </AnimSection>
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
