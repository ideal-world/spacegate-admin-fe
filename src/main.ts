import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import El from 'element-plus'
import 'element-plus/dist/index.css'
import SgAdm, { SpacegateService as SgSrv, MESSAGES } from '@component-config'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createI18n } from 'vue-i18n'
let i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: MESSAGES
})

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
console.log(app)
app
    .use(SgSrv, {
        backend: 'default'
    })
    .use(El)
    .use(router)
    .use(SgAdm)
    .use(i18n)
    .mount('#app')
