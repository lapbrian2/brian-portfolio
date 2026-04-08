import './styles.css'
import { gsap } from 'gsap'
import { SceneManager } from './scene-manager.js'
import { VirtualScroll } from './virtual-scroll.js'
import { bindScramble } from './text-scramble.js'
import { FEATURED, SUPPORTING, ALL } from './projects.js'
import {
  createHeroScene,
  createAboutScene,
  createWorkScene,
  createAgenticScene,
  createFooterScene,
} from './scenes.js'

// --- DOM refs ---
const canvas = document.getElementById('webgl-canvas')
const loader = document.getElementById('loader')
const loaderFill = document.getElementById('loader-fill')
const nav = document.getElementById('nav')
const progressFill = document.getElementById('progress-fill')
const fpsUI = document.getElementById('fps-ui')
const sceneUIs = [
  document.getElementById('scene-0-ui'),
  document.getElementById('scene-1-ui'),
  document.getElementById('scene-2-ui'),
  document.getElementById('scene-3-ui'),
  document.getElementById('scene-4-ui'),
]
const worksOverlay = document.getElementById('works-overlay')
const worksClose = document.getElementById('works-close')
const worksTitle = document.getElementById('works-title')
const worksDesc = document.getElementById('works-desc')
const worksStack = document.getElementById('works-stack')
const worksImage = document.getElementById('works-image')
const worksActions = document.getElementById('works-actions')
const contactPopup = document.getElementById('contact-popup')
const btnContact = document.getElementById('btn-contact')
const contactClose = document.getElementById('contact-close')

// --- Build project grids ---
function buildProjectUI() {
  const featuredGrid = document.getElementById('featured-grid')
  FEATURED.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'featured-card'
    card.addEventListener('click', () => openProject(i))

    if (p.image) {
      card.innerHTML = `
        <div class="featured-card__image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="featured-card__info">
          <span class="featured-card__name">${p.name}</span>
          <span class="featured-card__desc">${p.short}</span>
        </div>
      `
    } else {
      card.innerHTML = `
        <div class="featured-card__image featured-card__placeholder">
          <span class="featured-card__icon">${p.name.charAt(0)}</span>
        </div>
        <div class="featured-card__info">
          <span class="featured-card__name">${p.name}</span>
          <span class="featured-card__desc">${p.short}</span>
        </div>
      `
    }
    featuredGrid.appendChild(card)
  })

  const supportingList = document.getElementById('supporting-list')
  SUPPORTING.forEach((p, i) => {
    const item = document.createElement('div')
    item.className = 'supporting-item'
    item.addEventListener('click', () => openProject(FEATURED.length + i))
    item.innerHTML = `
      <span class="supporting-item__name">${p.name}</span>
      <span class="supporting-item__desc">${p.short}</span>
    `
    supportingList.appendChild(item)
  })
}

// --- Works overlay ---
function openProject(index) {
  const p = ALL[index]
  if (!p) return

  worksTitle.textContent = p.name
  worksDesc.textContent = p.description
  worksStack.textContent = p.stack

  // Image
  worksImage.innerHTML = p.image
    ? `<img src="${p.image}" alt="${p.name}">`
    : ''
  worksImage.style.display = p.image ? 'block' : 'none'

  // Actions
  worksActions.innerHTML = ''
  if (p.url) {
    const a = document.createElement('a')
    a.href = p.url
    a.target = '_blank'
    a.className = 'works-overlay__link'
    a.textContent = 'Visit Project'
    a.setAttribute('data-scramble', '')
    worksActions.appendChild(a)
  }
  if (p.github) {
    const a = document.createElement('a')
    a.href = p.github
    a.target = '_blank'
    a.className = 'works-overlay__link'
    a.textContent = 'GitHub'
    a.setAttribute('data-scramble', '')
    worksActions.appendChild(a)
  }

  worksOverlay.classList.add('visible')
  bindScramble(worksOverlay)
}

worksClose.addEventListener('click', () => worksOverlay.classList.remove('visible'))

// --- Contact popup ---
btnContact.addEventListener('click', () => contactPopup.classList.add('visible'))
contactClose.addEventListener('click', () => contactPopup.classList.remove('visible'))

// --- Scene UI transitions ---
function showSceneUI(index) {
  sceneUIs.forEach((el, i) => {
    el.classList.toggle('visible', i === index)
  })
}

// --- Init ---
const sceneManager = new SceneManager(canvas)
sceneManager.addScene(createHeroScene())
sceneManager.addScene(createAboutScene())
sceneManager.addScene(createWorkScene())
sceneManager.addScene(createAgenticScene())
sceneManager.addScene(createFooterScene())

const scroll = new VirtualScroll(5, {
  onProgress(progress, localProgress, scene) {
    // Update camera within active scene
    sceneManager.updateCamera(scene, localProgress)

    // Progress bar
    progressFill.style.height = `${progress * 100}%`

    // Render
    sceneManager.render()
  },
  onSceneChange(newScene, prevScene) {
    showSceneUI(newScene)
    sceneManager.transitionTo(newScene)
  },
})

// --- FPS counter ---
let frameCount = 0
let lastFPSUpdate = performance.now()
function updateFPS() {
  frameCount++
  const now = performance.now()
  if (now - lastFPSUpdate >= 1000) {
    fpsUI.textContent = `${frameCount} FPS |`
    frameCount = 0
    lastFPSUpdate = now
  }
}

// --- Render loop ---
let running = false
function animate() {
  if (!running) return
  sceneManager.render()
  updateFPS()
  requestAnimationFrame(animate)
}

// --- Boot ---
buildProjectUI()
bindScramble()

// Set initial scene (no glitch on first load)
sceneManager.activeScene = 0
sceneManager.currentThreeScene = sceneManager.scenes[0].threeScene
sceneManager.renderPass.scene = sceneManager.scenes[0].threeScene
showSceneUI(0)

// Loader: animate fill, then dismiss and start
loaderFill.style.transition = 'width 1.8s cubic-bezier(0.65, 0, 0.35, 1)'
loaderFill.style.width = '100%'

loaderFill.addEventListener('transitionend', () => {
  loader.classList.add('hidden')
  nav.classList.add('visible')
  scroll.start()
  running = true
  animate()
}, { once: true })

// Fallback if transitionend doesn't fire
setTimeout(() => {
  if (!running) {
    loader.classList.add('hidden')
    nav.classList.add('visible')
    scroll.start()
    running = true
    animate()
  }
}, 2500)
