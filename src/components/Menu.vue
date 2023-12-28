<template>
    <el-menu :collapse="props.collapse" default-active="1">
        <el-menu-item-group>
            <template slot="title">{{ t('common.setting') }}</template>
            <el-menu-item v-for="page, index in props.pages" :index="index.toString()" @click="emits('toPage', page.path)">
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
import { useI18n } from 'vue-i18n'
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

const emits = defineEmits<{
    toPage: [path: string]
}>()
</script>