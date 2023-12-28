<script setup lang="ts">
import { ref } from 'vue';
import Menu from './components/Menu.vue'
import Header from './components/Header.vue'
import { useRouter } from 'vue-router'
import { SelectInstance } from 'spacegate-admin'
import { Fold, Expand, DataAnalysis, Upload } from '@element-plus/icons-vue'
import {
  Lang,
  PluginIcon,
  ServiceIcon,
  RouterIcon,
  CertIcon,
  GatewayIcon,
  Github,
} from './icons'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
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
const currentPage = ref('')
const router = useRouter()
const pages = [
  {
    name: 'dashboard',
    path: '/dashboard',
    icon: DataAnalysis
  },
  {
    name: 'certificate',
    path: '/certificate',
    icon: CertIcon
  },
  { name: 'gateway', path: '/gateway', icon: GatewayIcon },
  { name: 'plugin', path: '/plugin', icon: PluginIcon },
  { name: 'route', path: '/route', icon: RouterIcon },
  { name: 'service', path: '/service', icon: ServiceIcon },
  { name: 'upstream', path: '/upstream', icon: Upload },
]

function toPage(pageName: string) {
  let page = pages.find(p => p.path === pageName);
  if (!page) {
    return
  } else {
    router.push(page.path)
  }
}


</script>

<template>
  <el-container class="h-screen w-screen">
    <el-aside :width="isMenuCollapse ? 64 : 200" class="min-h-screen flex flex-shrink">
      <Menu :collapse="isMenuCollapse" :current-page="currentPage" :pages="pages" @to-page="toPage" class="w-full" />
    </el-aside>
    <el-container class="flex-grow">
      <el-header class="w-100 flex border-b border-gray-200 ">
        <Header>
          <template #left>
            <el-button circle text size="large" :icon="isMenuCollapse ? Expand : Fold"
              @click="isMenuCollapse = !isMenuCollapse"></el-button>
          </template>
          <template #right>
            <SelectInstance />
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
            <el-button text circle :icon="Github" link></el-button>
          </template>
        </Header>
      </el-header>
      <el-main class="flex flex-col space-y-2 y-full">
        <router-view />
      </el-main>
      <el-footer class="flex justify-center align-center items-center">
        <div class="container mx-auto flex justify-center">
          <p class="text-center text-sm text-gray-500">&copy; Copyright spacegate</p>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>