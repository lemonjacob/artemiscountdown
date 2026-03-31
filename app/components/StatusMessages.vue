<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

const { data: messages } = useConvexQuery(api.statusMessages.list)

const visibleMessages = computed(() =>
  messages.value?.filter(m => m.isVisible).sort((a, b) => a.order - b.order) ?? []
)
</script>

<template>
  <div
    v-if="visibleMessages.length"
    class="status-messages"
  >
    <div class="status-messages-header">
      <UIcon
        name="i-lucide-megaphone"
        class="h-3 w-3 text-amber-400/70"
      />
      <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
        Mission Status
      </span>
    </div>
    <div class="status-messages-list">
      <div
        v-for="msg in visibleMessages"
        :key="msg._id"
        class="status-message-item"
      >
        <span class="status-message-dot" />
        <p class="status-message-content">
          {{ msg.content }}
        </p>
      </div>
    </div>
  </div>
</template>
