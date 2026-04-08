import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { GlitchShader } from './glitch-shader.js'

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.scenes = []
    this.activeScene = 0
    this.clock = new THREE.Clock()
    this.isGlitching = false

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Shared camera
    this.camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 200
    )

    // Loaders
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)

    this.ktx2Loader = new KTX2Loader()
    this.ktx2Loader.setTranscoderPath('/basis/')

    // Post-processing
    this.currentThreeScene = new THREE.Scene()
    this.composer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this.currentThreeScene, this.camera)
    this.composer.addPass(this.renderPass)

    this.glitchPass = new ShaderPass(GlitchShader)
    this.glitchPass.uniforms.intensity.value = 0.0
    this.composer.addPass(this.glitchPass)

    // Context loss
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault() })

    // Resize
    window.addEventListener('resize', () => this.resize())
  }

  /** Register a scene config: { setup(scene, camera), update(dt, elapsed), cameraPos } */
  addScene(config) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x07161a)
    if (config.fog) scene.fog = config.fog
    config.setup(scene, this.camera)
    this.scenes.push({ ...config, threeScene: scene })
  }

  /** Transition to a new scene index with glitch effect */
  transitionTo(index) {
    if (index === this.activeScene || index < 0 || index >= this.scenes.length) return

    this.isGlitching = true
    this.glitchPass.uniforms.intensity.value = 1.5

    // Animate glitch intensity down
    const start = performance.now()
    const duration = 600
    const animate = () => {
      const elapsed = performance.now() - start
      const t = Math.min(elapsed / duration, 1)
      this.glitchPass.uniforms.intensity.value = 1.5 * (1 - t * t)
      if (t < 1) requestAnimationFrame(animate)
      else {
        this.glitchPass.uniforms.intensity.value = 0
        this.isGlitching = false
      }
    }

    this.activeScene = index
    const s = this.scenes[index]
    this.currentThreeScene = s.threeScene
    this.renderPass.scene = s.threeScene
    requestAnimationFrame(animate)
  }

  /** Interpolate camera position based on progress within a scene */
  updateCamera(sceneIndex, localProgress) {
    const s = this.scenes[sceneIndex]
    if (!s || !s.cameraPath) return

    const path = s.cameraPath
    const from = path.from
    const to = path.to
    const t = localProgress
    const ease = t * t * (3 - 2 * t) // smoothstep

    this.camera.position.x = from.x + (to.x - from.x) * ease
    this.camera.position.y = from.y + (to.y - from.y) * ease
    this.camera.position.z = from.z + (to.z - from.z) * ease

    const lx = (from.lookX || 0) + ((to.lookX || 0) - (from.lookX || 0)) * ease
    const ly = (from.lookY || 0) + ((to.lookY || 0) - (from.lookY || 0)) * ease
    const lz = (from.lookZ || 0) + ((to.lookZ || 0) - (from.lookZ || 0)) * ease
    this.camera.lookAt(lx, ly, lz)
  }

  /** Load a GLB model */
  async loadGLB(path) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(path, (gltf) => resolve(gltf), undefined, reject)
    })
  }

  /** Main render tick */
  render() {
    const dt = this.clock.getDelta()
    const elapsed = this.clock.getElapsedTime()

    // Update active scene
    const s = this.scenes[this.activeScene]
    if (s && s.update) s.update(dt, elapsed)

    // Update glitch time uniform
    this.glitchPass.uniforms.time.value = elapsed

    this.composer.render()
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }

  dispose() {
    this.renderer.dispose()
    this.dracoLoader.dispose()
    this.scenes.forEach(s => {
      s.threeScene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => m.dispose())
        }
      })
    })
  }
}
