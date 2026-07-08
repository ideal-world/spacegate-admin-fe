<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Refresh } from '@element-plus/icons-vue'
import { PluginPanel } from '@components/config'

const { locale } = useI18n()
const route = useRoute()
const panelKey = ref(0)
const gatewayName = computed(() => typeof route.query.gatewayName === 'string' ? route.query.gatewayName : undefined)
const texts = computed(() => locale.value.startsWith('zh') ? {
  title: '插件中心',
  subtitle: '管理原生插件和自定义 Wasm 插件定义，并可将 Wasm 插件启用到当前网关。',
  refresh: '刷新配置',
  marketTitle: '插件市场',
  marketDesc: '插件中心只维护插件定义和默认配置；路由、后端等资源绑定生成的专属配置不会在这里显示。',
} : {
  title: 'Plugin Center',
  subtitle: 'Manage native plugins and custom Wasm plugin definitions, and enable Wasm plugins on the current gateway.',
  refresh: 'Refresh Configs',
  marketTitle: 'Plugin Marketplace',
  marketDesc: 'Plugin Center keeps plugin definitions and default configs only. Resource-specific route/backend bindings are not shown here.',
})

function refreshPanel() {
  panelKey.value += 1
}
</script>

<template>
  <div class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
      <el-button :icon="Refresh" @click="refreshPanel">{{ texts.refresh }}</el-button>
    </div>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>{{ texts.marketTitle }}</h2>
          <p>{{ texts.marketDesc }}</p>
        </div>
      </div>
      <PluginPanel :key="panelKey" :gateway-name="gatewayName" @changed="refreshPanel" />
    </section>
  </div>
</template>
