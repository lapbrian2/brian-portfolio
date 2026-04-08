const GLYPHS = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz0123456789'

export function scramble(el) {
  const original = el.dataset.original || el.textContent || ''
  if (!el.dataset.original) el.dataset.original = original

  let iteration = 0
  const length = original.length
  const interval = setInterval(() => {
    el.textContent = original
      .split('')
      .map((char, i) => {
        if (i < iteration) return original[i]
        if (char === ' ') return ' '
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      })
      .join('')
    iteration += 0.5
    if (iteration >= length) {
      el.textContent = original
      clearInterval(interval)
    }
  }, 25)
}

export function bindScramble(container = document.body) {
  container.querySelectorAll('[data-scramble]').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el))
  })
}
