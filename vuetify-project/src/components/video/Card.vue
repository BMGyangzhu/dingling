<template>
    <v-card ref="cardRef" elevation="4"  rounded="xl" style="display: flex; justify-content: space-between;flex-direction: column; " 
    :class="{ 'video-card': true, 'is-current': props.isCurrentVideo } "
    @click="handleClick">

        <v-img :src="videoCover" cover  >
        </v-img>
      
        <v-card-actions class="footer" v-if="props.isCurrentVideo === false">
            <div>{{ item.title }}</div>
             <v-card  :variant="'tonal'" style="text-align: center; color: white; padding:3px; font-weight: bolder;">
                        <span>@{{item.user.nickName }}</span></v-card>
        </v-card-actions>

        <v-overlay scrim="black" :model-value="props.isCurrentVideo" contained persistent  style="opacity: 0.7"  width="100%" height="100%">

            <v-card class="d-flex flex-column justify-space-between" height="100%" >
                <v-card-title style="overflow: hidden;">播放中</v-card-title>

            <v-card-subtitle >
                <template v-for="tag in item.labelNames.split(',').map(s => s.trim())" :key="tag">
                    <v-chip class="ma-1" style="font-weight: bolder;">{{ tag }}</v-chip>
                </template>
            </v-card-subtitle>

            <v-card-text >
                <div style="display: flex; justify-content: flex-start; gap: 50px; padding: 0; margin: 0; ">
                    <div> {{ item.historyCount }} 播放</div>
                    <div> {{ item.startCount }} 点赞</div>
                    <div> {{ item.favoritesCount}} 收藏</div>
                </div>

                <div style="margin-top: 20px; margin-bottom: 20px" @click="copy">
                    YV:{{ item.yv }} <span style="color:blanchedalmond">描述</span>
                </div> 

                <!-- <v-divider></v-divider> -->

                <div style="margin-top: 20px; margin-bottom: 20px">
                    {{  item.user.description }}
                </div>
            </v-card-text>

            <v-card-actions class="footer" >
                <div>{{ item.title }}</div>
                   <v-card  :variant="'tonal'" style="text-align: center; color: white; padding:3px; font-weight: bolder;">
                        <span>@{{item.user.nickName }}</span></v-card>
            </v-card-actions>

            </v-card>

        </v-overlay>

       
    </v-card>
    
</template>

<script setup>
import { apiFileGet } from '@/api/file';
import { ref, computed, watch } from 'vue';

const cardRef = ref()
const props = defineProps({
    item: {
        type: Object,
        default: null
    },
    isCurrentVideo: {
        type: Boolean,
        default: false
    },
    currentVideoIndex: Number

})
const videoCover = computed(() => {
    return apiFileGet(props.item.cover)
})

watch(() => props.isCurrentVideo, (newValue) => {
    if (newValue) {
       cardRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
})

const handleClick = () =>{
    
}
const copy = () => {

}

</script>

<style scope>
.footer{
    display: flex;
    justify-content: space-between;
    background-color: cadetblue;
}
.video-card {
  width: 300px;
  height: 332.75px;
  margin-top: 30px;
  margin-left: 15px;
  transition: transform 0.3 ease, box-shadow 0.3 ease;
}
.video-card.is-current {
  transform: scale(1.07);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  z-index: 10;
}
.video-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
/* ✅ 禁用播放中卡片的 hover 效果 CSS 优先级让 .video-card.is-current:hover 的样式覆盖 .video-card:hover，
所以播放中视频不会再触发 hover 动画。 */
.video-card.is-current:hover {
  transform: scale(1.07); /* 保持播放状态的大小 */
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  cursor: default; /* 可选：让鼠标指针恢复为默认 */
}


</style>