import * as THREE from 'three'

export function useThreeScene(canvas: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let contextLost = false

  function init() {
    if (!canvas.value) return

    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    canvas.value.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      contextLost = true
    })
    canvas.value.addEventListener('webglcontextrestored', () => {
      contextLost = false
      render()
    })

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x07161a)

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    )
    camera.position.set(0, 0, 30)

    return { scene, camera, renderer }
  }

  function render() {
    if (!contextLost && renderer) renderer.render(scene, camera)
  }

  function resize() {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function dispose() {
    if (!renderer) return
    renderer.dispose()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m.dispose())
      }
    })
  }

  return {
    init,
    render,
    resize,
    dispose,
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
  }
}
