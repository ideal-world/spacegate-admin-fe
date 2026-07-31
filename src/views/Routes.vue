<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Api, Model } from 'spacegate-admin-client'
import { CopyDocument, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ActionBar from '../components/ActionBar.vue'
import RouteEditorDrawer from '../components/RouteEditorDrawer.vue'
import { backendSummary, cloneJson, hostnameSummary, isMcpRoute, pluginCount, routeMatchSummary, routeTypeLabel } from './console-utils'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const loading = ref(false)
const saving = ref(false)
const search = ref('')
const gatewayNames = ref<string[]>([])
const routes = ref<Model.SgRoute[]>([])
const drawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const originalRouteName = ref('')
const formModel = ref<Model.SgRoute>(newRoute())

const texts = computed(() => locale.value.startsWith('zh') ? {
  loadGatewayFailed: '网关列表加载失败，请确认 admin-server 已启动',
  loadRouteFailed: '路由列表加载失败',
  missingRouteName: '请输入路由名称',
  routeSaved: '路由已保存',
  routeSaveFailed: '路由保存失败',
  confirmDelete: (name: string) => `确认删除路由 ${name}？`,
  deleteTitle: '删除路由',
  routeDeleted: '路由已删除',
  routeDeleteFailed: '路由删除失败',
  title: '路由管理',
  subtitle: '按网关管理路由匹配、后端目标、插件链和超时策略。',
  gatewayPlaceholder: '选择网关',
  refresh: '刷新',
  create: '新建路由',
  search: '搜索路由、主机名或后端',
  routeName: '路由名称',
  routeType: '类型',
  hostname: '主机名',
  match: '匹配',
  backend: '后端',
  priority: '优先级',
  plugins: '插件',
  operation: '操作',
  edit: '编辑',
  copy: '复制',
  delete: '删除',
  emptyTitle: '暂无路由',
  emptyDesc: '点击“新建路由”为当前网关添加匹配规则。',
} : {
  loadGatewayFailed: 'Gateway list failed to load. Check that admin-server is running.',
  loadRouteFailed: 'Route list failed to load.',
  missingRouteName: 'Enter a route name.',
  routeSaved: 'Route saved.',
  routeSaveFailed: 'Route save failed.',
  confirmDelete: (name: string) => `Delete route ${name}?`,
  deleteTitle: 'Delete Route',
  routeDeleted: 'Route deleted.',
  routeDeleteFailed: 'Route delete failed.',
  title: 'Route Management',
  subtitle: 'Manage route matching, upstream targets, plugin chains, and timeout policies by gateway.',
  gatewayPlaceholder: 'Select Gateway',
  refresh: 'Refresh',
  create: 'Create Route',
  search: 'Search route, hostname, or backend',
  routeName: 'Route',
  routeType: 'Type',
  hostname: 'Hostname',
  match: 'Match',
  backend: 'Backend',
  priority: 'Priority',
  plugins: 'Plugins',
  operation: 'Actions',
  edit: 'Edit',
  copy: 'Copy',
  delete: 'Delete',
  emptyTitle: 'No routes yet',
  emptyDesc: 'Click “Create Route” to add a matching rule for this gateway.',
})

const gatewayName = computed(() => {
  const queryName = route.query.gatewayName
  return typeof queryName === 'string' ? queryName : gatewayNames.value[0]
})

const filteredRoutes = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return routes.value
  return routes.value.filter((item) => {
    return (
      item.route_name.toLowerCase().includes(q) ||
      hostnameSummary(item).toLowerCase().includes(q) ||
      backendSummary(item).toLowerCase().includes(q)
    )
  })
})

// Element Plus exposes table slots as DefaultRow; restore the declared :data element type at the slot boundary.
function routeTableRow(row: unknown): Model.SgRoute {
  return row as Model.SgRoute
}

function routePriority(row: unknown) {
  const route = routeTableRow(row)
  return isMcpRoute(route) ? '-' : route.priority
}

function newRoute(): Model.SgHttpRoute {
  return {
    route_name: 'new-route',
    hostnames: null,
    plugins: [],
    rules: [
      {
        matches: [
          {
            path: { kind: 'Prefix', value: '/', replace: null },
            header: null,
            query: null,
            method: null,
          },
        ],
        plugins: [],
        backends: [
          {
            host: { kind: 'Host', host: '127.0.0.1' },
            port: 80,
            timeout_ms: null,
            timeout_mode: null,
            protocol: 'http',
            weight: 1,
            plugins: [],
            downgrade_http2: false,
          },
        ],
        timeout_ms: null,
        timeout_mode: null,
        balance_policy: null,
      },
    ],
    priority: 0,
  }
}

async function loadGatewayNames() {
  try {
    gatewayNames.value = (await Api.getConfigNames()).data
    if (!route.query.gatewayName && gatewayNames.value[0]) {
      await router.replace({ query: { ...route.query, gatewayName: gatewayNames.value[0] } })
    }
  } catch {
    gatewayNames.value = []
    routes.value = []
    ElMessage.warning(texts.value.loadGatewayFailed)
  }
}

async function loadRoutes() {
  if (!gatewayName.value) {
    routes.value = []
    return
  }
  loading.value = true
  try {
    const names = (await Api.getConfigItemRouteNames(gatewayName.value)).data
    const loaded = await Promise.all(names.map(async (name) => (await Api.getConfigItemRoute(gatewayName.value!, name)).data))
    routes.value = loaded.filter((item): item is Model.SgRoute => item != null)
  } catch {
    routes.value = []
    ElMessage.warning(texts.value.loadRouteFailed)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  originalRouteName.value = ''
  formModel.value = newRoute()
  drawerOpen.value = true
}

function openEdit(item: Model.SgRoute) {
  drawerMode.value = 'edit'
  originalRouteName.value = item.route_name
  formModel.value = cloneJson(item)
  drawerOpen.value = true
}

function openCopy(item: Model.SgRoute) {
  drawerMode.value = 'create'
  originalRouteName.value = ''
  formModel.value = cloneJson(item)
  formModel.value.route_name = `${item.route_name}-copy`
  drawerOpen.value = true
}

async function save() {
  if (!gatewayName.value) return
  if (!formModel.value.route_name.trim()) {
    ElMessage.warning(texts.value.missingRouteName)
    return
  }
  saving.value = true
  try {
    if (drawerMode.value === 'create') {
      await Api.postConfigItemRoute(gatewayName.value, formModel.value.route_name, formModel.value)
    } else if (originalRouteName.value !== formModel.value.route_name) {
      await Api.renameConfigItemRoute(gatewayName.value, originalRouteName.value, formModel.value)
    } else {
      await Api.putConfigItemRoute(gatewayName.value, originalRouteName.value || formModel.value.route_name, formModel.value)
    }
    ElMessage.success(texts.value.routeSaved)
    drawerOpen.value = false
    await loadRoutes()
  } catch {
    ElMessage.error(texts.value.routeSaveFailed)
  } finally {
    saving.value = false
  }
}

async function remove(item: Model.SgRoute) {
  if (!gatewayName.value) return
  try {
    await ElMessageBox.confirm(texts.value.confirmDelete(item.route_name), texts.value.deleteTitle, {
      confirmButtonClass: 'el-button--danger',
    })
    await Api.deleteConfigItemRoute(gatewayName.value, item.route_name)
    ElMessage.success(texts.value.routeDeleted)
    await loadRoutes()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(texts.value.routeDeleteFailed)
  }
}

watch(gatewayName, loadRoutes)

onMounted(async () => {
  await loadGatewayNames()
  await loadRoutes()
})
</script>

<template>
  <div class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" :disabled="!gatewayName" @click="openCreate">{{ texts.create }}</el-button>
      </div>
    </div>

    <section class="panel">
      <div class="table-toolbar">
        <el-input v-model="search" clearable :placeholder="texts.search" />
      </div>
      <el-table v-loading="loading" :data="filteredRoutes" row-key="route_name">
        <el-table-column prop="route_name" :label="texts.routeName" min-width="180" />
        <el-table-column :label="texts.routeType" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="routeTypeLabel(routeTableRow(row)) === 'MCPRoute' ? 'success' : 'info'">{{ routeTypeLabel(routeTableRow(row)) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="texts.hostname" min-width="180">
          <template #default="{ row }">{{ hostnameSummary(routeTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.match" min-width="180">
          <template #default="{ row }">{{ routeMatchSummary(routeTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.backend" min-width="220">
          <template #default="{ row }">{{ backendSummary(routeTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.priority" width="100">
          <template #default="{ row }">{{ routePriority(row) }}</template>
        </el-table-column>
        <el-table-column :label="texts.plugins" width="90">
          <template #default="{ row }">{{ pluginCount(routeTableRow(row).plugins) }}</template>
        </el-table-column>
        <el-table-column :label="texts.operation" width="230" fixed="right">
          <template #default="{ row }">
            <ActionBar>
              <el-button :icon="Edit" type="primary" link @click="openEdit(routeTableRow(row))">{{ texts.edit }}</el-button>
              <el-button :icon="CopyDocument" link @click="openCopy(routeTableRow(row))">{{ texts.copy }}</el-button>
              <el-button :icon="Delete" type="danger" link @click="remove(routeTableRow(row))">{{ texts.delete }}</el-button>
            </ActionBar>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="texts.emptyTitle">
            <el-button type="primary" :icon="Plus" :disabled="!gatewayName" @click="openCreate">{{ texts.create }}</el-button>
          </el-empty>
        </template>
      </el-table>
    </section>

    <RouteEditorDrawer
      v-model:open="drawerOpen"
      v-model="formModel"
      :mode="drawerMode"
      :gateway-name="gatewayName"
      :saving="saving"
      @save="save"
    />
  </div>
</template>
