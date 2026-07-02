import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: () => import('./views/Overview.vue') },
  { path: '/gateways', component: () => import('./views/Gateways.vue') },
  { path: '/gateway', redirect: '/gateways' },
  { path: '/routes', component: () => import('./views/Routes.vue') },
  { path: '/route', redirect: '/routes' },
  { path: '/plugins', component: () => import('./views/Plugins.vue') },
  { path: '/ai-queue', component: () => import('./views/AiQueueRateLimit.vue') },
  { path: '/instances', component: () => import('./views/Instances.vue') },
  { path: '/instance', redirect: '/instances' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
