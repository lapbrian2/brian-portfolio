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

    <!-- UI Layer -->
    <div class="ui-layer">

      <!-- Scene 0: Hero -->
      <section :class="['scene-ui', { visible: currentScene === 0 }]">
        <div class="scene-ui__top">
          <h1 class="display display--lg flicker">
            <span class="dim">Building</span> immersive<br>
            digital <span class="dim">experiences ―</span>
          </h1>
          <p class="display flicker" style="margin-top: 0.25em;">
            <span class="dim">Creative</span> development<br>
            <span class="dim">&amp;</span> agentic systems
          </p>
        </div>
        <div class="scene-ui__bottom">
          <p class="scroll-cta flicker">
            <span>[Scroll]</span> to explore
          </p>
        </div>
      </section>

      <!-- Scene 1: About -->
      <section :class="['scene-ui', { visible: currentScene === 1 }]">
        <div class="scene-ui__full">
          <h2 class="display flicker">
            Creative <span class="dim">Web</span> Developer<br>
            <span class="dim">&amp; Systems</span> Architect
          </h2>
          <div class="skills">
            <p class="skills__item">
              WebGL &amp; Three.js, <span class="dim">GSAP Scroll Choreography,</span>
            </p>
            <p class="skills__item">
              Agentic AI Systems, <span class="dim">Memory Architectures,</span>
            </p>
            <p class="skills__item">
              <span class="dim">MCP Toolchains,</span> Interactive Experiences <span class="dim">&amp; Beyond.</span>
            </p>
          </div>
          <div class="meta" style="margin-top: 2rem;">
            <span>Microsoft / Amazon / Aya Healthcare</span><br>
            <span>/// Independent Creative Developer</span>
          </div>
        </div>
      </section>

      <!-- Scene 2: Work -->
      <section :class="['scene-ui', { visible: currentScene === 2 }]">
        <div class="scene-ui__bottom-left">
          <h2 class="overline flicker">Featured Work</h2>
          <div class="work-grid">
            <button
              v-for="(project, i) in projects"
              :key="project.id"
              class="work-card"
              :data-scramble="true"
              @click="openProject(i)"
            >
              <span class="work-card__name">{{ project.name }}</span>
              <span class="work-card__cat dim">{{ project.category }}</span>
            </button>
          </div>
          <p class="meta" style="margin-top: 1rem;">
            Enterprise + independent builds since 2018
          </p>
        </div>
      </section>

      <!-- Scene 3: Systems -->
      <section :class="['scene-ui', { visible: currentScene === 3 }]">
        <div class="scene-ui__full">
          <h2 class="display flicker">
            <span class="dim">Agentic</span> Infrastructure
          </h2>
          <div class="skills">
            <p class="skills__item">
              43 orchestrator skills, <span class="dim">tiered memory system,</span>
            </p>
            <p class="skills__item">
              <span class="dim">virtual scroll controllers,</span> MCP server pipelines,
            </p>
            <p class="skills__item">
              <span class="dim">self-improving</span> agent architectures.
            </p>
          </div>
          <div class="meta" style="margin-top: 2rem;">
            <span>/// The tools that build the tools</span>
          </div>
        </div>
      </section>

      <!-- Scene 4: Contact -->
      <section :class="['scene-ui', { visible: currentScene === 4 }]">
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

    <!-- Works Detail Overlay -->
    <Transition name="works">
      <div v-if="activeProject !== null" class="works-overlay">
        <button class="works-overlay__close" data-scramble @click="activeProject = null">Close</button>
        <div class="works-overlay__content">
          <h2 class="works-overlay__title">{{ projects[activeProject].name }}</h2>
          <p class="works-overlay__desc meta">{{ projects[activeProject].description }}</p>
          <p class="works-overlay__stack meta" style="margin-top: 0.5rem;">
            {{ projects[activeProject].stack }}
          </p>
          <a
            v-if="projects[activeProject].url"
            :href="projects[activeProject].url"
            target="_blank"
            class="works-overlay__link"
            data-scramble
          >
            Visit Project
          </a>
        </div>
      </div>
    </Transition>

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

// --- Projects data ---
const projects = [
  {
    id: 'bomb-the-web',
    name: 'Bomb The Web',
    category: 'creative',
    description: 'Graffiti-inspired art portfolio. Single-file 3700-line index.html with Three.js spray cans, GSAP scroll choreography, Web Audio, and 7 hidden Easter eggs including Konami code party mode.',
    stack: 'THREE.JS / GSAP / WEB AUDIO / CANVAS 2D',
    url: 'https://brian-lapinski-portfolio.vercel.app/',
  },
  {
    id: 'ml-systems',
    name: 'ML Systems Universe',
    category: 'visualization',
    description: 'Interactive 3D visualization mapping the machine learning ecosystem. Explore models, architectures, and training paradigms as navigable constellations.',
    stack: 'THREE.JS / D3.JS / GSAP',
    url: 'https://ml-systems-universe.vercel.app/',
  },
  {
    id: 'petri-dish',
    name: 'Petri Dish',
    category: 'visualization',
    description: 'Biological information runtime visualization. D3-force graph with electron animation, traversal replay, microscope lens, and comparison mode. Renders how information flows through living systems.',
    stack: 'D3-FORCE / CANVAS 2D / CHUNKING PIPELINE',
    url: null,
  },
  {
    id: 'session-pulser',
    name: 'Session Pulser',
    category: 'tool',
    description: 'Real-time session analytics dashboard. Dense data visualization showing agent work patterns, memory access heat maps, and skill usage graphs. The engineering standard for tools and dashboards.',
    stack: 'THREE.JS / CANVAS 2D / WEBSOCKET',
    url: null,
  },
  {
    id: 'style-dna',
    name: 'Style DNA Extractor',
    category: 'agentic',
    description: 'Shader-based visual style extraction system. Analyzes reference images through a 10-phase pipeline to produce reproducible AI art generation parameters. Opus-powered extraction engine.',
    stack: 'NUXT 4 / CLAUDE API / SUPABASE / VERCEL',
    url: null,
  },
  {
    id: 'skills-orchestrator',
    name: 'Skills Orchestrator',
    category: 'agentic',
    description: '43-skill MCP server with dynamic loading, memory-augmented dispatch, and context tree CRUD. The nervous system behind every Claude Code session — skills match, load, execute, and self-improve.',
    stack: 'MCP / PYTHON / SQLITE / YAML',
    url: null,
  },
  {
    id: 'cli-anything',
    name: 'CLI-Anything',
    category: 'agentic',
    description: 'Turns GUI software into agent-controllable APIs. 22 MCP tools across GIMP, Blender, Inkscape, and Draw.io. YAML recipe system for reusable pipelines. The bridge between AI agents and desktop software.',
    stack: 'PYTHON / MCP / PILLOW / BPY / SVG',
    url: null,
  },
  {
    id: 'memory-system',
    name: 'Agent Memory System',
    category: 'agentic',
    description: 'Tiered persistent memory architecture with session journals, distilled memory (11x compression via arxiv:2603.13017), heuristic injection, and drift radar. The continuity layer across 40+ sessions.',
    stack: 'OBSIDIAN / MCP / PYTHON / YAML',
    url: null,
  },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loaderRef = ref<HTMLElement | null>(null)
const loaderFillRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const showContact = ref(false)
const activeProject = ref<number | null>(null)

const TOTAL_SCENES = 5
const { progress, currentScene, start: startScroll, destroy: destroyScroll } = useVirtualScroll(TOTAL_SCENES)
const { init, render, resize, dispose, getScene, getCamera } = useThreeScene(canvasRef)
const { bindAll } = useTextScramble()

function openProject(index: number) {
  activeProject.value = index
}

// --- 3D Scene: Node network (agentic-inspired) ---
let animationId: number
let nodeGroup: THREE.Group
let linesMesh: THREE.LineSegments
let particlesMesh: THREE.Points

function createNodeNetwork(scene: THREE.Scene) {
  nodeGroup = new THREE.Group()

  // Nodes — small glowing spheres positioned in a loose cluster
  const nodePositions: THREE.Vector3[] = []
  const nodeCount = 60
  for (let i = 0; i < nodeCount; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 40,
    )
    nodePositions.push(pos)

    const size = 0.08 + Math.random() * 0.15
    const geo = new THREE.SphereGeometry(size, 8, 8)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.5,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    nodeGroup.add(mesh)
  }

  // Connections — lines between nearby nodes
  const linePositions: number[] = []
  const connectionDistance = 12
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const dist = nodePositions[i].distanceTo(nodePositions[j])
      if (dist < connectionDistance) {
        linePositions.push(
          nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
          nodePositions[j].x, nodePositions[j].y, nodePositions[j].z,
        )
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x4a9ead,
    transparent: true,
    opacity: 0.08,
  })
  linesMesh = new THREE.LineSegments(lineGeo, lineMat)
  nodeGroup.add(linesMesh)

  // Background particles — dust field
  const dustCount = 1500
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 100
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 80
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 100
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  particlesMesh = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.12,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  nodeGroup.add(particlesMesh)

  // Grid floor
  const gridGeo = new THREE.BufferGeometry()
  const gridPositions: number[] = []
  const gridSize = 60
  const gridStep = 3
  for (let x = -gridSize; x <= gridSize; x += gridStep) {
    gridPositions.push(x, -15, -gridSize, x, -15, gridSize)
  }
  for (let z = -gridSize; z <= gridSize; z += gridStep) {
    gridPositions.push(-gridSize, -15, z, gridSize, -15, z)
  }
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3))
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x1a3a40,
    transparent: true,
    opacity: 0.15,
  })
  const grid = new THREE.LineSegments(gridGeo, gridMat)
  nodeGroup.add(grid)

  scene.add(nodeGroup)
}

// Camera path
function updateCamera(camera: THREE.PerspectiveCamera, p: number) {
  const keyframes = [
    { x: 0, y: 5, z: 45, lookY: 0 },
    { x: 8, y: 3, z: 25, lookY: -2 },
    { x: -5, y: 0, z: 15, lookY: 0 },
    { x: 3, y: -3, z: 8, lookY: -5 },
    { x: 10, y: 12, z: 30, lookY: 2 },
  ]

  const segment = p * (keyframes.length - 1)
  const i = Math.min(Math.floor(segment), keyframes.length - 2)
  const t = segment - i
  const ease = t * t * (3 - 2 * t)

  const from = keyframes[i]
  const to = keyframes[i + 1]

  camera.position.x = from.x + (to.x - from.x) * ease
  camera.position.y = from.y + (to.y - from.y) * ease
  camera.position.z = from.z + (to.z - from.z) * ease

  const lookY = from.lookY + (to.lookY - from.lookY) * ease
  camera.lookAt(0, lookY, 0)
}

watch(progress, (p) => {
  const camera = getCamera()
  if (camera) updateCamera(camera, p)
  if (progressRef.value) {
    progressRef.value.style.height = `${p * 100}%`
  }
})

onMounted(async () => {
  // Loader
  if (loaderFillRef.value) {
    gsap.to(loaderFillRef.value, {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loaderRef.value) loaderRef.value.classList.add('hidden')
        if (navRef.value) navRef.value.classList.add('visible')
        startScroll()
      },
    })
  }

  // Three.js
  const threeResult = init()
  if (!threeResult) return
  const { scene, camera } = threeResult as { scene: THREE.Scene; camera: THREE.PerspectiveCamera }

  scene.fog = new THREE.FogExp2(0x07161a, 0.015)

  createNodeNetwork(scene)

  // Render loop
  const clock = new THREE.Clock()
  function animate() {
    const elapsed = clock.getElapsedTime()

    // Slowly rotate entire network
    if (nodeGroup) {
      nodeGroup.rotation.y = elapsed * 0.02
    }

    // Pulse node opacity
    if (nodeGroup) {
      nodeGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          const mat = child.material as THREE.MeshBasicMaterial
          mat.opacity = 0.3 + Math.sin(elapsed * 0.5 + i * 0.7) * 0.3
        }
      })
    }

    render()
    animationId = requestAnimationFrame(animate)
  }
  animate()

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
