<template>
<v-card>
    <v-card-title>全部分类</v-card-title>
    <v-card-subtitle>所有的分类</v-card-subtitle>
    <v-chip-group>
        <v-chip v-for="(item,index) in classifies" :key="item.id" @click="closeEvent(item, true)" append-icon="mdi-plus-circle">
            {{  item.name }}
        </v-chip>
    </v-chip-group>
</v-card>
</template>

<script setup>
const props = defineProps({
    classifies:{
        type: Array,
        default: () => []
    },
    closeEvent: {
        type: Function,
        default: () => {}
    }
})
</script>

<style>
</style>