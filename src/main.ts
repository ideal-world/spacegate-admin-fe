import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import El from 'element-plus'
import 'element-plus/dist/index.css'
import SgAdm, { SpacegateService as SgSrv, LOCALES } from '@components/config'
import { Api }  from 'spacegate-admin-client'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor'
import { createI18n } from 'vue-i18n'
let i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: {
        'zh-CN': {
            menu: {
                "router": "路由",
                "gateway": "网关"
            },
            ...LOCALES['zh-CN'],
        },
        'en': {
            menu: {
                "router": "router",
                "gateway": "gateway"
            },
            ...LOCALES['en'],
        }

    }
})
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
})
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            let worker = new jsonWorker();
            return worker;
        } else {
            return new editorWorker();
        }
    },
};
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
Api.setClient({
    baseURL: '/api',
});
app
    .use(El)
    .use(router)
    .use(SgAdm)
    .use(i18n)
    .mount('#app')
