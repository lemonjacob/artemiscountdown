<script setup lang="ts">
const title = 'Artemis II Mission Tracker'
const description = 'A live Artemis II mission dashboard with countdown, livestream switching, and a dynamic mission timeline.'

useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'dark'
  },
  bodyAttrs: {
    class: 'bg-[#02040a] text-slate-100 antialiased'
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
