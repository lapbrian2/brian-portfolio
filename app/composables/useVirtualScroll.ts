/**
 * Virtual scroll controller.
 * Captures wheel events and maps accumulated delta to a normalized progress (0→1).
 * No actual page scrolling occurs — the page height === viewport height.
 */
export function useVirtualScroll(totalScenes: number) {
  const progress = ref(0)
  const currentScene = ref(0)
  const isScrolling = ref(false)

  // Total virtual scroll distance (in px-equivalent)
  const totalDistance = totalScenes * 2000
  let accumulated = 0
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null
  let targetAccumulated = 0
  let rafId: number | null = null

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    targetAccumulated = Math.max(0, Math.min(totalDistance, targetAccumulated + e.deltaY))
    isScrolling.value = true

    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  // Smooth interpolation toward target
  function tick() {
    accumulated += (targetAccumulated - accumulated) * 0.08
    progress.value = accumulated / totalDistance
    currentScene.value = Math.min(
      totalScenes - 1,
      Math.floor(progress.value * totalScenes),
    )
    rafId = requestAnimationFrame(tick)
  }

  function start() {
    window.addEventListener('wheel', onWheel, { passive: false })
    // Touch support
    let touchStartY = 0
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
    }, { passive: true })
    window.addEventListener('touchmove', (e) => {
      const delta = touchStartY - e.touches[0].clientY
      touchStartY = e.touches[0].clientY
      targetAccumulated = Math.max(0, Math.min(totalDistance, targetAccumulated + delta * 3))
      isScrolling.value = true
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => { isScrolling.value = false }, 150)
    }, { passive: true })

    rafId = requestAnimationFrame(tick)
  }

  function destroy() {
    window.removeEventListener('wheel', onWheel)
    if (rafId) cancelAnimationFrame(rafId)
    if (scrollTimeout) clearTimeout(scrollTimeout)
  }

  return { progress, currentScene, isScrolling, start, destroy }
}
