<script setup lang="ts">
import { Gateway } from '@components/config'
import { Ref, inject } from 'vue'
import { GATEWAY_NAME_SYMBOL } from '../consts';

const gatewayName: Ref<string | undefined> = inject(GATEWAY_NAME_SYMBOL)!
</script>

<template>
  <Gateway v-if="gatewayName !== undefined" :gateway-name="gatewayName!" />
</template>
