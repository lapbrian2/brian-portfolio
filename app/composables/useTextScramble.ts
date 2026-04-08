/**
 * Text scramble effect on hover — like joseph-san's `random-hover` class.
 * Scrambles characters with random glyphs, then resolves to original text.
 */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz'

export function useTextScramble() {
  function scramble(el: HTMLElement) {
    const original = el.dataset.original || el.textContent || ''
    if (!el.dataset.original) el.dataset.original = original

    let iteration = 0
    const length = original.length
    const interval = setInterval(() => {
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (i < iteration) return original[i]
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')
      iteration += 1 / 2
      if (iteration >= length) {
        el.textContent = original
        clearInterval(interval)
      }
    }, 30)
  }

  function bindAll(container: HTMLElement) {
    const elements = container.querySelectorAll<HTMLElement>('[data-scramble]')
    elements.forEach((el) => {
      el.addEventListener('mouseenter', () => scramble(el))
    })
  }

  return { scramble, bindAll }
}
