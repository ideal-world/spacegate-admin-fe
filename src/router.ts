import { createRouter, createWebHistory } from 'vue-router'
import Gateway from './views/Gateway.vue'
import Route from './views/Route.vue'
import Plugin from './views/Plugin.vue'

const routes = [
    { path: '/', component: Gateway },
    { path: '/gateway', component: Gateway },
    { path: '/route', component: Route },
    { path: '/plugins', component: Plugin },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router