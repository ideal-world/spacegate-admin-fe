<script setup lang="ts">
import { ref } from 'vue';
import Menu from './components/Menu.vue'
import Header from './components/Header.vue'
import { useRouter } from 'vue-router'
import { SelectInstance } from 'spacegate-admin'
import { Fold } from '@element-plus/icons-vue'
const isMenuCollapse = ref(false)
const currentPage = ref('')
const router = useRouter()
const pages = [
  {
    name: 'Dashboard',
    path: '/dashboard'
  },
  {
    name: 'Certificate',
    path: '/certificate'
  },
  {
    name: 'Settings',
    path: '/settings'
  }
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
    <el-aside width="200px" class="min-h-screen flex">
      <Menu :collapse="isMenuCollapse" :current-page="currentPage" :pages="pages" @to-page="toPage" class="w-full" />
    </el-aside>
    <el-container>
      <el-header class="w-100 flex border-b border-gray-200">
        <Header>
          <template #left>
            <el-button type="text" size="large" :icon="Fold" @click="isMenuCollapse = !isMenuCollapse"></el-button>
          </template>
          <template #right>
            <SelectInstance />
          </template>
        </Header>
      </el-header>
      <el-main><router-view/></el-main>
      <el-footer class="flex justify-center align-center">@Copyright spacegate</el-footer>
    </el-container>
  </el-container>
</template>