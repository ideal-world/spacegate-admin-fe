import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/', component: () => import('./views/Gateway.vue') },
  { path: '/gateway', component: () => import('./views/Gateway.vue') },
  { path: '/route', component: () => import('./views/Route.vue') },
  { path: '/plugins', component: () => import('./views/Plugin.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
