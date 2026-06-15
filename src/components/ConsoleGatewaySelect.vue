<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Api } from 'spacegate-admin-client'
import { Refresh, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const router = useRouter()
const { locale } = useI18n()
const loading = ref(false)
const options = ref<string[]>([])
const texts = computed(() => locale.value.startsWith('zh') ? {
  loadFailed: '网关列表加载失败',
  placeholder: '选择网关',
  empty: '暂无网关',
  create: '去创建',
  refresh: '刷新网关',
  manage: '网关管理',
} : {
  loadFailed: 'Gateway list failed to load.',
  placeholder: 'Select Gateway',
  empty: 'No gateways',
  create: 'Create',
  refresh: 'Refresh Gateways',
  manage: 'Gateway Management',
})

async function load() {
  loading.value = true
  try {
    options.value = (await Api.getConfigNames()).data
    if (!props.modelValue && options.value[0]) emit('update:modelValue', options.value[0])
  } catch {
    options.value = []
    ElMessage.warning(texts.value.loadFailed)
  } finally {
    loading.value = false
  }
}

function manageGateway() {
  router.push({ path: '/gateways', query: props.modelValue ? { gatewayName: props.modelValue } : {} })
}

watch(() => props.modelValue, () => {
  if (!props.modelValue && options.value[0]) emit('update:modelValue', options.value[0])
})

onMounted(load)
</script>

<template>
  <div class="console-gateway-select">
    <el-select
      :model-value="modelValue"
      :loading="loading"
      filterable
      class="console-gateway-select__input"
      :placeholder="texts.placeholder"
      @update:model-value="(value) => emit('update:modelValue', value || undefined)"
    >
      <el-option v-for="name in options" :key="name" :label="name" :value="name" />
      <template #empty>
        <div class="console-gateway-select__empty">
          <span>{{ texts.empty }}</span>
          <el-button link type="primary" @click.stop="manageGateway">{{ texts.create }}</el-button>
        </div>
      </template>
    </el-select>
    <el-tooltip :content="texts.refresh">
      <el-button :icon="Refresh" circle text :loading="loading" @click="load" />
    </el-tooltip>
    <el-tooltip :content="texts.manage">
      <el-button :icon="Setting" circle text @click="manageGateway" />
    </el-tooltip>
  </div>
</template>
