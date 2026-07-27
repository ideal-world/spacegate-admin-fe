<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Api, Model } from 'spacegate-admin-client'
import { Connection, Operation, Position } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Puzzle } from '../icons'
import { backendSummary, isMcpRoute, listenerSummary, pluginCount, routeMatchSummary } from './console-utils'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const loading = ref(false)
const gatewayNames = ref<string[]>([])
const routes = ref<Model.SgRoute[]>([])
const pluginInstanceCount = ref(0)
const instances = ref<Array<{ id: string; healthy?: boolean }>>([])

const gatewayName = computed(() => {
  const name = route.query.gatewayName
  return typeof name === 'string' ? name : gatewayNames.value[0]
})

const selectedGateway = ref<Model.SgGateway | null>(null)
const texts = computed(() => locale.value.startsWith('zh') ? {
  loadFailed: '概览数据加载失败，请确认 admin-server 已启动',
  title: '概览',
  subtitle: '查看当前网关资源、插件配置和运行状态。',
  configureRoutes: '配置路由',
  onlineInstances: '在线实例',
  gateways: '网关',
  routes: '路由',
  pluginConfigs: '插件配置',
  currentGateway: '当前网关',
  notSelected: '未选择',
  manage: '管理',
  listeners: '监听',
  gatewayPlugins: '网关插件',
  emptyGateway: '暂无网关',
  instanceHealth: '实例健康',
  instanceHealthDesc: 'admin-server 发现到的网关实例。',
  operations: '运维',
  instance: '实例',
  status: '状态',
  online: '在线',
  offline: '离线',
  routeSummary: '路由概况',
  routeSummaryDesc: '当前网关下的路由匹配和后端摘要。',
  viewAll: '查看全部',
  routeName: '路由名称',
  routeType: '类型',
  match: '匹配',
  backend: '后端',
  priority: '优先级',
  aiTitle: 'AI 网关治理待完善',
  aiDesc: '模型目录、Key、Spend、Logs 等能力暂无后端 API，限流、认证、安全策略建议先通过插件配置承载。详细建议见插件中心。',
  viewPlugins: '查看插件',
} : {
  loadFailed: 'Overview data failed to load. Check that admin-server is running.',
  title: 'Overview',
  subtitle: 'View gateway resources, plugin configurations, and runtime status.',
  configureRoutes: 'Configure Routes',
  onlineInstances: 'Online Instances',
  gateways: 'Gateways',
  routes: 'Routes',
  pluginConfigs: 'Plugin Configurations',
  currentGateway: 'Current Gateway',
  notSelected: 'Not selected',
  manage: 'Manage',
  listeners: 'Listeners',
  gatewayPlugins: 'Gateway Plugins',
  emptyGateway: 'No gateway',
  instanceHealth: 'Instance Health',
  instanceHealthDesc: 'Gateway instances discovered by admin-server.',
  operations: 'Operations',
  instance: 'Instance',
  status: 'Status',
  online: 'Online',
  offline: 'Offline',
  routeSummary: 'Route Summary',
  routeSummaryDesc: 'Route matching and backend summary under the current gateway.',
  viewAll: 'View All',
  routeName: 'Route',
  routeType: 'Type',
  match: 'Match',
  backend: 'Backend',
  priority: 'Priority',
  aiTitle: 'AI Gateway Governance Backlog',
  aiDesc: 'Model catalog, keys, spend, and logs have no backend APIs yet. Rate limits, auth, and safety policies should be modeled as plugin configs for now. See Plugin Center for details.',
  viewPlugins: 'View Plugins',
})

const onlineCount = computed(() => instances.value.filter((item) => item.healthy).length)

// Element Plus exposes table slots as DefaultRow; restore the declared :data element type at the slot boundary.
function routeTableRow(row: unknown): Model.SgRoute {
  return row as Model.SgRoute
}

function routePriority(row: unknown) {
  const route = routeTableRow(row)
  return isMcpRoute(route) ? '-' : route.priority
}

async function load() {
  loading.value = true
  try {
    await Promise.all([loadGatewayNames(), loadPluginCount(), loadInstances()])
    await loadGatewayDetail()
  } catch (error) {
    ElMessage.warning(texts.value.loadFailed)
  } finally {
    loading.value = false
  }
}

async function loadGatewayNames() {
  try {
    gatewayNames.value = (await Api.getConfigNames()).data
  } catch {
    gatewayNames.value = []
    throw new Error('load gateway names failed')
  }
}

async function loadPluginCount() {
  try {
    pluginInstanceCount.value = (await Api.getConfigPluginAll()).data.length
  } catch {
    pluginInstanceCount.value = 0
    throw new Error('load plugin instances failed')
  }
}

async function loadInstances() {
  try {
    const instanceIds = (await Api.discoveryInstanceList()).data
    const health = (await Api.discoveryInstanceHealth()).data
    instances.value = instanceIds.map((id) => ({ id, healthy: health[id] }))
  } catch {
    instances.value = []
    throw new Error('load instances failed')
  }
}

async function loadGatewayDetail() {
  if (!gatewayName.value) {
    selectedGateway.value = null
    routes.value = []
    return
  }
  try {
    selectedGateway.value = (await Api.getConfigItemGateway(gatewayName.value)).data
    const names = (await Api.getConfigItemRouteNames(gatewayName.value)).data
    const loaded = await Promise.all(names.map(async (name) => (await Api.getConfigItemRoute(gatewayName.value!, name)).data))
    routes.value = loaded.filter((item): item is Model.SgRoute => item != null)
  } catch {
    selectedGateway.value = null
    routes.value = []
  }
}

function go(path: string) {
  router.push({ path, query: gatewayName.value ? { gatewayName: gatewayName.value } : {} })
}

watch(() => route.query.gatewayName, loadGatewayDetail)
onMounted(load)
</script>

<template>
  <div v-loading="loading" class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
      <el-button type="primary" @click="go('/routes')">{{ texts.configureRoutes }}</el-button>
    </div>

    <div class="metric-grid">
      <button class="metric-card" type="button" @click="go('/instances')">
        <el-icon><Connection /></el-icon>
        <span>{{ texts.onlineInstances }}</span>
        <strong>{{ onlineCount }}/{{ instances.length }}</strong>
      </button>
      <button class="metric-card" type="button" @click="go('/gateways')">
        <el-icon><Operation /></el-icon>
        <span>{{ texts.gateways }}</span>
        <strong>{{ gatewayNames.length }}</strong>
      </button>
      <button class="metric-card" type="button" @click="go('/routes')">
        <el-icon><Position /></el-icon>
        <span>{{ texts.routes }}</span>
        <strong>{{ routes.length }}</strong>
      </button>
      <button class="metric-card" type="button" @click="go('/plugins')">
        <el-icon><Puzzle /></el-icon>
        <span>{{ texts.pluginConfigs }}</span>
        <strong>{{ pluginInstanceCount }}</strong>
      </button>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel__header">
          <div>
            <h2>{{ texts.currentGateway }}</h2>
            <p>{{ gatewayName || texts.notSelected }}</p>
          </div>
          <el-button @click="go('/gateways')">{{ texts.manage }}</el-button>
        </div>
        <el-descriptions v-if="selectedGateway" :column="1" border>
          <el-descriptions-item :label="texts.listeners">{{ listenerSummary(selectedGateway) }}</el-descriptions-item>
          <el-descriptions-item :label="texts.gatewayPlugins">{{ pluginCount(selectedGateway.plugins) }}</el-descriptions-item>
          <el-descriptions-item label="Redis">{{ selectedGateway.parameters?.redis_url || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else :description="texts.emptyGateway" />
      </section>

      <section class="panel">
        <div class="panel__header">
          <div>
              <h2>{{ texts.instanceHealth }}</h2>
              <p>{{ texts.instanceHealthDesc }}</p>
            </div>
          <el-button @click="go('/instances')">{{ texts.operations }}</el-button>
        </div>
        <el-table :data="instances" size="small">
          <el-table-column prop="id" :label="texts.instance" />
          <el-table-column :label="texts.status" width="120">
            <template #default="{ row }">
              <el-tag :type="row.healthy ? 'success' : 'danger'">{{ row.healthy ? texts.online : texts.offline }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>{{ texts.routeSummary }}</h2>
          <p>{{ texts.routeSummaryDesc }}</p>
        </div>
        <el-button @click="go('/routes')">{{ texts.viewAll }}</el-button>
      </div>
      <el-table :data="routes.slice(0, 6)">
        <el-table-column prop="route_name" :label="texts.routeName" min-width="180" />
        <el-table-column :label="texts.routeType" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="isMcpRoute(routeTableRow(row)) ? 'success' : 'info'">{{ isMcpRoute(routeTableRow(row)) ? 'MCPRoute' : 'HTTPRoute' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="texts.match" min-width="180">
          <template #default="{ row }">{{ routeMatchSummary(routeTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.backend" min-width="180">
          <template #default="{ row }">{{ backendSummary(routeTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.priority" width="100">
          <template #default="{ row }">{{ routePriority(row) }}</template>
        </el-table-column>
      </el-table>
    </section>

    <section class="panel ai-guidance-panel">
      <div class="panel__header">
        <div>
          <h2>{{ texts.aiTitle }}</h2>
          <p>{{ texts.aiDesc }}</p>
        </div>
        <el-button @click="go('/plugins')">{{ texts.viewPlugins }}</el-button>
      </div>
    </section>
  </div>
</template>
