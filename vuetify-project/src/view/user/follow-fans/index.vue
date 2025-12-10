<template>
<v-card>
    <v-card-title class="float-left">{{ currentType == 'fans' ? '粉丝' : '关注' }}</v-card-title>
  <v-tabs color="primary" align-tabs="end" v-model="currentType">
    <v-tab value="follows">关注</v-tab>
    <v-tab value="fans">粉丝</v-tab>
  </v-tabs>


  <v-list>
    <v-list-item  :to="`/user?lookId=${item.id}`" v-for="item in currentItems" :key="item.id" :title="item.nickName" :subtitle="item.description || '这个人很懒，没有任何描述'">
        <template v-slot:prepend>
            <v-avatar :image="item.avatar?apiFileGet(item.avatar) : '/logo.png'" :color="item.sex ? 'blue' : 'pink'">
                <v-icon color="white">{{ item.sex ? 'mdi-human-male' : 'mdi-human-female' }}</v-icon>
            </v-avatar>
        </template>

        <template v-slot:append>
            <v-btn @click.stop color="grey-lighten-1" variant="text" @click="unLikeOrLike(item.id)">
                {{  currentType == 'fans' ? item.each?'取消关注': '互相关注' : '取消关注'}}
            </v-btn>
        </template>
    </v-list-item>
  </v-list>

  <v-card v-if="currentItems.length == 0" height="300px" class="ma-4" :variant="tonal"
    style="text-align: center; line-height: 300px;">
        好像没有什么内容捏
  </v-card>
  
  <v-pagination v-else-if="pageInfo.pages > 1"
        v-model="pageInfo.page"
        :length="pageInfo.pages"
    ></v-pagination>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
        {{  snackbar.text }}

        <template v-slot:actions>
            <v-btn color="blue" variant="text" @click="snackbar.show = false">
                了解
            </v-btn>
        </template>
    </v-snackbar>
  
</v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiGetLike, apiFollows } from '@/api/user/like';
import { useUserStore } from '@/store';
import { apiFileGet } from '@/api/file';

const userStore = useUserStore()
const currentItems = ref([])
const currentType = ref("fans")
const snackbar = ref({
    show: false,
    text: ""
})
const pageInfo = ref({
    page: 1,
    pages: 0
})

const getLike = async() => {
    try{
        currentItems.value = []
        const res = await apiGetLike(currentType.value, userStore.info.id, pageInfo.value.page)
        // if (!res.data.data.state) return
        currentItems.value = res.data.data.records
    } catch(error) {
        console.error(error)
    }
}

const unLikeOrLike = async(id) =>{
    try{
        const res = await apiFollows(id)
        snackbar.value = {
            text: res.data.message,
            show: true
        }
        if (!data.state) return
        getLike()
    } catch(error) {
        console.error(error)
    }
}

watch( () => pageInfo.value.page, ()=>{
    getLike()
}, {immediate: true})


</script>

<style scoped>
.custom-active {
    background-color: white !important; /* 浅蓝色 */
    color: #1976d2 !important; /* 主色蓝色 */
}
</style>