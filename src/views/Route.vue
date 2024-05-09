<script setup lang="ts">
import { Routes } from '@components/config'
import { computed } from 'vue'
import { useRoute } from 'vue-router';
const route = useRoute()
const gatewayName = computed(() => {
  const name = route.query['gatewayName']
  if (typeof name === 'string') {
    return name
  } else {
    return undefined
  }
})
</script>

<template>
  <Routes v-if="gatewayName !== undefined" :gateway-name="gatewayName" />
</template>
