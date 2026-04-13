// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', 'convex-nuxt'],
  ssr: true,
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-04-13',
  vite: {
    optimizeDeps: {
      include: ['convex/server']
    }
  },
  convex: {
    url: process.env.CONVEX_URL
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
