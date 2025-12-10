<template>
    <UserClassify :classifies="userClassifies" :close-event="subscribe"/>
    <v-divider></v-divider>
    <AllClassify :classifies="allClassifies" :close-event="subscribe" />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import AllClassify from './allClassify.vue'
import UserClassify from './UserClassify.vue';
import { apiGetClassifyByUser, apiClassifyGetAll, apiClassifySubscribe, apiGetNoSubscribe} from '@/api/classify';
const userClassifies = ref([])
const allClassifies = ref([])


const refreshData = ()=> {
    nextTick(()=>{
        apiGetClassifyByUser().then(({data}) => {
            if (!data.state) {
                userClassifies.value = []
                return
            }
            userClassifies.value = data.data
        })
        apiGetNoSubscribe().then(({ data }) => {
            if (!data.state) {
                allClassifies.value = []
                return
            }
            allClassifies.value = data.data
        })
    })
}

const subscribe = (id, isSubscribe=false) => {
    if(isSubscribe) {
        userClassifies.value.push(id)
    } else {
        userClassifies.value.splice(id, 1)
    }
    apiClassifySubscribe(userClassifies.value.map(e => e.id)).then(({data}) => {
        if(data.state) {    
            refreshData()
        }
    })
}

onMounted(() => {
    refreshData()
})
</script>

<style>
</style>