<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Api, Model } from 'spacegate-admin-client'
import { Check, Delete, Edit, Plus, Refresh, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GatewayForm } from '@components/config'
import ActionBar from '../components/ActionBar.vue'
import { cloneJson, listenerSummary, pluginCount } from './console-utils'

const router = useRouter()
const { locale } = useI18n()

const loading = ref(false)
const drawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const gateways = ref<Model.SgGateway[]>([])
const routeCounts = ref<Record<string, number>>({})
const formModel = ref<Model.SgGateway>(newGateway())
const texts = computed(() => locale.value.startsWith('zh') ? {
  loadFailed: '网关列表加载失败，请确认 admin-server 已启动',
  missingName: '请输入网关名称',
  saved: '网关已保存',
  saveFailed: '网关保存失败',
  confirmDelete: (name: string) => `确认删除网关 ${name}？`,
  deleteTitle: '删除网关',
  deleted: '网关已删除',
  deleteFailed: '网关删除失败',
  title: '网关管理',
  subtitle: '管理网关、监听端口、协议、网关级插件和运行参数。',
  refresh: '刷新',
  create: '新建网关',
  name: '名称',
  listeners: '监听',
  plugins: '插件',
  operation: '操作',
  routes: '路由',
  emptyTitle: '暂无网关',
  emptyDesc: '点击右上角“新建网关”开始配置。',
  deleteImpact: (count: number) => count > 0 ? `\n该网关下有 ${count} 条路由，将一并删除且不可恢复。` : '',
  edit: '编辑',
  delete: '删除',
  createTitle: '新建网关',
  editTitle: '编辑网关',
  cancel: '取消',
  save: '保存',
  unsavedChanges: '有未保存的修改，确认放弃并关闭？',
} : {
  loadFailed: 'Gateway list failed to load. Check that admin-server is running.',
  missingName: 'Enter a gateway name.',
  saved: 'Gateway saved.',
  saveFailed: 'Gateway save failed.',
  confirmDelete: (name: string) => `Delete gateway ${name}?`,
  deleteTitle: 'Delete Gateway',
  deleted: 'Gateway deleted.',
  deleteFailed: 'Gateway delete failed.',
  title: 'Gateway Management',
  subtitle: 'Manage gateways, listener ports, protocols, gateway-level plugins, and runtime parameters.',
  refresh: 'Refresh',
  create: 'Create Gateway',
  name: 'Name',
  listeners: 'Listeners',
  plugins: 'Plugins',
  operation: 'Actions',
  routes: 'Routes',
  emptyTitle: 'No gateways yet',
  emptyDesc: 'Click “Create Gateway” in the top right to get started.',
  deleteImpact: (count: number) => count > 0 ? `\nThis gateway has ${count} route(s) that will also be deleted permanently.` : '',
  edit: 'Edit',
  delete: 'Delete',
  createTitle: 'Create Gateway',
  editTitle: 'Edit Gateway',
  cancel: 'Cancel',
  save: 'Save',
  unsavedChanges: 'You have unsaved changes. Discard and close?',
})

function newGateway(): Model.SgGateway {
  return {
    name: 'new-gateway',
    parameters: {
      redis_url: null,
      redis_pool_max_size: null,
      redis_pool_wait_timeout_ms: null,
      redis_pool_create_timeout_ms: null,
      redis_pool_recycle_timeout_ms: null,
      log_level: null,
      lang: null,
      enable_x_request_id: false,
      ignore_tls_verification: null,
      observability: {
        enabled: false,
        service_name: 'spacegate',
        otlp_endpoint: 'http://localhost:4317',
        protocol: 'grpc',
        traces: { enabled: false, sample_ratio: 1 },
        metrics: { enabled: false, export_interval_ms: 60000 as unknown as bigint },
        logs: { enabled: false, level: 'info' },
      },
    },
    listeners: [
      {
        name: 'http',
        ip: null,
        port: 9000,
        protocol: { type: 'http' },
        hostname: null,
      },
    ],
    plugins: [],
  }
}

async function load() {
  loading.value = true
  try {
    const names = (await Api.getConfigNames()).data
    const loaded = await Promise.all(names.map(async (name) => (await Api.getConfigItemGateway(name)).data))
    gateways.value = loaded.filter((item): item is Model.SgGateway => item != null)
    const counts: Record<string, number> = {}
    await Promise.all(names.map(async (name) => {
      try { counts[name] = (await Api.getConfigItemRouteNames(name)).data.length } catch { counts[name] = 0 }
    }))
    routeCounts.value = counts
  } catch {
    gateways.value = []
    routeCounts.value = {}
    ElMessage.warning(texts.value.loadFailed)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = newGateway()
  drawerOpen.value = true
  nextTick(() => { formSnapshot = JSON.stringify(formModel.value); isDirty.value = false })
}

function openEdit(gateway: Model.SgGateway) {
  drawerMode.value = 'edit'
  formModel.value = cloneJson(gateway)
  drawerOpen.value = true
  nextTick(() => { formSnapshot = JSON.stringify(formModel.value); isDirty.value = false })
}

async function save() {
  if (!formModel.value.name?.trim()) {
    ElMessage.warning(texts.value.missingName)
    return
  }
  try {
    if (drawerMode.value === 'create') {
      await Api.postConfigItemGateway(formModel.value.name, formModel.value)
    } else {
      await Api.putConfigItemGateway(formModel.value.name, formModel.value)
    }
    ElMessage.success(texts.value.saved)
    drawerOpen.value = false
    await load()
  } catch {
    ElMessage.error(texts.value.saveFailed)
  }
}

async function remove(gateway: Model.SgGateway) {
  try {
    const count = routeCounts.value[gateway.name] ?? 0
    const message = texts.value.confirmDelete(gateway.name) + texts.value.deleteImpact(count)
    await ElMessageBox.confirm(message, texts.value.deleteTitle, {
      confirmButtonClass: 'el-button--danger',
    })
    await Api.deleteConfigItemGateway(gateway.name)
    ElMessage.success(texts.value.deleted)
    await load()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(texts.value.deleteFailed)
  }
}

function viewRoutes(gateway: Model.SgGateway) {
  router.push({ path: '/routes', query: { gatewayName: gateway.name } })
}

onMounted(load)

let formSnapshot = ''
const isDirty = ref(false)

watch(formModel, () => {
  if (!drawerOpen.value) return
  isDirty.value = JSON.stringify(formModel.value) !== formSnapshot
}, { deep: true })

function handleDrawerClose(done: () => void) {
  if (!isDirty.value) { done(); return }
  ElMessageBox.confirm(texts.value.unsavedChanges, '', {
    confirmButtonText: locale.value.startsWith('zh') ? '确认' : 'Confirm',
    cancelButtonText: locale.value.startsWith('zh') ? '取消' : 'Cancel',
  }).then(() => { isDirty.value = false; done() }).catch(() => {})
}

// Element Plus exposes table slots as DefaultRow; restore the declared :data element type at the slot boundary.
function gatewayTableRow(row: unknown): Model.SgGateway {
  return row as Model.SgGateway
}
</script>

<template>
  <div class="console-page">
    <div class="page-heading">
      <div>
        <h1>{{ texts.title }}</h1>
        <p>{{ texts.subtitle }}</p>
      </div>
      <div class="page-actions">
        <el-button :icon="Refresh" @click="load">{{ texts.refresh }}</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">{{ texts.create }}</el-button>
      </div>
    </div>

    <section class="panel">
      <el-table v-loading="loading" :data="gateways" row-key="name">
        <el-table-column prop="name" :label="texts.name" min-width="180" />
        <el-table-column :label="texts.listeners" min-width="260">
          <template #default="{ row }">{{ listenerSummary(gatewayTableRow(row)) }}</template>
        </el-table-column>
        <el-table-column :label="texts.routes" width="100">
          <template #default="{ row }">{{ routeCounts[gatewayTableRow(row).name] ?? '-' }}</template>
        </el-table-column>
        <el-table-column :label="texts.plugins" width="100">
          <template #default="{ row }">{{ pluginCount(gatewayTableRow(row).plugins) }}</template>
        </el-table-column>
        <el-table-column label="Redis" min-width="180">
          <template #default="{ row }">{{ gatewayTableRow(row).parameters?.redis_url || '-' }}</template>
        </el-table-column>
        <el-table-column :label="texts.operation" width="220" fixed="right">
          <template #default="{ row }">
            <ActionBar>
              <el-button :icon="View" link @click="viewRoutes(gatewayTableRow(row))">{{ texts.routes }}</el-button>
              <el-button :icon="Edit" type="primary" link @click="openEdit(gatewayTableRow(row))">{{ texts.edit }}</el-button>
              <el-button :icon="Delete" type="danger" link @click="remove(gatewayTableRow(row))">{{ texts.delete }}</el-button>
            </ActionBar>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="texts.emptyTitle">
            <el-button type="primary" :icon="Plus" @click="openCreate">{{ texts.create }}</el-button>
          </el-empty>
        </template>
      </el-table>
    </section>

    <el-drawer v-model="drawerOpen" :size="'72%'" destroy-on-close :before-close="handleDrawerClose">
      <template #header>
        <div class="drawer-title">
          <span>{{ drawerMode === 'create' ? texts.createTitle : texts.editTitle }}</span>
          <el-tag>{{ formModel.name }}</el-tag>
        </div>
      </template>
      <GatewayForm v-model="formModel" :mode="drawerMode" />
      <template #footer>
        <el-button @click="drawerOpen = false">{{ texts.cancel }}</el-button>
        <el-button type="primary" :icon="Check" @click="save">{{ texts.save }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>
