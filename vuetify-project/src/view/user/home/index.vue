<template>
    <v-card>
        <v-card-title>我的视频</v-card-title>
        <videoList :video-list="videos"/>
    </v-card>
    <v-pagination
        v-model="pageInfo.currentPage"
        :length="pageInfo.pages"
        @update:model-value="getMyVideos"
        class="mt-4"
     ></v-pagination>
</template>

<script setup>

import { apiGetUserVideoById, apiGetVideoByUser } from '@/api/video'
import { useUserStore } from '@/store/index'
import { onMounted, ref, watch } from 'vue'
import videoList from '@/components/videoList/index.vue'

const videos = ref([])
const useStore = useUserStore()
const pageInfo = ref({
    currentPage: 1,
    size: 5,
    total: 0,
    pages: 5
})
const getMyVideos = async() =>{
    try{
        const res = await apiGetUserVideoById(useStore.$state.lookId, pageInfo.value.currentPage)
        videos.value = res.data.data.records
        pageInfo.value.total = res.data.data.total
        pageInfo.value.pages = res.data.data.pages
    } catch (error) {
        console.error(error)
    }
}

onMounted(() => {
    getMyVideos()
})

watch(() => pageInfo.value.currentPage, ()=>{
    getMyVideos()
}, {immediate: true})
</script>

<style>
</style>