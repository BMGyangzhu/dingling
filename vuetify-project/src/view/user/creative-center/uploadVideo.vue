<template>
    <div style="display: flex; width: 100%;">
        <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
                border: dashed gray;
                margin: 10px;
                width: 50%;
        ">
            <v-icon icon="mdi-upload" color="info" size="x-large"></v-icon>
            <v-btn color="green" @click="videoFileRef.click()">上传视频</v-btn>

            <div style="display: none;">
                <form>
                  <input @change="uploadVideo" type="file" ref="videoFileRef" multiple accept="video/*" style="display: none;"/>
                </form>
            </div>

            <div style="display: flex;
                        align-items: center;
                        background-color: yellowgreen;
                        border-radius: 5px; margin:5px;
                        padding: 5px; gap:5px;
                        color:green;
            ">
                <v-icon icon="mdi-account-clock" size="x-small"></v-icon>
                <span style="font-size: 14px;">审核队列:{{ queueState}}</span>
            </div>
        </div>

         <div style="
                display: flex;
                flex-direction: column;
                width: 50%;
                margin-left: 10px;
                margin-top: 5px;
        ">
          <div><span>用户须知：</span></div>

            <div style="display: flex; align-items: center; margin: 0.5rem;">
                <div>
                    <v-icon icon="mdi-home" size="x-large"></v-icon>
                </div>
                <div>
                    <div style="font-size: 1em;">视频</div>
                    <div style="font-size: 1.125em;">视频格式支持: mp4 avi aav cawd</div>
                </div>
            </div>

            <div style="display: flex; align-items: center; margin: 0.5rem;">
                <div>
                    <v-icon icon="mdi-home" size="x-large"></v-icon>
                </div>
                <div>
                    <div style="font-size: 1em;">审核</div>
                    <div style="font-size: 1.125em;">发布视频后会进行视频审核。（七牛云服务自动审核）</div>
                </div>
              
            </div>

            <div style="display: flex; align-items: center; margin: 0.5rem;">
                <div>
                    <v-icon icon="mdi-home" size="x-large"></v-icon>
                </div>
                <div>
                    <div style="font-size: 1em;">存储</div>
                    <div style="font-size: 1.125em;">您的视频将会被存储在七牛云的对象存储服务中</div>
                </div>
            </div>

        </div>
    </div>

        <!-- <div v-if="videoFileRef.files.length > 0" class="upload-list-card"> -->
            <div v-if="uploadList.length > 0" class="upload-list-card">
            <div class="card-title">视频信息</div>
            <hr />

            <div class="upload-items">
                <div
                    v-for="(uploadItem, index) in uploadList"
                    class="upload-item"
                    :class="{selected: currentVideoIndex === index}"
                    @click="currentVideoIndex = index"
                >
                    <div class="upload-item-title">{{ uploadItem.title }}</div>
                    <div class="progress-container">
                        <div class="progress-bar" :style="{ width: uploadItem.progress + '%' }"></div>
                        <span class="progress-text">{{ Math.ceil(uploadItem.progress) }}%</span>
                    </div>
                </div>
            </div>

            <!-- 编辑区域 -->
            <v-card-text v-if="currentVideo">
                <VideoEdit :current-video="currentVideo" :clear="clearUp" :save="pushVideo" />
            </v-card-text>


        </div>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color">
            {{  snackbar.text }}

            <template v-slot:actions>
                <v-btn color="blue" variant="text" @click="snackbar.show = false">
                    了解
                </v-btn>
            </template>
        </v-snackbar>

    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiUploadFile } from '@/api/file'
import { apiGetAuditQueueState } from '@/api/video';
import VideoEdit from './editForm.vue'
const videoFileRef = ref()
const uploadList = ref([])
const queueState = ref("快速")
const currentVideoIndex = ref(null)
const currentVideo = computed(() => currentVideoIndex.value > -1 ? uploadList.value[currentVideoIndex.value] : null)
const snackbar = ref({
    show: false,
    text: ""
})
const getQueueState = () => {
    apiGetAuditQueueState().then(({ data }) => {
        if (!data.state) {
            return
        }
        queueState.value = data.message
    })
}
const clearUp = () => {
    if (currentVideo.value.status < 1) {
        currentVideo.value.subscription.unsubscribe()
    }
    uploadList.value.splice(currentVideoIndex.value, 1);
}
const pushVideo = (data) => {
    snackbar.value = {
        text: data.message,
        show: true
    }
    if(data.state) {
        clearUp();
        getQueueState()
    }
    
}
const uploadVideo = async() => {
    if (!videoFileRef.value.files[0]) return
    let currentFile = videoFileRef.value.files[0]
    const currentUploadInfo = {
        progress: 0,
        status: 0,
        msg: "",
        result: "",
        title: currentFile.name,
        description: "",
        url: "",
        cover: "",
        file: currentFile,
        labelNames: []
    }
    uploadList.value.push(currentUploadInfo)
    if (uploadList.value.length == 1) {
        currentVideoIndex.value = 0
    }
    currentUploadInfo.subscription = await apiUploadFile(currentFile, {
        next: (result) => {
            currentUploadInfo.progress = result.total.percent
            uploadList.value = Object.assign([], uploadList.value)
        }, 
        error: (error) => {
            currentUploadInfo.status = -1
            currentUploadInfo.msg = "上传失败: " + error
            // 强制触发Vue的视图更新
            uploadList.value = Object.assign([], uploadList.value)
        },
        complete: (result, fileId) => {
            if (!fileId.state) {
                snackbar.value = {
                    text: fileId.message,
                    show: true
                }
                return
            }
            currentUploadInfo.result = result
            currentUploadInfo.status = 1
            currentUploadInfo.url = fileId.data
            uploadList.value = Object.assign([], uploadList.value)
        }
    })
    // videoFileRef.value.value = ""的作用是清空文件输入框的值，让用户可以再次选择同一个文件。
    videoFileRef.value.value = ""

}

onMounted(() => {
    getQueueState()
})
</script>

<style>
.upload-list-card {
    border: 1px dashed gray;
    padding: 16px;
    margin: 10px 0;
    background: white;
}

.card-title {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 8px;
}

.upload-items {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.upload-item {
    flex: 1 1 calc(25% - 16px);
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
}

.upload-item.selected {
    background-color: #1976d2;
    color: white;
}

.upload-item-title {
    font-weight: bold;
    margin-bottom: 8px;
}

.progress-container {
    position: relative;
    height: 25px;
    background-color: #eee;
    border-radius: 12px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: orange;
    transition: width 0.3s;
}

.progress-text {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
}

.video-edit-container {
    margin-top: 16px;
}

</style>