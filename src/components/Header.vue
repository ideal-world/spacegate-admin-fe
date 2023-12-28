<template>
    <div class="flex flex-grow justify-start align-center items-center">
        <slot name="left"></slot>
    </div>
    <div class="flex justify-end align-center items-center space-x-2">
        <slot name="right"></slot>
    </div>
</template>