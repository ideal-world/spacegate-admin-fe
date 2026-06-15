<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Api } from 'spacegate-admin-client'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { PluginPanel } from '@components/config'

const loading = ref(false)
const { locale } = useI18n()
type PluginInstanceRow = {
  code: string
  kind: string
  name?: string
  uid?: string
}

const pluginInstances = ref<PluginInstanceRow[]>([])
const texts = computed(() => locale.value.startsWith('zh') ? {
  loadFailed: '插件配置加载失败，请确认 admin-server 已启动',
  title: '插件中心',
  subtitle: '管理原生插件、Wasm/AI 插件和已创建的插件配置。',
  refresh: '刷新配置',
  marketTitle: '插件市场',
  marketDesc: '选择插件并进入配置，AI/Wasm 插件保留专用配置抽屉。',
  instancesTitle: '插件配置',
  instancesDesc: '当前配置中已保存的插件配置。',
  pluginType: '插件类型',
  configName: '配置名称',
  type: '类型',
  aiTitle: 'AI 网关建议',
  aiDesc: '参考常见 AI Gateway 控制台，优先补齐治理闭环。',
  aiCapabilities: [
    { title: '模型路由', desc: '可通过路由和插件组合实现模型代理、路径重写和后端分流。' },
    { title: '限流排队', desc: '已有 AI Gateway Queue 配置入口，适合接入队列配额和请求保护。' },
    { title: '安全治理', desc: '认证、内容安全和 Guardrails 需要通过插件配置逐步补齐。' },
    { title: '观测分析', desc: '模型目录、Key、Spend、Usage、Logs 暂无后端 API，本页只保留扩展提示。' },
  ],
} : {
  loadFailed: 'Plugin configurations failed to load. Check that admin-server is running.',
  title: 'Plugin Center',
  subtitle: 'Manage native plugins, Wasm/AI plugins, and saved plugin configurations.',
  refresh: 'Refresh Configs',
  marketTitle: 'Plugin Marketplace',
  marketDesc: 'Select a plugin to configure. AI/Wasm plugins use dedicated configuration drawers.',
  instancesTitle: 'Plugin Configurations',
  instancesDesc: 'Saved plugin configurations in the current config.',
  pluginType: 'Plugin Type',
  configName: 'Configuration',
  type: 'Type',
  aiTitle: 'AI Gateway Suggestions',
  aiDesc: 'Prioritize the governance loop based on common AI Gateway consoles.',
  aiCapabilities: [
    { title: 'Model Routing', desc: 'Use routes and plugins to proxy models, rewrite paths, and split backend traffic.' },
    { title: 'Rate Limit and Queue', desc: 'AI Gateway Queue is available for queue quotas and request protection.' },
    { title: 'Security Governance', desc: 'Authentication, content safety, and guardrails can be added through plugin configurations.' },
    { title: 'Observability', desc: 'Model catalog, keys, spend, usage, and logs do not have backend APIs yet; this page keeps the extension hints only.' },
  ],
})

async function load() {
  loading.value = true
  try {
    pluginInstances.value = (await Api.getConfigPluginAll()).data as PluginInstanceRow[]
  } catch {
    pluginInstances.value = []
    ElMessage.warning(texts.value.loadFailed)
  } finally {
    loading.value = false
  }
}

function instanceLabel(item: PluginInstanceRow) {
  if (item.kind === 'mono') return 'mono'
  if (item.kind === 'named') return item.name
  return item.uid
}

onMounted(load)

</script>

<template>
  <div class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
      <el-button :icon="Refresh" @click="load">{{ texts.refresh }}</el-button>
    </div>

    <div class="content-grid content-grid--wide">
      <section class="panel">
        <div class="panel__header">
          <div>
              <h2>{{ texts.marketTitle }}</h2>
              <p>{{ texts.marketDesc }}</p>
          </div>
        </div>
        <PluginPanel />
      </section>

      <div class="side-stack">
        <section class="panel">
          <div class="panel__header">
            <div>
              <h2>{{ texts.instancesTitle }}</h2>
              <p>{{ texts.instancesDesc }}</p>
            </div>
          </div>
          <el-table v-loading="loading" :data="pluginInstances" size="small">
            <el-table-column prop="code" :label="texts.pluginType" min-width="140" />
            <el-table-column :label="texts.configName" min-width="160">
              <template #default="{ row }">{{ instanceLabel(row) }}</template>
            </el-table-column>
            <el-table-column prop="kind" :label="texts.type" width="110" />
          </el-table>
        </section>

        <section class="panel ai-guidance-panel">
          <div class="panel__header">
            <div>
              <h2>{{ texts.aiTitle }}</h2>
              <p>{{ texts.aiDesc }}</p>
            </div>
          </div>
          <div class="guidance-list">
            <div v-for="item in texts.aiCapabilities" :key="item.title" class="guidance-item">
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
