/**
 * Virtual scroll controller.
 * Captures wheel/touch events, accumulates delta, outputs normalized progress (0→1).
 * No actual page scroll — body overflow is hidden.
 */
export class VirtualScroll {
  constructor(totalScenes, { onProgress, onSceneChange }) {
    this.totalScenes = totalScenes
    this.onProgress = onProgress
    this.onSceneChange = onSceneChange

    this.totalDistance = totalScenes * 2500 // px-equivalent per scene
    this.target = 0
    this.current = 0
    this.progress = 0
    this.currentScene = 0
    this.rafId = null
    this.scrollTimeout = null
    this.touchStartY = 0

    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._tick = this._tick.bind(this)
  }

  start() {
    window.addEventListener('wheel', this._onWheel, { passive: false })
    window.addEventListener('touchstart', this._onTouchStart, { passive: true })
    window.addEventListener('touchmove', this._onTouchMove, { passive: true })
    this.rafId = requestAnimationFrame(this._tick)
  }

  destroy() {
    window.removeEventListener('wheel', this._onWheel)
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchmove', this._onTouchMove)
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout)
  }

  _onWheel(e) {
    e.preventDefault()
    this.target = Math.max(0, Math.min(this.totalDistance, this.target + e.deltaY))
  }

  _onTouchStart(e) {
    this.touchStartY = e.touches[0].clientY
  }

  _onTouchMove(e) {
    const delta = this.touchStartY - e.touches[0].clientY
    this.touchStartY = e.touches[0].clientY
    this.target = Math.max(0, Math.min(this.totalDistance, this.target + delta * 3))
  }

  _tick() {
    // Smooth lerp — 0.06 gives a luxurious feel
    this.current += (this.target - this.current) * 0.06
    this.progress = this.current / this.totalDistance

    const newScene = Math.min(
      this.totalScenes - 1,
      Math.floor(this.progress * this.totalScenes)
    )

    // Local progress within the current scene (0→1)
    const sceneStart = newScene / this.totalScenes
    const sceneEnd = (newScene + 1) / this.totalScenes
    const localProgress = (this.progress - sceneStart) / (sceneEnd - sceneStart)

    this.onProgress(this.progress, localProgress, newScene)

    if (newScene !== this.currentScene) {
      const prev = this.currentScene
      this.currentScene = newScene
      this.onSceneChange(newScene, prev)
    }

    this.rafId = requestAnimationFrame(this._tick)
  }
}
