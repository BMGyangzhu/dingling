<template>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px; padding: 0 20px; ">
        <div v-for="item in props.videoList" :key="item.id"
            style="flex: 1 1 260px;  max-width: 260px; height: 320px; min-height: 320px;">
            <v-card style="width: 100%; height: 100%;display: flex; flex-direction: column;" hover ripple>
                <v-img :src="apiFileGet(item.cover)" cover style="position: relative" @click="playVideo(item)">
                    <template #default>
                        <div style="
                                    position: absolute;
                                    bottom: 0;
                                    left: 0;
                                    right: 0;
                                    display: flex;
                                    justify-content: space-between;
                                    color: white;
                        ">

                            <div style="
                                    display: flex;
                                    align-items: center;    
                                    font-weight: bolder;
                                    padding: 5px 10px;
                                    margin: 5px;
                                    text-align: center;
                                    color: white;
                                ">
                                <v-icon small style="margin-right: 4px;">mdi-heart</v-icon>
                                {{ item.startCount }} 点赞
                            </div>
                            <div
                                style=" font-weight: bolder; padding: 5px 10px; margin:5px; border-radius: 2px; background: rgba(0, 0, 0, 0.4); ">
                                {{ item.duration }}</div>
                        </div>
                    </template>
                </v-img>

                <v-card-actions style="display: flex; justify-content: space-between">
                    <div>
                        <span>{{ item.title }}</span>
                    </div>


                    <v-card  :variant="'tonal'" style="text-align: center; padding:3px; font-weight: bolder;">
                        <span>@{{item.user.nickName }}</span></v-card>
                </v-card-actions>

            </v-card>


        </div>

        <v-dialog v-model="videoDialog" fullscreen transition="dialog-bottom-transition" >
            <v-card>
                <!--                     
                             <Video
                                v-if="videoDialog && currentVideo"
                                :key="currentVideo.id"
                                :video="currentVideo"
                                :close-video="() => playVideo(null)"
                            /> -->
                <Video v-if="videoDialog && currentVideo" :key="currentVideo?.id" :video="currentVideo"
                    :close-video="() => playVideo(null)" />
            </v-card>
        </v-dialog>
    </div>

</template>

<script setup>
import { ref, nextTick } from 'vue'
import { apiFileGet } from '@/api/file'
import Video from '../video/index.vue'
const props = defineProps({
    videoList: {
        type: Array,
        default: () => []
    }
})
const currentVideo = ref(null)
const videoDialog = ref(false)

const playVideo = async (video) => {
    document.documentElement.style.overflowY = video ? 'hidden' : ''

    if (!video) {
        videoDialog.value = false
        return
    }

    videoDialog.value = false
    await nextTick()

    currentVideo.value = video
    videoDialog.value = true
}



</script>

<style></style>