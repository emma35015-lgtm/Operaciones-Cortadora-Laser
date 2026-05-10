'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface HotspotInfo { title: string; text: string }

const HOTSPOTS: { pos: [number, number, number]; title: string; text: string }[] = [
  { pos: [0, 1.0, 0],       title: 'Mesa de Corte',     text: 'Superficie de trabajo formada por cuchillas verticales. Soporta la lámina metálica durante el corte y permite la caída del retal.' },
  { pos: [1.15, 1.0, 0],    title: 'Cabezal Láser',     text: 'Genera el haz de láser fibra concentrado. Incluye boquilla de salida de gas asistente y se desplaza en eje Z para enfocar el corte.' },
  { pos: [1.9, 2.2, 0.2],   title: 'Carro Gantry',      text: 'Estructura que se mueve en eje X sobre los rieles, transportando el cabezal láser. El cuerpo trasero negro contiene la electrónica de control servo.' },
  { pos: [0.5, 3.0, -1.7],  title: 'Cadena Portacables', text: 'Protege y guía los cables de potencia, fibra óptica y mangueras de gas. Los puntos amarillos son LEDs indicadores de operación.' },
  { pos: [3.4, 2.4, 0.6],   title: 'Panel de Control',  text: 'Pantalla táctil donde se carga el archivo DXF, se configuran parámetros de corte (velocidad, potencia, gas) y se monitorea el progreso.' },
  { pos: [4.4, 0.9, 0],     title: 'Emergencia',        text: 'Detiene inmediatamente toda la operación. Obligatorio por norma de seguridad industrial.' },
  { pos: [-4.8, 1.6, 0.5],  title: 'Sistema de Enfriamiento', text: 'Chiller industrial que mantiene la fuente láser a temperatura constante. Crítico para la vida útil del equipo.' },
  { pos: [-1.5, 0.5, 1.55], title: 'Estructura Base',   text: 'Bastidor principal. Su rigidez es fundamental para garantizar la precisión del corte. El módulo rojo frontal aloja la electrónica de potencia.' },
]

export function LaserScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [info, setInfo] = useState<HotspotInfo | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const getSize = () => ({ w: container.clientWidth || 600, h: container.clientHeight || 500 })
    const { w, h } = getSize()

    // — Renderer —
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    container.appendChild(renderer.domElement)

    // — Scene —
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 18, 50)

    // — Camera —
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(8, 5, 10)
    cameraRef.current = camera

    // — Controls —
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 4
    controls.maxDistance = 20
    controls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.target.set(0, 0.8, 0)
    controlsRef.current = controls

    // — Lighting —
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 0.5))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
    keyLight.position.set(8, 12, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    Object.assign(keyLight.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 30 })
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xfff0d0, 0.6)
    fillLight.position.set(-6, 4, -4)
    scene.add(fillLight)
    const rimLight = new THREE.PointLight(0xff4020, 0.8, 15)
    rimLight.position.set(-3, 2, -3)
    scene.add(rimLight)

    // — Floor —
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.1 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(30, 30, 0x222222, 0x181818))

    // — Materials —
    const matNegro    = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.5 })
    const matNegroMate= new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.85, metalness: 0.2 })
    const matRojo     = new THREE.MeshStandardMaterial({ color: 0xc81010, roughness: 0.35, metalness: 0.45, emissive: new THREE.Color(0x200000) })
    const matMetal    = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.3, metalness: 0.9 })
    const matMetalOsc = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.4, metalness: 0.85 })
    const matAmarillo = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.4, metalness: 0.3, emissive: new THREE.Color(0x553000) })
    const matBlanco   = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4, metalness: 0.3 })

    const machine = new THREE.Group()
    scene.add(machine)

    const addMesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0, shadow=true): THREE.Mesh => {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(x,y,z)
      if (shadow) { m.castShadow = true; m.receiveShadow = true }
      return m
    }

    // — Base —
    machine.add(addMesh(new THREE.BoxGeometry(8,0.8,3), matNegro, 0,0.4,0))
    machine.add(addMesh(new THREE.BoxGeometry(8.05,0.1,3.05), matNegroMate, 0,0.05,0, false))

    // — Mesa de corte —
    const mesaGroup = new THREE.Group()
    mesaGroup.position.set(0, 0.85, 0)
    machine.add(mesaGroup)
    mesaGroup.add(addMesh(new THREE.BoxGeometry(6.5,0.15,2.6), matNegroMate, 0,0.075,0))
    const cuchillaMat = new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.6, metalness: 0.7 })
    for (let i = 0; i < 60; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(6.2,0.25,0.025), cuchillaMat)
      c.position.set(0, 0.25, (i - 30) * (2.4/60))
      mesaGroup.add(c)
    }
    const tornilloMat = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 0.3, metalness: 0.95 })
    for (let i = 0; i < 14; i++) {
      const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.08,12), tornilloMat)
      t1.position.set(-3 + i*0.45, 0.18, 1.25); mesaGroup.add(t1)
      const t2 = t1.clone(); t2.position.z = -1.25; mesaGroup.add(t2)
    }

    // — Rieles —
    const rielMat = new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.35, metalness: 0.85 })
    const rielF = new THREE.Mesh(new THREE.BoxGeometry(8.2,0.15,0.35), rielMat)
    rielF.position.set(0,0.92,1.55); machine.add(rielF)
    const rielB = rielF.clone(); rielB.position.z = -1.55; machine.add(rielB)

    // — Gantry —
    const gantryGroup = new THREE.Group()
    gantryGroup.position.set(1.5, 1.5, 0)
    machine.add(gantryGroup)
    gantryGroup.add(addMesh(new THREE.BoxGeometry(0.5,0.6,3.6), matNegro))
    gantryGroup.add(addMesh(new THREE.BoxGeometry(0.6,0.9,0.8), matRojo, 0.05,0.05,1.0))
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.01,0.12,0.04), matNegroMate)
      s.position.set(0.36, -0.15+j*0.15, -0.2+i*0.13); gantryGroup.add(s)
    }
    gantryGroup.add(addMesh(new THREE.BoxGeometry(0.9,1.2,1.6), matNegro, 0.4,0.3,-0.8))
    for (let i = 0; i < 6; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.03,0.08), matNegroMate)
      v.position.set(0.4, 0.9, -1.3+i*0.15); gantryGroup.add(v)
    }
    const cabezalGroup = new THREE.Group()
    cabezalGroup.position.set(-0.35,-0.2,0)
    gantryGroup.add(cabezalGroup)
    cabezalGroup.add(addMesh(new THREE.BoxGeometry(0.3,0.5,0.4), matMetalOsc))
    cabezalGroup.add(addMesh(new THREE.CylinderGeometry(0.08,0.05,0.5,16), matMetal, 0,-0.45,0))
    const boquilla = new THREE.Mesh(new THREE.ConeGeometry(0.05,0.1,12), matMetal)
    boquilla.position.set(0,-0.75,0); boquilla.rotation.x = Math.PI; cabezalGroup.add(boquilla)

    // — Cadena portacables —
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5,0.5,-1.7), new THREE.Vector3(-2.5,1.0,-1.7),
      new THREE.Vector3(-1.0,2.5,-1.7), new THREE.Vector3(0.5,3.0,-1.7),
      new THREE.Vector3(1.5,2.5,-1.7),  new THREE.Vector3(1.7,1.5,-1.4),
      new THREE.Vector3(1.85,1.5,-0.5),
    ])
    const pts = curva.getPoints(50)
    for (let i = 0; i < pts.length-1; i++) {
      const a = pts[i], b = pts[i+1]
      const dir = new THREE.Vector3().subVectors(b,a)
      const esl = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,dir.length()*1.1), matNegroMate)
      esl.position.copy(a).addScaledVector(dir,0.5); esl.lookAt(b)
      scene.add(esl)
      if (i % 2 === 0) {
        const pto = new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8), matAmarillo)
        pto.position.copy(a).addScaledVector(dir,0.5); pto.position.y += 0.12
        scene.add(pto)
      }
    }
    const cadenaInf = [
      new THREE.Vector3(-3.8,0.15,-1.4), new THREE.Vector3(-1.5,0.15,-1.4),
      new THREE.Vector3(0.5,0.15,-1.4),  new THREE.Vector3(2.5,0.15,-1.4),
      new THREE.Vector3(3.5,0.15,-1.0),
    ]
    for (let i = 0; i < cadenaInf.length-1; i++) {
      const a = cadenaInf[i], b = cadenaInf[i+1]
      const dir = new THREE.Vector3().subVectors(b,a)
      for (let j = 0; j < Math.floor(dir.length()/0.15); j++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6), matAmarillo)
        p.position.copy(a).addScaledVector(dir, j/Math.floor(dir.length()/0.15))
        p.position.y = 0.18; machine.add(p)
      }
    }

    // — Brazo monitor —
    const brazoGroup = new THREE.Group()
    brazoGroup.position.set(3.8,0.9,1.4)
    machine.add(brazoGroup)
    brazoGroup.add(addMesh(new THREE.BoxGeometry(0.15,1.3,0.15), matBlanco, 0,0.65,0))
    brazoGroup.add(addMesh(new THREE.BoxGeometry(0.15,0.15,0.8), matBlanco, 0,1.3,-0.4))
    const monitor = addMesh(new THREE.BoxGeometry(1.3,0.9,0.08), matNegro, -0.4,1.3,-0.8)
    monitor.rotation.y = Math.PI/4; brazoGroup.add(monitor)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.8), new THREE.MeshStandardMaterial({ color:0x2080d0, emissive: new THREE.Color(0x1060a0), emissiveIntensity:0.4 }))
    screen.position.set(-0.43,1.3,-0.83); screen.rotation.y = Math.PI/4; brazoGroup.add(screen)
    brazoGroup.add(addMesh(new THREE.SphereGeometry(0.15,16,16), matBlanco, 0,1.3,0, false))

    // — Panel emergencia —
    const panelGroup = new THREE.Group()
    panelGroup.position.set(4.2,0.7,0)
    machine.add(panelGroup)
    panelGroup.add(addMesh(new THREE.BoxGeometry(0.4,0.6,0.3), matRojo))
    const btnEmergencia = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.08,16), new THREE.MeshStandardMaterial({ color:0xff0000, roughness:0.4, metalness:0.2, emissive: new THREE.Color(0x400000) }))
    btnEmergencia.position.set(0.21,0.1,0); btnEmergencia.rotation.z = Math.PI/2; panelGroup.add(btnEmergencia)
    const ps = new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.1), new THREE.MeshStandardMaterial({ color:0x000000, emissive: new THREE.Color(0x40ff40), emissiveIntensity:0.6 }))
    ps.position.set(0.205,-0.1,0); ps.rotation.y = Math.PI/2; panelGroup.add(ps)

    // — Extensión roja frontal —
    machine.add(addMesh(new THREE.BoxGeometry(2.2,0.5,0.05), matRojo, -1.5,0.5,1.51))
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.18), new THREE.MeshStandardMaterial({ color:0x800000 }))
    placa.position.set(-0.6,0.5,1.535); machine.add(placa)

    // — Enfriador —
    machine.add(addMesh(new THREE.BoxGeometry(0.9,1.5,1.2), matBlanco, -4.8,0.75,0.5))
    for (let i = 0; i < 12; i++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.05,1.0), matNegroMate)
      r.position.set(-4.35, 0.4+i*0.07, 0.5); machine.add(r)
    }

    // — Hotspots —
    const hotspotMeshes: THREE.Mesh[] = []
    const hotspotObjects: { glow: THREE.Mesh }[] = []
    const hsGeo  = new THREE.SphereGeometry(0.12,16,16)
    const hsMat  = new THREE.MeshBasicMaterial({ color:0xd4a017 })
    const glowGeo = new THREE.SphereGeometry(0.22,16,16)

    HOTSPOTS.forEach(h => {
      const sphere = new THREE.Mesh(hsGeo, hsMat)
      sphere.position.set(...h.pos)
      sphere.userData.hotspot = { title: h.title, text: h.text }
      scene.add(sphere)
      hotspotMeshes.push(sphere)

      const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color:0xd4a017, transparent:true, opacity:0.25 }))
      glow.position.set(...h.pos)
      scene.add(glow)
      hotspotObjects.push({ glow })
    })

    // — Click handler —
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(hotspotMeshes)
      if (hits.length > 0) setInfo(hits[0].object.userData.hotspot as HotspotInfo)
    }
    renderer.domElement.addEventListener('click', handleClick)

    // — Resize —
    const handleResize = () => {
      const { w, h } = getSize()
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // — Animation loop —
    let animId: number
    const clock = new THREE.Clock()
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      hotspotObjects.forEach(({ glow }, i) => {
        const p = 1 + Math.sin(t*2 + i*0.5) * 0.15
        glow.scale.setScalar(p);
        (glow.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t*2 + i*0.5) * 0.1
      })
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', handleClick)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  const moveCameraTo = (x: number, y: number, z: number) => {
    const camera = cameraRef.current
    if (!camera) return
    if (controlsRef.current) { controlsRef.current.autoRotate = false; setAutoRotate(false) }
    const start = camera.position.clone()
    const end = new THREE.Vector3(x, y, z)
    const startTime = performance.now()
    const step = () => {
      const t = Math.min((performance.now() - startTime) / 800, 1)
      const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2
      camera.position.lerpVectors(start, end, ease)
      if (t < 1) requestAnimationFrame(step)
    }
    step()
  }

  const toggleRotate = () => {
    if (!controlsRef.current) return
    const next = !autoRotate
    controlsRef.current.autoRotate = next
    setAutoRotate(next)
  }

  const VIEWS = [
    { label: 'Frontal',     action: () => moveCameraTo(0, 2, 11) },
    { label: 'Lateral',     action: () => moveCameraTo(13, 2, 0) },
    { label: 'Superior',    action: () => moveCameraTo(0, 13, 0.1) },
    { label: 'Vista inicial', action: () => { moveCameraTo(8, 5, 10); if (controlsRef.current) { controlsRef.current.autoRotate = true; setAutoRotate(true) } } },
  ]

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Info panel */}
      {info && (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 w-56 bg-black/90 text-white p-4 rounded-xl border border-white/10 backdrop-blur-md z-10">
          <button onClick={() => setInfo(null)} className="absolute top-2 right-3 text-white/50 hover:text-amber-400 text-lg leading-none">×</button>
          <p className="text-amber-400 font-semibold uppercase tracking-wide text-xs mb-2">{info.title}</p>
          <p className="text-white/75 text-xs leading-relaxed">{info.text}</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 flex-wrap justify-center px-2">
        <button
          onClick={toggleRotate}
          className={`text-xs px-2.5 py-1.5 rounded-lg border backdrop-blur-md transition-all ${autoRotate ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/80 text-white border-white/15'}`}
        >
          {autoRotate ? '⟳ Auto' : '⟳ Auto'}
        </button>
        {VIEWS.map(({ label, action }) => (
          <button key={label} onClick={action} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/80 text-white backdrop-blur-md hover:border-amber-500 hover:text-amber-400 transition-all">
            {label}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="absolute top-3 left-1/2 -translate-x-1/2 text-white/30 text-xs whitespace-nowrap">Arrastra para rotar · Click en puntos dorados</p>
    </div>
  )
}
