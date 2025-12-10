<template>
    <v-card>
            <v-tabs color="success" v-model="tab">
                <v-tab value="one">上传稿件</v-tab>
                <v-tab value="two">稿件管理</v-tab>
            </v-tabs>

            <v-divider></v-divider>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                    <uploadVideo />
                </v-tabs-window-item>

                <v-tabs-window-item value="two">
                    <list />
                </v-tabs-window-item>
            </v-tabs-window>
    </v-card>
</template>

<script setup>
import uploadVideo from './uploadVideo.vue'
import list from './videoList.vue'
import { ref } from 'vue'
const tab = ref(null)
</script>

<style>
</style>