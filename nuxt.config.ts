export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },

  css: ['~/assets/styles/main.css'],
  build: { transpile: ['three', 'gsap'] },
  vite: { optimizeDeps: { exclude: ['three'] } },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Brian Lapinski — Creative Developer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Brian Lapinski is a creative web developer building immersive digital experiences with WebGL, Three.js, and GSAP.' },
        { name: 'theme-color', content: '#07161a' },
        { property: 'og:title', content: 'Brian Lapinski — Creative Developer' },
        { property: 'og:description', content: 'Immersive digital experiences with WebGL, Three.js, and GSAP.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap' },
      ],
    },
  },
})
