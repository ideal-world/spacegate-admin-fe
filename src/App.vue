<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Menu from './components/Menu.vue'
import Header from './components/Header.vue'
import { useRouter } from 'vue-router'
import { SelectGateway } from '@components/config'
import { Fold, Expand, } from '@element-plus/icons-vue'
import {
  Lang,
  RouterIcon,
  GatewayIcon,
  Github,
  Puzzle,
  Instance
} from './icons'
import { useI18n } from 'vue-i18n'
import { Api } from 'spacegate-admin-client';
const { locale, t } = useI18n()
const router = useRouter()
const langs = [
  {
    name: '中文',
    value: 'zh-CN'
  },
  {
    name: 'English',
    value: 'en-US'
  }
]
const isMenuCollapse = ref(false)
const pages = [
  { name: 'menu.gateway', path: '/gateway', icon: GatewayIcon },
  { name: 'menu.router', path: '/route', icon: RouterIcon },
  { name: 'menu.plugin', path: '/plugins', icon: Puzzle },
  { name: 'menu.instance', path: '/instance', icon: Instance },
]
const currentPage = ref(pages.find(p => p.path === router.currentRoute.value.path)?.name ?? '')
const gatewayName = ref<string>()
watch([gatewayName, currentPage], async ([newGatewayName, _page]) => {
  if (newGatewayName) {
    await router.replace({ query: { gatewayName: newGatewayName } });
  }
})
watch(() => router.currentRoute.value.query['gatewayName'], (newValue) => {
  if(typeof newValue === 'string') {
    gatewayName.value = newValue
  }
})
function toPage(pageName: string) {
  let page = pages.find(p => p.path === pageName);
  if (!page) {
    return
  } else {
    router.push({
      path: page.path,
      query: { gatewayName: gatewayName.value }
    })
  }
}
const instanceOnlineCount = ref<number>(0);
const instanceCount = ref<number>(0);
const healthCheckIntervalHandle = ref<number>(undefined);
const instanceStatus = computed(() => {
  if (instanceCount.value === 0) {
    return 'info'
  } else if (instanceOnlineCount.value === 0) {
    return 'danger'
  } else if (instanceOnlineCount.value === instanceCount.value) {
    return 'success'
  } else {
    return 'warning'
  }
});
/* const instanceStatusText = computed(() => {
  if (instanceOnlineCount.value === null) {
    return t('hint.unreachable')
  } else if (instanceOnlineCount.value) {
    return t('hint.online')
  } else {
    return t('hint.offline')
  }
}); */
onMounted(
  () => {
    healthCheckIntervalHandle.value = setInterval(async () => {
      try {
        let health = await Api.discoveryInstanceHealth();
        console.log(health)
        let totalCount = 0;
        let healthyCount = 0;
        for (const isHealthy of Object.values(health.data)) {
          totalCount += 1;
          if (isHealthy) {
            healthyCount += 1;
          }
        }
        console.log(totalCount, healthyCount)
        instanceCount.value = totalCount;
        instanceOnlineCount.value = healthyCount;
      } catch (e) {
        instanceCount.value = 0;
        instanceOnlineCount.value = 0;
      }
    }, 5000);

  }
)
onUnmounted(() => {
  if (healthCheckIntervalHandle.value) clearInterval(healthCheckIntervalHandle.value);
})


</script>

<template>
  <el-container class="h-screen w-screen">
    <el-aside class="min-h-screen w-auto flex">
      <Menu :collapse="isMenuCollapse" :current-page="currentPage" :pages="pages" @to-page="toPage" />
    </el-aside>
    <el-container class="flex-grow">
      <el-header class="w-100 flex border-b border-gray-200 ">
        <Header>
          <template #left>
            <el-button circle text size="large" :icon="isMenuCollapse ? Expand : Fold"
              @click="isMenuCollapse = !isMenuCollapse"></el-button>
            <el-button class="mx-1" text disabled :type="instanceStatus
              ">●{{ instanceOnlineCount }}/{{ instanceCount }}</el-button>
            <SelectGateway v-model="gatewayName" />
          </template>
          <template #right>
            <el-dropdown>
              <span class="el-dropdown-link">
                <el-button circle text size="large" :icon="Lang" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="lang in langs" @click="locale = lang.value">
                    {{
                      lang.name
                    }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <a href="https://github.com/ideal-world/spacegate-admin-fe" target="_blank">
              <el-button text circle :icon="Github" link>
              </el-button>
            </a>
          </template>
        </Header>
      </el-header>
      <el-main class="flex flex-col space-y-2 y-full">
        <router-view />
      </el-main>
      <el-footer class="flex justify-center align-center items-center">
        <div class="container mx-auto flex justify-center">
          <p class="text-center text-sm text-gray-500">&copy; 2025 Ideal World</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>