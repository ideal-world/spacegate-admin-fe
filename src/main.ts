import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import El from 'element-plus'
import 'element-plus/dist/index.css'
import SgAdm, { SpacegateService as SgSrv, MESSAGES } from '@components/config'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor'
import { createI18n } from 'vue-i18n'
let i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: MESSAGES
})
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
})
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            let worker = new jsonWorker();
            console.debug('json worker created', worker)
            return worker;
        } else {
            console.debug(`could not found worker with label ${label}, fallback to editor worker`)
            return new editorWorker();
        }
    },
};
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app
    .use(SgSrv, {
        config: []
    })
    .use(El)
    .use(router)
    .use(SgAdm)
    .use(i18n)
    .mount('#app')
