<template>
  <div>
    <!-- Loader -->
    <div ref="loaderRef" class="loader">
      <div class="loader__row">
        <span class="loader__wait">[Please wait]</span>
        <span class="loader__label">Loading experience</span>
      </div>
      <div class="loader__bar">
        <div ref="loaderFillRef" class="loader__fill" />
      </div>
    </div>

    <!-- Nav -->
    <nav ref="navRef" class="nav">
      <span class="nav__name" data-scramble>Brian Lapinski</span>
      <button class="nav__contact" data-scramble @click="showContact = true">
        Click to contact
      </button>
    </nav>

    <!-- WebGL Canvas -->
    <ClientOnly>
      <canvas ref="canvasRef" class="webgl-canvas" />
    </ClientOnly>

    <!-- Progress Bar -->
    <div class="progress-track">
      <div ref="progressRef" class="progress-fill" />
    </div>

    <!-- UI Layer — all scenes stacked, fixed -->
    <div class="ui-layer">

      <!-- Scene 0: Hero -->
      <section
        :class="['scene-ui', { visible: currentScene === 0 }]"
      >
        <div class="scene-ui__top">
          <h1 class="display display--lg flicker">
            <span class="dim">Building</span> immersive<br>
            digital <span class="dim">experiences ―</span>
          </h1>
          <p class="display flicker" style="margin-top: 0.25em;">
            <span class="dim">Creative</span> development<br>
            <span class="dim">&amp;</span> WebGL engineering
          </p>
        </div>
        <div class="scene-ui__bottom">
          <p class="scroll-cta flicker">
            <span>[Scroll]</span> to explore
          </p>
        </div>
      </section>

      <!-- Scene 1: About -->
      <section
        :class="['scene-ui', { visible: currentScene === 1 }]"
      >
        <div class="scene-ui__full">
          <h2 class="display flicker">
            Creative <span class="dim">Web</span> Developer
          </h2>
          <div class="skills">
            <p class="skills__item">
              WebGL &amp; Three.js, <span class="dim">GSAP Animations,</span>
            </p>
            <p class="skills__item">
              <span class="dim">AI Systems Integration,</span>
            </p>
            <p class="skills__item">
              Interactive Experiences <span class="dim">&amp; Beyond.</span>
            </p>
          </div>
          <div class="meta" style="margin-top: 2rem;">
            <span>Microsoft / Amazon / Aya Healthcare</span><br>
            <span>/// Independent Creative Developer</span>
          </div>
        </div>
      </section>

      <!-- Scene 2: Work -->
      <section
        :class="['scene-ui', { visible: currentScene === 2 }]"
      >
        <div class="scene-ui__bottom-left">
          <h2 class="overline flicker">Featured Work &amp; Projects</h2>
          <div class="work-stats">
            <p class="meta">Shipping worldwide since 2018</p>
            <p class="meta">Enterprise + independent builds</p>
          </div>
        </div>
      </section>

      <!-- Scene 3: Transition / Spacer -->
      <section
        :class="['scene-ui', { visible: currentScene === 3 }]"
      />

      <!-- Scene 4: Contact / Footer -->
      <section
        :class="['scene-ui', { visible: currentScene === 4 }]"
      >
        <div class="scene-ui__footer">
          <ul class="contact-links">
            <li><a href="mailto:hello@brianlapinski.com" data-scramble target="_blank">Email</a></li>
            <li><a href="https://www.linkedin.com/in/brian-lapinski/" data-scramble target="_blank">LinkedIn</a></li>
            <li><a href="https://github.com/lapbrian2" data-scramble target="_blank">GitHub</a></li>
          </ul>
          <p class="meta" style="margin-top: 3rem;">
            <span>Thanks for visiting</span><br>
            <span>Development &amp; design by Brian Lapinski</span>
          </p>
        </div>
      </section>
    </div>

    <!-- Contact Popup -->
    <div :class="['contact-popup', { visible: showContact }]">
      <button class="contact-popup__close" data-scramble @click="showContact = false">Close</button>
      <ul class="contact-popup__links">
        <li><a href="mailto:hello@brianlapinski.com" data-scramble target="_blank">Email</a></li>
        <li><a href="https://www.linkedin.com/in/brian-lapinski/" data-scramble target="_blank">LinkedIn</a></li>
        <li><a href="https://github.com/lapbrian2" data-scramble target="_blank">GitHub</a></li>
      </ul>
    </div>

    <!-- Copyright -->
    <p class="copyright">
      2026 &copy; Brian Lapinski. All rights reserved.
    </p>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { gsap } from 'gsap'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loaderRef = ref<HTMLElement | null>(null)
const loaderFillRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const showContact = ref(false)

const TOTAL_SCENES = 5
const { progress, currentScene, start: startScroll, destroy: destroyScroll } = useVirtualScroll(TOTAL_SCENES)
const { init, render, resize, dispose, getScene, getCamera } = useThreeScene(canvasRef)
const { bindAll } = useTextScramble()

// --- Three.js scene objects ---
let particles: { points: THREE.Points; positions: Float32Array; velocities: number[]; geometry: THREE.BufferGeometry }
let wireframes: { group: THREE.Group; ico: THREE.Mesh; torus: THREE.Mesh; octa: THREE.Mesh }
let animationId: number

function createParticleField(scene: THREE.Scene) {
  const count = 800
  const positions = new Float32Array(count * 3)
  const velocities: number[] = []

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80
    velocities.push(
      (Math.random() - 0.5) * 0.003,
      (Math.random() - 0.5) * 0.003,
      (Math.random() - 0.5) * 0.003,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)
  return { points, positions, velocities, geometry }
}

function createWireframeStructures(scene: THREE.Scene) {
  const group = new THREE.Group()
  const mat = (opacity: number) => new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity,
  })

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 1), mat(0.04))
  ico.position.set(15, -8, -20)
  group.add(ico)

  const torus = new THREE.Mesh(new THREE.TorusGeometry(6, 0.2, 8, 40), mat(0.03))
  torus.position.set(-18, 10, -25)
  torus.rotation.x = Math.PI * 0.3
  group.add(torus)

  const octa = new THREE.Mesh(new THREE.OctahedronGeometry(5, 0), mat(0.035))
  octa.position.set(-10, -15, -12)
  group.add(octa)

  scene.add(group)
  return { group, ico, torus, octa }
}

// Camera path driven by virtual scroll progress
function updateCamera(camera: THREE.PerspectiveCamera, p: number) {
  // 5 keyframes mapped to progress 0→1
  const keyframes = [
    { z: 35, y: 0, x: 0 },    // scene 0: pulled back
    { z: 18, y: 3, x: 2 },    // scene 1: closer, slight offset
    { z: 8, y: 0, x: -3 },    // scene 2: intimate
    { z: 4, y: -2, x: 0 },    // scene 3: deep in
    { z: 20, y: 8, x: 5 },    // scene 4: pulled back high
  ]

  const segment = p * (keyframes.length - 1)
  const i = Math.min(Math.floor(segment), keyframes.length - 2)
  const t = segment - i
  const ease = t * t * (3 - 2 * t) // smoothstep

  const from = keyframes[i]
  const to = keyframes[i + 1]

  camera.position.x = from.x + (to.x - from.x) * ease
  camera.position.y = from.y + (to.y - from.y) * ease
  camera.position.z = from.z + (to.z - from.z) * ease
  camera.lookAt(0, 0, 0)
}

// --- Watch progress to update everything ---
watch(progress, (p) => {
  const camera = getCamera()
  if (camera) updateCamera(camera, p)
  if (progressRef.value) {
    progressRef.value.style.height = `${p * 100}%`
  }
})

onMounted(async () => {
  // Loader animation
  if (loaderFillRef.value) {
    gsap.to(loaderFillRef.value, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loaderRef.value) loaderRef.value.classList.add('hidden')
        if (navRef.value) navRef.value.classList.add('visible')
        // Start virtual scroll after loader
        startScroll()
      },
    })
  }

  // Three.js init
  const threeResult = init()
  if (!threeResult) return
  const { scene, camera } = threeResult as { scene: THREE.Scene; camera: THREE.PerspectiveCamera }

  scene.fog = new THREE.Fog(0x07161a, 30, 90)

  particles = createParticleField(scene)
  wireframes = createWireframeStructures(scene)

  // Render loop
  function animate() {
    // Drift particles
    const pos = particles.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      (pos.array as Float32Array)[i * 3] += particles.velocities[i * 3]
      ;(pos.array as Float32Array)[i * 3 + 1] += particles.velocities[i * 3 + 1]
      ;(pos.array as Float32Array)[i * 3 + 2] += particles.velocities[i * 3 + 2]
    }
    pos.needsUpdate = true

    // Rotate wireframes
    wireframes.ico.rotation.y += 0.0008
    wireframes.ico.rotation.x += 0.0004
    wireframes.torus.rotation.z += 0.0006
    wireframes.octa.rotation.y -= 0.001

    render()
    animationId = requestAnimationFrame(animate)
  }
  animate()

  // Scramble effect on hover
  await nextTick()
  bindAll(document.body)

  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  dispose()
  destroyScroll()
  window.removeEventListener('resize', resize)
})
</script>
