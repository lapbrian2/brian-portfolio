<template>
  <div>
    <!-- Loader -->
    <div ref="loaderRef" class="loader">
      <p class="loader__text">Loading experience</p>
      <div class="loader__bar">
        <div ref="loaderFillRef" class="loader__fill" />
      </div>
    </div>

    <!-- Nav -->
    <nav ref="navRef" class="nav">
      <span class="nav__name">Brian Lapinski</span>
      <a href="mailto:hello@brianlapinski.com" class="nav__contact">Contact</a>
    </nav>

    <!-- WebGL Canvas -->
    <ClientOnly>
      <canvas ref="canvasRef" class="webgl-canvas" />
    </ClientOnly>

    <!-- Scroll Progress -->
    <div class="progress-track">
      <div ref="progressRef" class="progress-fill" />
    </div>

    <!-- Scroll Content -->
    <div id="scroll-wrap" class="scroll-container">

      <!-- Scene 0: Hero -->
      <section class="scene scene--hero">
        <div>
          <h1 class="display display--lg fade-up">
            <span class="dim">Building</span> immersive<br>
            digital <span class="dim">experiences ―</span>
          </h1>
          <p class="display fade-up" style="margin-top: 0.25em;">
            <span class="dim">Creative</span> development<br>
            <span class="dim">&amp;</span> WebGL engineering
          </p>
        </div>
        <div class="scroll-cta fade-up">
          <span>[Scroll]</span> to explore
        </div>
      </section>

      <!-- Scene 1: About -->
      <section class="scene scene--center">
        <h2 class="display fade-up">
          Creative <span class="dim">Web</span> Developer
        </h2>
        <div class="skills" style="margin-top: 1.5rem;">
          <p class="skills__item fade-up">
            WebGL &amp; Three.js, <span class="dim">GSAP Animations,</span>
          </p>
          <p class="skills__item fade-up">
            <span class="dim">AI Systems Integration,</span>
          </p>
          <p class="skills__item fade-up">
            Interactive Experiences <span class="dim">&amp; Beyond.</span>
          </p>
        </div>
        <div class="meta fade-up" style="margin-top: 2rem;">
          <span>Microsoft / Amazon / Aya Healthcare</span><br>
          <span>/// Independent Creative Developer</span>
        </div>
      </section>

      <!-- Scene 2: Work -->
      <section class="scene">
        <h2 class="overline fade-up">Featured Work &amp; Projects</h2>
        <div class="work-stats" style="margin-top: 1rem;">
          <p class="meta fade-up">Shipping worldwide since 2018</p>
          <p class="meta fade-up">Enterprise + independent builds</p>
        </div>
      </section>

      <!-- Scene 3: Spacer for 3D transition -->
      <section class="scene" style="min-height: 80vh;" />

      <!-- Scene 4: Contact / Footer -->
      <section class="scene">
        <ul class="contact-links">
          <li><a href="mailto:hello@brianlapinski.com" class="fade-up" target="_blank">Email</a></li>
          <li><a href="https://www.linkedin.com/in/brian-lapinski/" class="fade-up" target="_blank">LinkedIn</a></li>
          <li><a href="https://github.com/lapbrian2" class="fade-up" target="_blank">GitHub</a></li>
        </ul>
        <p class="meta fade-up" style="margin-top: 3rem;">
          Thanks for visiting
        </p>
      </section>
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
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loaderRef = ref<HTMLElement | null>(null)
const loaderFillRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

const { init, render, resize, dispose, getScene, getCamera } = useThreeScene(canvasRef)

// Proxy object for GSAP → Three.js bridge
const proxy = reactive({
  cameraZ: 30,
  cameraY: 0,
  fogNear: 40,
  fogFar: 80,
  particleSpread: 1,
})

function createParticleField(scene: THREE.Scene) {
  const count = 600
  const positions = new Float32Array(count * 3)
  const velocities: number[] = []

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60
    velocities.push(
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.002,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
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
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  })

  // Large icosahedron
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(8, 1),
    material,
  )
  ico.position.set(12, -5, -15)
  group.add(ico)

  // Torus
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(5, 0.3, 8, 32),
    material.clone(),
  )
  torus.material.opacity = 0.04
  torus.position.set(-15, 8, -20)
  torus.rotation.x = Math.PI * 0.3
  group.add(torus)

  // Octahedron
  const octa = new THREE.Mesh(
    new THREE.OctahedronGeometry(4, 0),
    material.clone(),
  )
  octa.material.opacity = 0.05
  octa.position.set(-8, -12, -10)
  group.add(octa)

  scene.add(group)
  return { group, ico, torus, octa }
}

function buildScrollTimeline(camera: THREE.PerspectiveCamera) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scroll-wrap',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        // Apply proxy values to Three.js
        camera.position.z = proxy.cameraZ
        camera.position.y = proxy.cameraY
        render()

        // Update progress bar
        if (progressRef.value) {
          progressRef.value.style.height = `${self.progress * 100}%`
        }
      },
    },
  })

  // Camera moves through the particle field
  tl.to(proxy, { cameraZ: 20, cameraY: 2, duration: 1 }, 0)
  tl.to(proxy, { cameraZ: 10, cameraY: 0, duration: 1 }, 1)
  tl.to(proxy, { cameraZ: 5, cameraY: -2, duration: 1 }, 2)
  tl.to(proxy, { cameraZ: 15, cameraY: 5, duration: 1 }, 3)
}

function animateEntrances() {
  const elements = document.querySelectorAll('.fade-up')
  elements.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  })
}

let animationId: number
let particles: ReturnType<typeof createParticleField>
let structures: ReturnType<typeof createWireframeStructures>

onMounted(async () => {
  // Loader
  if (loaderFillRef.value) {
    gsap.to(loaderFillRef.value, {
      width: '100%',
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loaderRef.value) loaderRef.value.classList.add('hidden')
        if (navRef.value) navRef.value.classList.add('visible')
      },
    })
  }

  // Three.js
  init()
  const scene = getScene()
  const camera = getCamera()

  // Fog
  scene.fog = new THREE.Fog(0x07161a, 40, 80)

  // Scene objects
  particles = createParticleField(scene)
  structures = createWireframeStructures(scene)

  // Ambient light for wireframe visibility
  scene.add(new THREE.AmbientLight(0xffffff, 0.3))

  // Scroll timeline
  buildScrollTimeline(camera)
  animateEntrances()

  // Render loop — continuous for particle drift
  function animate() {
    // Drift particles
    const pos = particles.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3] += particles.velocities[i * 3]
      pos.array[i * 3 + 1] += particles.velocities[i * 3 + 1]
      pos.array[i * 3 + 2] += particles.velocities[i * 3 + 2]
    }
    pos.needsUpdate = true

    // Slow rotate wireframes
    structures.ico.rotation.y += 0.001
    structures.ico.rotation.x += 0.0005
    structures.torus.rotation.z += 0.0008
    structures.octa.rotation.y -= 0.0012

    render()
    animationId = requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', resize)
  await nextTick()
  ScrollTrigger.refresh()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  dispose()
  ScrollTrigger.getAll().forEach((t) => t.kill())
  window.removeEventListener('resize', resize)
})
</script>
