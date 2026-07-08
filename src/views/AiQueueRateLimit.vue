<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Api, Model } from 'spacegate-admin-client'
import { Setting } from '@element-plus/icons-vue'
import { AiGatewayQueueDrawer, TenantRateLimitTable } from '@components/config'

type PluginConfigLite = {
  code: string
  kind: 'anon' | 'named' | 'mono'
  uid?: string
  name?: string
  spec?: Record<string, unknown>
}

const { locale } = useI18n()
const drawerVisible = ref(false)
const queueInstance = ref<Model.PluginConfig | undefined>()
const loading = ref(false)

const texts = computed(() => locale.value.startsWith('zh') ? {
  title: 'AI 排队限流',
  subtitle: '配置 AI 网关排队限流插件宿主参数和租户级队列配额。',
  hostTitle: '插件宿主配置',
  hostDesc: '配置 ai-gateway-queue Wasm 插件加载参数、后端服务地址和 VM 池。保存后需要执行全局重载。',
  openHostConfig: '配置插件宿主',
  quotaTitle: '租户队列配额',
  quotaDesc: '按租户、模型、路径和策略维护排队限流规则。',
} : {
  title: 'AI Queue Rate Limit',
  subtitle: 'Configure AI Gateway queue plugin host settings and tenant queue quotas.',
  hostTitle: 'Plugin Host Configuration',
  hostDesc: 'Configure ai-gateway-queue Wasm loading settings, backend service URL, and VM pools. Run Global Reload after saving.',
  openHostConfig: 'Configure Plugin Host',
  quotaTitle: 'Tenant Queue Quotas',
  quotaDesc: 'Manage queue rate-limit rules by tenant, model, path, and policy.',
})

function toPluginConfigLite(value: unknown): PluginConfigLite | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.code !== 'string') return null
  if (item.kind !== 'anon' && item.kind !== 'named' && item.kind !== 'mono') return null
  return item as PluginConfigLite
}

async function loadQueueInstance() {
  loading.value = true
  try {
    const response = await Api.getConfigPluginsByCode('wasm')
    const list = Array.isArray(response.data) ? response.data : []
    const configs = list.map(toPluginConfigLite).filter((item): item is PluginConfigLite => item !== null)
    queueInstance.value = configs.find((item) => item.spec?.plugin_name === 'ai-gateway-queue' || item.name === 'ai-gateway-queue') as Model.PluginConfig | undefined
  } finally {
    loading.value = false
  }
}

async function onSaved() {
  await loadQueueInstance()
}

onMounted(loadQueueInstance)
</script>

<template>
  <div class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
    </div>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>{{ texts.hostTitle }}</h2>
          <p>{{ texts.hostDesc }}</p>
        </div>
        <el-button :icon="Setting" type="primary" :loading="loading" @click="drawerVisible = true">
          {{ texts.openHostConfig }}
        </el-button>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>{{ texts.quotaTitle }}</h2>
          <p>{{ texts.quotaDesc }}</p>
        </div>
      </div>
      <TenantRateLimitTable />
    </section>

    <AiGatewayQueueDrawer
      v-model="drawerVisible"
      :instance="queueInstance"
      @saved="onSaved"
    />
  </div>
</template>
