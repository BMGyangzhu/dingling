<template>
    <VideoList :video-list="videoList"/>
</template>

<script setup>
import { apiGetVideoById, apiSearchVideo, apiVideoByClassfiy } from '@/api/video';
import { onMounted, ref, watch, onUpdated } from 'vue';
import { useRoute } from 'vue-router'
import VideoList from '@/components/videoList/index.vue'

const route = useRoute()
const classify = ref(route.params.classify)
const currentClassify = ref([])
const props = defineProps({
    type: {
        type: String,
        default: ""
    },

})
const videoList = ref([])
const pageInfo = ref({
  page: 1,
  limit: 15
})
const getSearchVideo = () => {
  apiSearchVideo(route.params.key, pageInfo.value.page, pageInfo.value.limit).then(({ data }) => {
    if (!data.state) {
      return;
    }
    videoList.value = videoList.value.concat(data.data.records)
  })
}
const getVideoByType = async(type) => {
  try {
    const res = await apiVideoByClassfiy(type)
    videoList.value = res.data.data
  } catch (error) {
    console.error(error)
  }
}
const initView = () => {
  videoList.value = []
  pageInfo.value.page = 1

  if (route.meta.isClassify) {
    currentClassify.value = route.params.classify
    getVideoByType(route.params.classify)
  } else if (route.meta.isSearch) {
    currentClassify.value = -1
    getSearchVideo()
  }
}

// 初次挂载执行一次
onMounted(() => {
  initView()
})

// 监听 route.params.classify 变化
watch(
  () => route.params.classify,
  (newClassify, oldClassify) => {
    if (newClassify !== oldClassify) {
      initView()
    }
  }
)
</script>

<style>
</style>