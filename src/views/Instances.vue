<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Api } from 'spacegate-admin-client'
import { CopyDocument, Refresh, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ActionBar from '../components/ActionBar.vue'

type InstanceRow = {
  id: string
  healthy?: boolean
}

const loading = ref(false)
const { locale } = useI18n()
const actionLoading = ref('')
const instances = ref<InstanceRow[]>([])
const gatewayNames = ref<string[]>([])
const selectedGateway = ref('')
const texts = computed(() => locale.value.startsWith('zh') ? {
  loadFailed: '实例状态加载失败，请确认 admin-server 已启动',
  online: '在线',
  offline: '离线',
  unknown: '未知',
  globalReloadSuccess: (id: string) => `实例 ${id} 已触发全局重载`,
  globalReloadFailed: (id: string) => `实例 ${id} 全局重载失败`,
  selectGateway: '请选择网关',
  gatewayReloadSuccess: (id: string) => `实例 ${id} 已触发网关重载`,
  gatewayReloadFailed: (id: string) => `实例 ${id} 网关重载失败`,
  title: '实例运维',
  subtitle: '查看 SpaceGate 控制 API 健康状态，并触发配置重载。',
  gatewayPlaceholder: '选择网关',
  refresh: '刷新',
  instanceId: '实例 ID',
  controlApi: '控制 API',
  health: '健康状态',
  operation: '操作',
  gatewayReload: '网关重载',
  globalReload: '全局重载',
  emptyTitle: '暂无实例',
  emptyDesc: '启动 spacegate 网关后，实例将自动注册到 admin-server。',
  copied: (id: string) => `已复制 ${id}`,
  reloadFor: '用于网关重载',
} : {
  loadFailed: 'Instance status failed to load. Check that admin-server is running.',
  online: 'Online',
  offline: 'Offline',
  unknown: 'Unknown',
  globalReloadSuccess: (id: string) => `Global reload triggered for instance ${id}.`,
  globalReloadFailed: (id: string) => `Global reload failed for instance ${id}.`,
  selectGateway: 'Select a gateway.',
  gatewayReloadSuccess: (id: string) => `Gateway reload triggered for instance ${id}.`,
  gatewayReloadFailed: (id: string) => `Gateway reload failed for instance ${id}.`,
  title: 'Instance Operations',
  subtitle: 'Check SpaceGate control API health and trigger config reloads.',
  gatewayPlaceholder: 'Select Gateway',
  refresh: 'Refresh',
  instanceId: 'Instance ID',
  controlApi: 'Control API',
  health: 'Health',
  operation: 'Actions',
  gatewayReload: 'Gateway Reload',
  globalReload: 'Global Reload',
  emptyTitle: 'No instances yet',
  emptyDesc: 'Start the spacegate gateway and instances will auto-register with admin-server.',
  copied: (id: string) => `Copied ${id}`,
  reloadFor: 'For gateway reload',
})

async function load() {
  loading.value = true
  try {
    gatewayNames.value = (await Api.getConfigNames()).data
    if (!selectedGateway.value && gatewayNames.value[0]) selectedGateway.value = gatewayNames.value[0]
    const ids = (await Api.discoveryInstanceList()).data
    const health = (await Api.discoveryInstanceHealth()).data
    instances.value = ids.map((id) => ({ id, healthy: health[id] }))
  } catch {
    gatewayNames.value = []
    instances.value = []
    ElMessage.warning(texts.value.loadFailed)
  } finally {
    loading.value = false
  }
}

function statusType(status?: boolean) {
  if (status === true) return 'success'
  if (status === false) return 'danger'
  return 'info'
}

function statusText(status?: boolean) {
  if (status === true) return texts.value.online
  if (status === false) return texts.value.offline
  return texts.value.unknown
}

async function reloadGlobal(instance: InstanceRow) {
  actionLoading.value = `global:${instance.id}`
  try {
    await Api.getClient().axiosInstance.post('/discovery/instance/reload/global', undefined, {
      params: { instance: instance.id },
    })
    ElMessage.success(texts.value.globalReloadSuccess(instance.id))
  } catch {
    ElMessage.error(texts.value.globalReloadFailed(instance.id))
  } finally {
    actionLoading.value = ''
  }
}

async function reloadGateway(instance: InstanceRow) {
  if (!selectedGateway.value) {
    ElMessage.warning(texts.value.selectGateway)
    return
  }
  actionLoading.value = `gateway:${instance.id}`
  try {
    await Api.getClient().axiosInstance.post('/discovery/instance/reload/gateway', undefined, {
      params: {
        instance: instance.id,
        gateway: selectedGateway.value,
      },
    })
    ElMessage.success(texts.value.gatewayReloadSuccess(instance.id))
  } catch {
    ElMessage.error(texts.value.gatewayReloadFailed(instance.id))
  } finally {
    actionLoading.value = ''
  }
}

async function copyId(id: string) {
  try {
    await navigator.clipboard.writeText(id)
    ElMessage.success(texts.value.copied(id))
  } catch {
    // silent
  }
}

// Element Plus exposes table slots as DefaultRow; restore the declared :data element type at the slot boundary.
function instanceTableRow(row: unknown): InstanceRow {
  return row as InstanceRow
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
      <div class="page-actions">
        <div class="sg-console__selector">
          <span class="sg-console__selector-label">{{ texts.reloadFor }}</span>
          <el-select v-model="selectedGateway" class="page-gateway-select" :placeholder="texts.gatewayPlaceholder" style="width: 280px;">
            <el-option v-for="name in gatewayNames" :key="name" :label="name" :value="name" />
          </el-select>
        </div>
        <el-button :icon="Refresh" @click="load">{{ texts.refresh }}</el-button>
      </div>
    </div>

    <section class="panel">
      <el-table v-loading="loading" :data="instances" row-key="id">
        <el-table-column :label="texts.instanceId" min-width="220">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px;">
              <code>{{ instanceTableRow(row).id }}</code>
              <el-button :icon="CopyDocument" text size="small" @click="copyId(instanceTableRow(row).id)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="texts.controlApi" min-width="180">
          <template #default="{ row }">
            <code>http://{{ instanceTableRow(row).id }}</code>
          </template>
        </el-table-column>
        <el-table-column :label="texts.health" width="140">
          <template #default="{ row }">
            <el-tag :type="statusType(instanceTableRow(row).healthy)">{{ statusText(instanceTableRow(row).healthy) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="texts.operation" width="240" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <ActionBar class="instance-reload-actions">
              <el-button
                :icon="Switch"
                type="warning"
                size="small"
                :loading="actionLoading === `gateway:${instanceTableRow(row).id}`"
                @click="reloadGateway(instanceTableRow(row))"
              >
                {{ texts.gatewayReload }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                :loading="actionLoading === `global:${instanceTableRow(row).id}`"
                @click="reloadGlobal(instanceTableRow(row))"
              >
                {{ texts.globalReload }}
              </el-button>
            </ActionBar>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="texts.emptyTitle" />
        </template>
      </el-table>
    </section>
  </div>
</template>
