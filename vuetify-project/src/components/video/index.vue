<template>
  <v-layout full-height>
    <!-- 关闭按钮 -->
    <div style="position: absolute; right: 5px; top: 15px; z-index: 99999; opacity:0.5;">
      <v-btn size="40" color="bg" icon v-if="!hideClose" @click="closeVideo">
        <v-icon :size="20">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- 视频侧边栏 / 评论 -->
    <v-navigation-drawer app permanent location="right" :width="350" style=" border-left:none;"
      v-if="!isComment">
      <v-divider></v-divider>
      <Card  v-if="currentVideo" v-for="(item, index) in localVideoList" :key="item.id" :item="item" class="video-card"
        :is-current-video="currentVideoIndex === index"  @click="changeVideo(index)" />
    </v-navigation-drawer>

    <v-navigation-drawer app permanent location="right" :width="350" style=" border-left:none; " v-else>
      <v-list-item>
        <div style="width:40px;"></div>
      </v-list-item>
      <v-divider></v-divider>
      <Comment :video-id="currentVideo?.id" :total="currentVideo.commentCount" @update:total="currentVideo.commentCount += $event" :width="350" />
    </v-navigation-drawer>

    <!-- 视频播放区域 -->
    <v-main width="100%" height="100%" style="background-color:aquamarine;">
      <v-card width="100%" height="100%">
        <!-- <v-card style="width:100%; height:100%;" @wheel.prevent="handleMouseWheel"> -->
        <video ref="video"  class="video-js vjs-default-skin" :src="currentVideoURL" :poster="currentVideoPoster"
         >

        </video>

        <!-- 右侧操作栏 -->
        <div style="position:absolute; z-index:10086; height:60%; right:2%; bottom:30%;
                    display:flex; flex-direction:column; justify-content:space-between;">
          <!-- 用户头像 -->
          <v-badge v-if="!isSelfVideo" color="red" :icon="follow ? 'mdi-check-circle' : 'mdi-plus'" location="bottom"
            @click="likeUser">
            <router-link :to="`/user?lookId=${currentVideo?.user?.id}`" @click.stop>
              <v-avatar class="elevation-2"
                :image="currentVideo?.user?.avatar ? apiFileGet(currentVideo.user.avatar) : '/logo.png'"></v-avatar>
            </router-link>
          </v-badge>

          <!-- 点赞 -->
          <div class="iconContainer like" :class="{ active: liked }" @click="toggleLike">
            <v-icon :size="30">mdi-heart</v-icon>
            <div>{{ currentVideo?.startCount ?? 0 }}</div>
          </div>

          <!-- 评论 -->
          <div class="iconContainer comment" :class="{ active: comment }" @click="toggleComment">
            <v-icon :size="30">mdi-comment</v-icon>
            <div>{{ currentVideo?.commentCount ?? 0 }}</div>
          </div>

          <!-- 收藏 -->
          <Favorite :video-id="currentVideo?.id" :callback="favoriteCallBack">
            <template #default="{ props }">
              <div class="iconContainer favor" :class="{ active: favorited }" v-bind="props">
                <v-icon :size="30">mdi-star</v-icon>
                <div>{{ currentVideo?.favoritesCount }}</div>
              </div>
            </template>
          </Favorite>

          <!-- 分享 -->
          <div class="iconContainer share" @click="copyUrl">
            <v-icon :size="30">mdi-share</v-icon>
          </div>
        </div>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn color="blue" variant="text" @click="snackbar.show = false">了解</v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
import Card from './Card.vue'
import Comment from '@/components/comment/index.vue'
import Favorite from '@/components/favorite/index.vue'
import { apiFileGet } from '@/api/file'
import { useUserStore } from '@/store'
import { apiGetVideoBySimilar, apiGetVideoById, apiStarVideo, apiShareVideo, apiAddHistory, apiSetUserVideoModel } from '@/api/video'
import strUtils from '@/util/strUtil'
import { storeToRefs } from 'pinia'

const props = defineProps({
  videoList: { type: Array, default: () => [] },
  video: { type: Object, default: () => null },
  hideClose: { type: Boolean, default: false },
  closeVideo: { type: Function, default: () => { } },
  nextVideo: { type: Function, default: () => { } },
})

const userStore = useUserStore()
const { info } = storeToRefs(userStore)
const currentUserId = computed(() => info.value?.id)

const localVideoList = ref([])
const currentVideoIndex = ref(0)
const isComment = ref(false)
const liked = ref(false)
const favorited = ref(false)
const follow = ref(false)
const isSelfVideo = ref(false)
const videoPlayer = ref()
const video = ref()
const instance = getCurrentInstance().proxy
const snackbar = ref({ show: false, text: '' })
const isAddHistory = ref(true)
const isLikeVideo = ref(false)

/* 当前视频计算属性 */
const currentVideo = computed(() => localVideoList.value[currentVideoIndex.value])
const currentVideoURL = computed(() => currentVideo.value ? apiFileGet(currentVideo.value.url) : '')
const currentVideoPoster = computed(() => currentVideo.value ? apiFileGet(currentVideo.value.cover) : '')

/* 初始化视频状态 */
const initVideoStatus = async (videoId) => {
  try {
    const res = await apiGetVideoById(videoId)
    const v = res.data.data
    if (!v) return
    liked.value = !!v.start
    favorited.value = !!v.favorites
    follow.value = !!v.follow || !!v.user.each
    if (v.user.id === currentUserId.value) isSelfVideo.value = true
  } catch (e) {
    console.error('初始化视频状态失败', e)
  }
}

/* 初始化播放器（只执行一次） */
const firstInitVideo = () => {
  if (videoPlayer.value || !currentVideo.value) return

  nextTick(() => {
    videoPlayer.value = instance.$video(video.value, {
      playbackRates: [0.5, 1, 1.5, 2],
      notSupportedMessage: "暂不支持该视频类型",
       autoplay: true,
      controls: true,
      fill: true
    })

    videoPlayer.value.volume(localStorage.getItem("volume") || 1)
    document.addEventListener('wheel', handleMouseWheel)
    window.addEventListener('keydown', windowKeyEvent)

    videoPlayer.value.on("volumechange", () => {
      localStorage.setItem("volume", videoPlayer.value.volume())
    })

    videoPlayer.value.on("timeupdate", function () {
      if (this.currentTime() >= 3 && isAddHistory.value) {
        isAddHistory.value = false
        apiAddHistory(currentVideo.value.id)
      }
      let duration = this.duration()
      let score = this.currentTime() >= (duration / 5)
      if (score) {
        if (!isLikeVideo.value)
          apiSetUserVideoModel(currentVideo.value.id, currentVideo.value.labelNames, 1)
        isLikeVideo.value = true
      } else isLikeVideo.value = false
    })
  })
}

/* 切换视频源 */
const playVideo = (videoData) => {
  if (!videoPlayer.value || !videoData) return
  props.nextVideo(currentVideoIndex.value)
  isAddHistory.value = true
console.log("videoData.videoType: ", videoData.videoType)
console.log('切换视频 URL:', videoData.playUrl)
   videoPlayer.value.src([{
    src: currentVideoURL.value,
    type: currentVideo.value.videoType || 'video/mp4',
    poster: currentVideoPoster.value
  }])
  videoPlayer.value.load()
  let playPromise = videoPlayer.value.play()
  
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      // Automatic playback started!
      // Show playing UI.
    })
    .catch(error => {
      // Auto-play was prevented
      // Show paused UI.
    });
  }

  apiSetUserVideoModel(videoData.id, videoData.labelNames, -0.5)
}

/* 切换视频索引 */
const changeVideo = (index) => {
  currentVideoIndex.value = index
}

/* 滚轮 / 键盘切换 */
// const nextVideo = () => changeVideo((currentVideoIndex.value + 1) % localVideoList.value.length)
// const prevVideo = () => changeVideo((currentVideoIndex.value - 1 + localVideoList.value.length) % localVideoList.value.length)
const nextVideo = () => {
  if (currentVideoIndex.value < localVideoList.value.length - 1) {
    currentVideoIndex.value++
    props.nextVideo?.(currentVideoIndex.value) 
  }
}

const prevVideo = () => {
  if (currentVideoIndex.value > 0) {
    currentVideoIndex.value--
  }
}

const handleMouseWheel = (() => {
  let wheelCoolDown = false
  const WHEEL_COOLDOWN_MS = 200
  return (event) => {
    if (wheelCoolDown) return
    wheelCoolDown = true
    setTimeout(() => { wheelCoolDown = false }, WHEEL_COOLDOWN_MS)
    event.deltaY > 0 ? nextVideo() : prevVideo()
  }
})()

const windowKeyEvent = (event) => {
  switch (event.which) {
    case 38: prevVideo(); break
    case 40: nextVideo(); break
    case 27: props.closeVideo(); break
    case 70: videoPlayer.value.requestFullscreen(); break
  }
}

/* 点赞 / 评论 / 收藏 / 分享 */
const toggleLike = async () => {
  if (!currentVideo.value) return
  await apiStarVideo(currentVideo.value.id)
  liked.value = !liked.value
  currentVideo.value.startCount += liked.value ? 1 : -1
}
const toggleComment = () => { 
  isComment.value = !isComment.value 
  console.log("toggleComment: ", currentVideo.value.commentCount)
}
const likeUser = () => { console.log('关注用户') }
const shareBtn = () => { apiShareVideo(currentVideo.value.id) }
const copyUrl = () => {
  shareBtn()
  snackbar.value = {
    text: strUtils.copyContent(location.host + "/#/?play=" + currentVideo.value.id) ? "视频地址复制成功" : "视频地址复制失败",
    show: true
  }
}
const favoriteCallBack = (e) => {
  if (e == "已收藏") {
    currentVideo.value.favoritesCount++
    favorited.value = true
  } else {
    currentVideo.value.favoritesCount--
    favorited.value = false
  }
  snackbar.value = { show: true, text: e }
}

/* 获取相似视频 */
const getVideoBySimilar = async () => {
  if (!props.video) return []
  try {
    const res = await apiGetVideoBySimilar(props.video.labelNames, props.video.id)
    return res.data?.data ?? []
  } catch (e) { console.error(e); return [] }
}

/* watch 当前视频（总入口） */
watch(currentVideo, async (video) => {
  if (!video) return
  firstInitVideo()
  playVideo(video)
  await initVideoStatus(video.id)
}, { immediate: true })

/* watch props 构造 localVideoList */
watch([() => props.videoList, () => props.video], async ([list, video]) => {
  if (video && (!list || list.length === 0)) {
    const similar = await getVideoBySimilar()
    localVideoList.value = [video, ...similar]
    currentVideoIndex.value = 0
    return
  }
  if (list && list.length > 0) {
    localVideoList.value = list
    currentVideoIndex.value = 0
    return
  }
  localVideoList.value.splice(0)
}, { immediate: true })


onMounted(() => {
   video.value.style['background-size'] = " cover"
   video.value.style['background-position'] = "center"
  //  document.documentElement.style.overflowY = 'hidden' 
})
onUnmounted(() => {
 
  // document.documentElement.style.overflowY = ''
  document.removeEventListener('wheel', handleMouseWheel)
  window.removeEventListener('keydown', windowKeyEvent)
})
</script>

<style scoped>
.iconContainer {
  display: flex;
  flex-direction: column;
  color: white;
  align-items: center;
  cursor: pointer;
}

.iconContainer div {
  text-align: center;
  width: 30px;
  height: 30px;
}

.iconContainer .v-icon {
  transition: transform 0.2s ease, color 0.2s ease;
}

.iconContainer.like:hover .v-icon {
  color: red;
  transform: scale(1.2);
}

.iconContainer.like.active .v-icon {
  color: red;
}

.iconContainer.favor:hover .v-icon {
  color: gold;
  transform: scale(1.2);
}

.iconContainer.favor.active .v-icon {
  color: gold;
}

.iconContainer.share:hover .v-icon {
  color: #00c853;
  transform: scale(1.2);
}

/*v::deep .v-navigation-drawer__content {
  overflow: hidden
}*/
</style>
