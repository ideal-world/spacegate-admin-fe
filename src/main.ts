import { createApp, createVNode } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import El, { ElMessageBox } from 'element-plus'
import 'element-plus/dist/index.css'
import SgAdm, { Login } from '@components/config'
import { LOCALES } from './locales'
import { Api } from 'spacegate-admin-client'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import * as monaco from 'monaco-editor'
import { createI18n } from 'vue-i18n'
const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: LOCALES
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
Api.getClient().axiosInstance.interceptors.response.use(
    (resp) => resp,
    (error) => {
        if (error instanceof Api.ExceptionUnauthorized) {
            const node = createVNode(Login);
            ElMessageBox.confirm(node, i18n.global.t('hint.needLogin'), {
                confirmButtonText: i18n.global.t('button.login'),
                showClose: false,
                showCancelButton: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                callback: async () => {
                    await node.component.exposed.login();
                    location.reload();
                }
            })
            return Promise.resolve();
        }

        return Promise.reject(error)
    }
)

app
    .use(El)
    .use(router)
    .use(SgAdm)
    .use(i18n)
    .mount('#app')
