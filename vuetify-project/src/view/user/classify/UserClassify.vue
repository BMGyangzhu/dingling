<template>
<v-card>
    <v-card-title>订阅分类</v-card-title>
    <v-card-subtitle>您订阅的分类</v-card-subtitle>
    <v-chip-group>
        <v-chip v-for="(item, index) in classifies" :key="item.id" closable @click:close="closeEvent(index)">
            {{ item.name }} 
        </v-chip>
    </v-chip-group>
</v-card>
</template>

<script setup>
const props = defineProps({
    classifies: {
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