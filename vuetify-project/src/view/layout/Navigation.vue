<template>
  <v-navigation-drawer v-model="drawer" permanent>
     <v-list v-if="userStore.token">
      <v-list-item :prepend-avatar="userStore.info.avatar?apiFileGet(userStore.info.avatar):'/logo.png'" :title="userStore.info.nickName"
        :subtitle="userStore.info.description"></v-list-item>
    </v-list>
     <v-list v-else>
      <v-list-item prepend-icon="mdi-account" title="未登录" subtitle="请先登录，享受更多服务"></v-list-item>
    </v-list>


    <v-list density="compact" nav>
      <v-divider></v-divider>

      <v-list-item prepend-icon="mdi-video" link title="推荐视频" to="/pushVideo" ></v-list-item>
      <!-- <v-list-item prepend-icon="mdi-home"  title="首页" to="/"></v-list-item> -->
      <v-list-item prepend-icon="mdi-account-star" title="个人中心" to="/user" v-if="userStore.token"></v-list-item>
      <v-list-item prepend-icon="mdi-heart" title="关注的人" to="/followVideo" v-if="userStore.token"></v-list-item>
      <v-list-item prepend-icon="mdi-message" title="我的私信" to="/message-center" v-if="userStore.token"></v-list-item>
      <v-list-item :prepend-icon="item.icon && item.icon.trim() !== '' ? item.icon : 'mdi-video'" v-for="item in types" :title="item.name" :to="`/video/${item.id}`"></v-list-item>

      
        
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { apiFileGet } from '@/api/file.js'
import { useUserStore } from '@/store/index'
import { apiClassifyGetAll } from '@/api/classify'
import { onMounted, ref, computed} from 'vue'

const userStore = useUserStore()
const types = ref([])

const props = defineProps({
  drawer: Boolean
})
const emit = defineEmits(['update:drawer'])


const drawer = computed({
  get: () => props.drawer,
  set: (val) => emit('update:drawer', val)
})
const getAllClassify = async() => {
  try{
    const res = await apiClassifyGetAll()
    types.value = res.data.data
  } catch (error) {
    console.error(error)
  }
    
}

onMounted( () => {
  getAllClassify()
})


</script>
