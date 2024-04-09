<script setup lang="ts">
import { PluginPanel } from '@components/config'
import { Ref, inject } from 'vue'
import { GATEWAY_NAME_SYMBOL } from '../consts';
const gatewayName: Ref<string | undefined> = inject(GATEWAY_NAME_SYMBOL)!
</script>

<template>
  <PluginPanel/>
</template>
