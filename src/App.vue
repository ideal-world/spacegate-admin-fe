<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  DataBoard,
  Expand,
  Fold,
  Operation,
  Switch,
} from '@element-plus/icons-vue'
import { Api } from 'spacegate-admin-client'
import ConsoleGatewaySelect from './components/ConsoleGatewaySelect.vue'
import { Lang, RouterIcon, GatewayIcon, Instance, Github, Puzzle } from './icons'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const isMenuCollapse = ref(false)
const gatewayName = ref<string>()
const instanceOnlineCount = ref(0)
const instanceCount = ref(0)
const healthCheckIntervalHandle = ref<number>()
const appTexts = computed(() => locale.value.startsWith('zh') ? {
  instance: '实例',
} : {
  instance: 'Instances',
})

const pages = [
  { name: 'menu.overview', path: '/overview', icon: DataBoard },
  { name: 'menu.gateway', path: '/gateways', icon: GatewayIcon },
  { name: 'menu.router', path: '/routes', icon: RouterIcon },
  { name: 'menu.plugin', path: '/plugins', icon: Puzzle },
  { name: 'menu.aiQueue', path: '/ai-queue', icon: Operation },
  { name: 'menu.instance', path: '/instances', icon: Instance },
]

const langs = [
  { name: '中文', value: 'zh-CN' },
  { name: 'English', value: 'en-US' },
]

const activePage = computed(() => {
  const current = pages.find((page) => route.path === page.path)
  return current?.path ?? '/overview'
})

const instanceStatus = computed(() => {
  if (instanceCount.value === 0) return 'info'
  if (instanceOnlineCount.value === 0) return 'danger'
  if (instanceOnlineCount.value === instanceCount.value) return 'success'
  return 'warning'
})

watch(
  () => route.query.gatewayName,
  (value) => {
    if (typeof value === 'string') gatewayName.value = value
  },
  { immediate: true },
)

watch(gatewayName, async (name) => {
  if (!name) return
  if (route.query.gatewayName === name) return
  await router.replace({ query: { ...route.query, gatewayName: name } })
})

function toPage(path: string) {
  router.push({
    path,
    query: gatewayName.value ? { gatewayName: gatewayName.value } : {},
  })
}

async function refreshInstanceHealth() {
  try {
    const health = await Api.discoveryInstanceHealth()
    let total = 0
    let healthy = 0
    for (const isHealthy of Object.values(health.data)) {
      total += 1
      if (isHealthy) healthy += 1
    }
    instanceCount.value = total
    instanceOnlineCount.value = healthy
  } catch {
    instanceCount.value = 0
    instanceOnlineCount.value = 0
  }
}

onMounted(() => {
  refreshInstanceHealth()
  healthCheckIntervalHandle.value = window.setInterval(refreshInstanceHealth, 5000)
})

onUnmounted(() => {
  if (healthCheckIntervalHandle.value) window.clearInterval(healthCheckIntervalHandle.value)
})
</script>

<template>
  <el-container class="sg-console">
    <el-aside class="sg-console__aside" :class="{ 'is-collapsed': isMenuCollapse }">
      <div class="sg-console__brand">
        <el-icon class="sg-console__brand-icon"><Switch /></el-icon>
        <span v-if="!isMenuCollapse">SpaceGate</span>
      </div>
      <el-menu :default-active="activePage" class="sg-console__menu" :collapse="isMenuCollapse">
        <el-menu-item v-for="page in pages" :key="page.path" :index="page.path" @click="toPage(page.path)">
          <el-icon><component :is="page.icon" /></el-icon>
          <template #title>{{ t(page.name) }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="sg-console__body">
      <el-header class="sg-console__header">
        <div class="sg-console__header-left">
          <el-button
            circle
            text
            size="large"
            :icon="isMenuCollapse ? Expand : Fold"
            @click="isMenuCollapse = !isMenuCollapse"
          />
          <div class="sg-console__selector">
            <span class="sg-console__selector-label">{{ t('label.gatewayName') }}</span>
            <ConsoleGatewaySelect v-model="gatewayName" />
          </div>
        </div>

        <div class="sg-console__header-right">
          <el-tag :type="instanceStatus" effect="light">
            {{ appTexts.instance }} {{ instanceOnlineCount }}/{{ instanceCount }}
          </el-tag>
          <el-dropdown>
            <el-button circle text size="large" :icon="Lang" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="lang in langs" :key="lang.value" @click="locale = lang.value">
                  {{ lang.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <a href="https://github.com/ideal-world/spacegate" target="_blank" rel="noreferrer">
            <el-button text circle :icon="Github" />
          </a>
          <el-button text circle :icon="Operation" @click="toPage('/instances')" />
        </div>
      </el-header>

      <el-main class="sg-console__main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
