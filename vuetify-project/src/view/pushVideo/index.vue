<template>
    <v-card style="height: 100%;" elevation="2" color="background">
        <Video :video-list="videoList" :hide-close="true" :next-video="nextVideo" v-if="videoList.length > 0"></Video>
    </v-card>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { apiVideoByPush } from '@/api/video.js'
import Video from '@/components/video/index.vue'
const videoList = ref([])
const nextVideo = (index) => {
    if ((videoList.value.length - index) <= 3) {
        getVideo()
    }
}
const getVideo = () => {
    apiVideoByPush().then(({ data }) => {
        if (!data.state) {
            return
        }
        videoList.value = videoList.value.concat(data.data)
    })
}
onMounted(() => {
    getVideo()
})
</script>