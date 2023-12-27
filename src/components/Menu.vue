<template>
    <el-menu :collapse="props.collapse" default-active="1">
        <el-menu-item v-for="page, index in props.pages" :index="index.toString()" @click="emits('toPage', page.path)">
            {{ page.name }}
        </el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">

const props = defineProps<{
    pages: {
        name: string
        path: string
    }[],
    currentPage: string,
    collapse: boolean
}>()

const emits = defineEmits<{
    toPage: [path: string]
}>()
</script>