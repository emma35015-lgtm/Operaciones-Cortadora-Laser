'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

// ── MediaPipe script loader ────────────────────────────────────────────────
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = url; s.crossOrigin = 'anonymous'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed: ${url}`))
    document.head.appendChild(s)
  })
}

const MP_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915'
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

function drawHand(ctx: CanvasRenderingContext2D, lm: {x:number;y:number}[], w: number, h: number) {
  ctx.strokeStyle = '#E8192C'; ctx.lineWidth = 2
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath()
    ctx.moveTo(lm[a].x * w, lm[a].y * h)
    ctx.lineTo(lm[b].x * w, lm[b].y * h)
    ctx.stroke()
  }
  for (const p of lm) {
    ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.strokeStyle = '#E8192C'; ctx.lineWidth = 2; ctx.stroke()
  }
}

// ── Build laser cutter scene ───────────────────────────────────────────────
function buildScene(scene: THREE.Scene) {
  const matNegro    = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.5 })
  const matNegroMate= new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.85, metalness: 0.2 })
  const matRojo     = new THREE.MeshStandardMaterial({ color: 0xc81010, roughness: 0.35, metalness: 0.45, emissive: new THREE.Color(0x200000) })
  const matMetal    = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.3,  metalness: 0.9 })
  const matMetalOsc = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.4,  metalness: 0.85 })
  const matAmarillo = new THREE.MeshStandardMaterial({ color: 0xffb800, roughness: 0.4,  metalness: 0.3,  emissive: new THREE.Color(0x553000) })
  const matBlanco   = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4,  metalness: 0.3 })

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z)
    m.castShadow = true; scene.add(m); return m
  }

  const machine = new THREE.Group(); scene.add(machine)
  const madd = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow = true; machine.add(m); return m
  }

  // Base
  madd(new THREE.BoxGeometry(8,0.8,3), matNegro, 0,0.4,0)
  madd(new THREE.BoxGeometry(8.05,0.1,3.05), matNegroMate, 0,0.05,0)

  // Mesa de corte
  const mesa = new THREE.Group(); mesa.position.set(0,0.85,0); machine.add(mesa)
  const addM = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0) => { const m = new THREE.Mesh(geo,mat); m.position.set(x,y,z); mesa.add(m) }
  addM(new THREE.BoxGeometry(6.5,0.15,2.6), matNegroMate, 0,0.075,0)
  const cuchMat = new THREE.MeshStandardMaterial({ color:0x202020, roughness:0.6, metalness:0.7 })
  for (let i=0;i<60;i++) { const c=new THREE.Mesh(new THREE.BoxGeometry(6.2,0.25,0.025),cuchMat); c.position.set(0,0.25,(i-30)*(2.4/60)); mesa.add(c) }
  const torMat = new THREE.MeshStandardMaterial({ color:0xa0a0a0, roughness:0.3, metalness:0.95 })
  for (let i=0;i<14;i++) { const t=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.08,12),torMat); t.position.set(-3+i*0.45,0.18,1.25); mesa.add(t); const t2=t.clone(); t2.position.z=-1.25; mesa.add(t2) }

  // Rieles
  const rielMat = new THREE.MeshStandardMaterial({ color:0x404040, roughness:0.35, metalness:0.85 })
  const rf=new THREE.Mesh(new THREE.BoxGeometry(8.2,0.15,0.35),rielMat); rf.position.set(0,0.92,1.55); machine.add(rf)
  const rb=rf.clone(); rb.position.z=-1.55; machine.add(rb)

  // Gantry
  const g=new THREE.Group(); g.position.set(1.5,1.5,0); machine.add(g)
  const addG=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m)}
  addG(new THREE.BoxGeometry(0.5,0.6,3.6),matNegro)
  addG(new THREE.BoxGeometry(0.6,0.9,0.8),matRojo,0.05,0.05,1.0)
  addG(new THREE.BoxGeometry(0.9,1.2,1.6),matNegro,0.4,0.3,-0.8)
  const cab=new THREE.Group(); cab.position.set(-0.35,-0.2,0); g.add(cab)
  const addC=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);cab.add(m)}
  addC(new THREE.BoxGeometry(0.3,0.5,0.4),matMetalOsc)
  addC(new THREE.CylinderGeometry(0.08,0.05,0.5,16),matMetal,0,-0.45,0)
  const bq=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.1,12),matMetal); bq.position.set(0,-0.75,0); bq.rotation.x=Math.PI; cab.add(bq)

  // Cadena portacables
  const pts=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.5,0.5,-1.7),new THREE.Vector3(-1.0,2.5,-1.7),
    new THREE.Vector3(0.5,3.0,-1.7),new THREE.Vector3(1.7,1.5,-1.4),new THREE.Vector3(1.85,1.5,-0.5)
  ]).getPoints(40)
  for (let i=0;i<pts.length-1;i++) {
    const a=pts[i],b=pts[i+1],dir=new THREE.Vector3().subVectors(b,a)
    const e=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,dir.length()*1.1),matNegroMate)
    e.position.copy(a).addScaledVector(dir,0.5); e.lookAt(b); scene.add(e)
    if(i%2===0){const p=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),matAmarillo);p.position.copy(a).addScaledVector(dir,0.5);p.position.y+=0.12;scene.add(p)}
  }

  // Brazo monitor
  const br=new THREE.Group(); br.position.set(3.8,0.9,1.4); machine.add(br)
  const addBr=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;br.add(m)}
  addBr(new THREE.BoxGeometry(0.15,1.3,0.15),matBlanco,0,0.65,0)
  addBr(new THREE.BoxGeometry(0.15,0.15,0.8),matBlanco,0,1.3,-0.4)
  const mon=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.9,0.08),matNegro); mon.position.set(-0.4,1.3,-0.8); mon.rotation.y=Math.PI/4; br.add(mon)
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.8),new THREE.MeshStandardMaterial({color:0x2080d0,emissive:new THREE.Color(0x1060a0),emissiveIntensity:0.4}))
  scr.position.set(-0.43,1.3,-0.83); scr.rotation.y=Math.PI/4; br.add(scr)

  // Panel emergencia
  const pn=new THREE.Group(); pn.position.set(4.2,0.7,0); machine.add(pn)
  pn.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.6,0.3),matRojo),{castShadow:true}))
  madd(new THREE.BoxGeometry(2.2,0.5,0.05),matRojo,-1.5,0.5,1.51)

  // Enfriador
  madd(new THREE.BoxGeometry(0.9,1.5,1.2),matBlanco,-4.8,0.75,0.5)

  // Piso
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.85}))
  floor.rotation.x=-Math.PI/2; floor.position.y=-0.01; floor.receiveShadow=true; scene.add(floor)
  scene.add(new THREE.GridHelper(30,30,0x222222,0x181818))
}

// ── Component ──────────────────────────────────────────────────────────────
export function HandTracker3D() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const threeRef   = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number>(0)
  const handsRef   = useRef<unknown>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  // Shared hand position (x, y: 0-1, pinch: 0-1)
  const handRef = useRef<{x:number;y:number;pinch:number} | null>(null)

  // Smooth spherical
  const sphRef = useRef({ theta: 0.8, phi: 1.0, r: 12 })

  const [status, setStatus] = useState<'idle'|'loading'|'active'|'error'>('idle')
  const [handFound, setHandFound] = useState(false)

  // ── Three.js setup ──
  useEffect(() => {
    const container = threeRef.current
    if (!container) return
    const w = container.clientWidth || 500
    const h = container.clientHeight || 500

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f2f5)
    scene.fog = new THREE.Fog(0xf0f2f5, 18, 50)

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(8, 5, 10)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 0.6))
    const key = new THREE.DirectionalLight(0xffffff, 1.8)
    key.position.set(8,12,6); key.castShadow = true; scene.add(key)
    scene.add(Object.assign(new THREE.DirectionalLight(0xfff0d0, 0.5), { position: new THREE.Vector3(-6,4,-4) }))

    buildScene(scene)

    const lookAt = new THREE.Vector3(0, 0.8, 0)

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      const sph = sphRef.current

      if (handRef.current) {
        const { x, y, pinch } = handRef.current
        const targetTheta = (x - 0.5) * Math.PI * 3
        const targetPhi   = Math.PI / 6 + y * (Math.PI / 2.5)
        const targetR     = 7 + (1 - pinch) * 9

        sph.theta += (targetTheta - sph.theta) * 0.08
        sph.phi   += (targetPhi   - sph.phi)   * 0.08
        sph.r     += (targetR     - sph.r)     * 0.08
      } else {
        // idle auto-rotation
        sph.theta += 0.003
      }

      const sp = new THREE.Spherical(sph.r, Math.max(0.1, Math.min(Math.PI/2, sph.phi)), sph.theta)
      camera.position.setFromSpherical(sp).add(lookAt)
      camera.lookAt(lookAt)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  // ── Start camera + MediaPipe ──
  const startCamera = useCallback(async () => {
    setStatus('loading')
    try {
      // Load MediaPipe scripts sequentially
      for (const url of [
        `${MP_BASE}/hands.js`,
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      ]) { await loadScript(url) }

      // Webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      // MediaPipe Hands
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const HandsCls = (window as any).Hands
      const hands = new HandsCls({
        locateFile: (f: string) => `${MP_BASE}/${f}`
      })
      hands.setOptions({ maxNumHands:1, modelComplexity:1, minDetectionConfidence:0.7, minTrackingConfidence:0.5 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hands.onResults((res: any) => {
        const canvas = overlayRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (res.multiHandLandmarks?.length) {
          setHandFound(true)
          const lm = res.multiHandLandmarks[0]
          drawHand(ctx, lm, canvas.width, canvas.height)
          const palm  = lm[9]
          const thumb = lm[4]
          const index = lm[8]
          const dx = thumb.x - index.x, dy = thumb.y - index.y
          const pinch = Math.min(1, Math.sqrt(dx*dx + dy*dy) / 0.25)
          handRef.current = { x: 1 - palm.x, y: palm.y, pinch }
        } else {
          setHandFound(false)
          handRef.current = null
        }
      })
      handsRef.current = hands

      // Frame loop
      const sendFrame = async () => {
        if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (handsRef.current as any).send({ image: videoRef.current })
        }
        rafRef.current = requestAnimationFrame(sendFrame)
      }
      sendFrame()

      setStatus('active')
    } catch {
      setStatus('error')
    }
  }, [])

  // Cleanup camera on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  return (
    <section className="py-16 md:py-24 px-6 md:px-16 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#E8192C]" />
          <span className="text-[#E8192C] text-xs font-semibold tracking-widest uppercase">Interactivo</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Mueve el modelo con tus manos</h2>
        <p className="text-gray-400 mb-8 md:mb-10 text-sm md:text-base max-w-2xl">
          Activa la cámara y mueve tu mano frente al lente. La posición de tu palma controla la rotación
          del modelo 3D y el acercamiento del pulgar con el índice controla el zoom.
        </p>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">

          {/* Webcam panel */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center">
            {status === 'idle' && (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium mb-1">Cámara desactivada</p>
                <p className="text-gray-500 text-xs mb-6">Se pedirá permiso para usar tu cámara</p>
                <button
                  onClick={startCamera}
                  className="bg-[#E8192C] hover:bg-[#b91224] text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm"
                >
                  Activar cámara
                </button>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-3 border-[#E8192C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-300 text-sm">Cargando detector de manos...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center p-8">
                <p className="text-red-400 font-medium mb-2">No se pudo acceder a la cámara</p>
                <p className="text-gray-500 text-xs">Verifica los permisos del navegador</p>
              </div>
            )}

            {status === 'active' && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                />
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${handFound ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800/80 text-gray-400 border border-gray-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${handFound ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  {handFound ? 'Mano detectada' : 'Sin mano'}
                </div>
              </>
            )}
          </div>

          {/* 3D Model */}
          <div
            ref={threeRef}
            className="rounded-2xl overflow-hidden border border-gray-800 aspect-video"
          />
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {[
            { icon: '↔', label: 'Rotar horizontal', desc: 'Mueve la mano de izquierda a derecha' },
            { icon: '↕', label: 'Rotar vertical',   desc: 'Mueve la mano hacia arriba o abajo' },
            { icon: '🤏', label: 'Zoom',            desc: 'Acerca el pulgar y el índice' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
