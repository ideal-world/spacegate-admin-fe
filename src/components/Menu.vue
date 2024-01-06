<template>
    <el-menu :collapse="props.collapse" :default-active="pageIndex">
        <el-menu-item-group>
            <template slot="title">{{ t('common.setting') }}</template>
            <el-menu-item v-for="page, index in props.pages" :index="index.toString()" @click="() => {
                emits('toPage', page.path)
            }">
                <el-icon>
                    <component :is="page.icon" />
                </el-icon>
                <span v-if="!props.collapse">
                    {{ t(page.name) }}
                </span>
            </el-menu-item>
        </el-menu-item-group>
    </el-menu>
</template>
f
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
const router = useRouter()

const { t } = useI18n()
const props = defineProps<{
    pages: {
        name: string
        path: string
        icon: unknown
    }[],
    currentPage: string,
    collapse: boolean
}>()
const pageIndex = computed(
    () => {
        const index = props.pages.findIndex(p => p.path === router.currentRoute.value.path);
        if (index === -1) {
            return '0'
        } else {
            return index.toString()
        }
    }
)
const emits = defineEmits<{
    toPage: [path: string]
}>()
</script>