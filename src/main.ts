import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import El from 'element-plus'
import 'element-plus/dist/index.css'
import SgAdm, { SpacegateService as SgSrv, MESSAGES } from 'spacegate-admin'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'
let i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: MESSAGES
})
console.warn('i18n', MESSAGES)


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app
    .use(El)
    .use(router)
    .use(SgAdm)
    .use(i18n)
    .use(SgSrv, {
        backend: 'default'
    })
    .mount('#app')
