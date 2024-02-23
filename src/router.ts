import { createRouter, createWebHistory } from 'vue-router'
import Gateway from './views/Gateway.vue'
import Route from './views/Route.vue'

const routes = [
    { path: '/', component: Gateway },
    { path: '/gateway', component: Gateway },
    { path: '/route', component: Route },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router