import { createRouter, createWebHistory } from 'vue-router'
import Certificate from './views/Certificate.vue'
import Dashboard from './views/Dashboard.vue'
import Gateway from './views/Gateway.vue'
import Plugin from './views/Plugin.vue'
import Route from './views/Route.vue'
import Service from './views/Service.vue'
import Upstream from './views/Upstream.vue'

const routes = [
    { path: '/', component: Dashboard },
    { path: '/certificate', component: Certificate },
    { path: '/dashboard', component: Dashboard },
    { path: '/gateway', component: Gateway },
    { path: '/plugin', component: Plugin },
    { path: '/route', component: Route },
    { path: '/service', component: Service },
    { path: '/upstream', component: Upstream },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router