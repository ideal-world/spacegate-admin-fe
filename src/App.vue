<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, computed } from 'vue';
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
  Puzzle
} from './icons'
import { useI18n } from 'vue-i18n'
import { GATEWAY_NAME_SYMBOL } from './consts';
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
]
const currentPage = ref(pages.find(p => p.path === router.currentRoute.value.path)?.name ?? '')
const gatewayName = ref<string>()
provide(GATEWAY_NAME_SYMBOL, gatewayName)
function toPage(pageName: string) {
  let page = pages.find(p => p.path === pageName);
  if (!page) {
    return
  } else {
    router.push(page.path)
  }
}
const instanceOnline = ref<null | boolean>(null);
const healthCheckIntervalHandle = ref<number>(undefined);
const instanceStatus = computed(() => {
  if (instanceOnline.value === null) {
    return 'info'
  } else if (instanceOnline.value) {
    return 'success'
  } else {
    return 'danger'
  }
});
const instanceStatusText = computed(() => {
  if (instanceOnline.value === null) {
    return t('hint.unreachable')
  } else if (instanceOnline.value) {
    return t('hint.online')
  } else {
    return t('hint.offline')
  }
});
onMounted(
  () => {
    healthCheckIntervalHandle.value = setInterval(async () => {
      try {
        let health = await Api.instanceHealth();
        instanceOnline.value = health.data;
      } catch (e) {
        instanceOnline.value = null;
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
      <Menu :collapse="isMenuCollapse" :current-page="currentPage" :pages="pages" @to-page="toPage" class="w-full" />
    </el-aside>
    <el-container class="flex-grow">
      <el-header class="w-100 flex border-b border-gray-200 ">
        <Header>
          <template #left>
            <el-button circle text size="large" :icon="isMenuCollapse ? Expand : Fold"
              @click="isMenuCollapse = !isMenuCollapse"></el-button>
            <el-button class="mx-1" text disabled :type="instanceStatus
              ">●{{ instanceStatusText }}</el-button>
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
          <p class="text-center text-sm text-gray-500">&copy; 2024 Ideal World</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>