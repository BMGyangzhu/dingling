<template>
    <v-container>
        <v-card style="width: 100%; height: 40vh;  margin-bottom: 20px;">
            <div style="position: relative; height: 80%;">
                <v-img src="@/assets/userbackground.jpg" cover style="position: relative">
                    <template #default>
                        <div style="
                            position:absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            display: flex;
                            ">
                            <div style="
                                display: flex;
                                align-items: center;
                                ">
                                <v-avatar :image="avatarImg" color="surface-variant" size="x-large"
                                    style="margin:20px; margin-right: 10px;"></v-avatar>
                                <div>
                                    <div><span style="font-weight: bolder; color: white;">{{ userInfo.nickName }}</span>
                                    </div>
                                    <div><span style="font-size: 14px;color:silver;">{{ userInfo.description }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </v-img>
            </div>

            <v-tabs color="primary">
                <v-tab value="one" :to="`/user/home${isSelf ? '' : '?lookId=' + userInfo.id}`">主页</v-tab>
                <v-tab value="two" to="/user/video" v-if="isSelf">创作中心</v-tab>
                <v-tab value="three" to="/user/favorites" v-if="isSelf">收藏夹</v-tab>
                <v-tab value="four" to="/user/history" v-if="isSelf">历史记录</v-tab>
                <v-tab value="five" to="/user/classify" v-if="isSelf">订阅分类</v-tab>
                <v-tab value="six" :to="`/user/like${isSelf ? '' : '?lookId=' + userInfo.id}`">关注/粉丝</v-tab>
                <router-link 
                v-if="route.query.lookId"
                style="display: flex; align-items: center;text-decoration: none;border-bottom: none;"
                :to="`/message-center?toUserId=${userInfo.id}&toUserAvatar=${userInfo.avatar}`">
                    <v-btn density="comfortable" color="green" icon="mdi-chat" ></v-btn>
                </router-link>
                <v-spacer></v-spacer>

                <v-btn class="ma-2" variant="text" @click="editDialog = !editDialog" v-if="isSelf">编辑信息</v-btn>
            </v-tabs>
        </v-card>
        <router-view />
        <v-dialog v-model="editDialog" max-width="400" scroll-strategy="none">
            <v-card title="编辑用户信息">
                <v-divider></v-divider>
                <v-card-text>
                    <v-form>
                        <v-hover v-slot="{ isHovering, props }">
                            <v-card v-bind="props" class="mb-2 mx-auto" height="70px" width="70px" :rounded="10"
                                @click="avatarFileRef.click()">
                                <v-img :rounded="10" :src="avatarImg" />
                                <v-overlay :model-center="isHovering == true || uploading > -1" contained scrim="black"
                                    class="align-center justify-center">
                                    <v-icon v-if="uploading == -1">mdi-upload</v-icon>
                                    <v-progress-circular v-else :model-value="uploading"></v-progress-circular>
                                </v-overlay>
                            </v-card>
                        </v-hover>

                        <input hidden @change="uploadAvatar" ref="avatarFileRef" type="file" accept="image/*" />
                        <v-text-field v-model="userInfo.nickName" label="昵称" placeholder="请输入昵称"></v-text-field>
                        <v-text-field v-model="userInfo.description" label="描述" placeholder="请输入描述"></v-text-field>
                        <v-switch v-model="userInfo.sex" :label="userInfo.sex ? '男生' : '女生'" inset
                            color="blue"></v-switch>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn text="取消" color="warning" @click="editDialog = false" />
                    <v-spacer />
                    <v-btn text="保存" color="success" @click="saveInfo()" />
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar.show" :color="snackbar.color">
            {{ snackbar.text }}

            <template v-slot:actions>
                <v-btn color="blue" variant="text" @click="snackbar.show = false">
                    了解
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>


</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { apiFileGet, apiUploadFile } from '@/api/file';
import { apiGetUserInfo, apiChangeUserInfo } from '@/api/user/user';
import { useUserStore } from '@/store/index'
import { useRoute } from 'vue-router'
import { RouterView, useRouter } from 'vue-router';

const userStore = useUserStore()
const route = useRoute()
const userInfo = ref({})
const editDialog = ref(false)
const avatarFileRef = ref()
const uploading = ref(-1)
const snackbar = ref({
    show: false,
    text: ""
})
const isSelf = computed(() => {
    if (!userInfo.value) return false
    return userStore.$state.info.id == userInfo.value.id
})
const avatarImg = computed(() => {
    if (!userInfo.value) {
        getUserInfo()
        return "/logo.png"
    }
    if (avatarFileRef.value && avatarFileRef.value.files && avatarFileRef.value.files[0]) {
        var URL = window.URL || window.webkitURL
        return URL.createObjectURL(avatarFileRef.value.files[0])
    }
    if (userInfo.value == null) {
        return "/logo.png"
    }
    if (userInfo.value.avatar == null) return "/logo.png"

    return apiFileGet(userInfo.value.avatar)
})
const uploadAvatar = () => {
    if (!avatarFileRef.value.files[0]) return
    apiUploadFile(avatarFileRef.value.files[0], {
        next: (e) => {
            uploading.value = e.total.percent
        },
        error: () => {
            uploading.value = -1
            snackbar.value = {
                text: "上传失败",
                show: true,
                color: "error",
            }
        },
        complete: (_e, fileId) => {
            if (!fileId.state) {
                snackbar.value = {
                    text: fileId.message,
                    show: true
                }
                return
            }

            userInfo.value.avatar = fileId.data
            snackbar.value = {
                text: "上传完成",
                show: true,
                color: "success"
            }
        }
    })
}
const getUserInfo = () => {
    if (route.query && route.query.lookId) {
        userStore.$patch({
            lookId: route.query.lookId
        })
    } else {
        userStore.$patch({
            lookId: userStore.$state.info.id
        })
    }
    apiGetUserInfo(userStore.$state.lookId).then(({ data }) => {
        if (data.state) {
            userInfo.value = data.data
        }
    })
}

const saveInfo = () => {
    apiChangeUserInfo(userInfo.value).then(({ data }) => {
        snackbar.value = {
            text: data.message,
            show: true,
            color: data.state ? "success" : "error"
        }
        if (!data.state) {
            return
        }
        editDialog.value = false
        apiGetUserInfo(userInfo.value.id).then(({ data }) => {
            if (data.state) {
                userStore.$patch({
                    info: data.data
                })
            }
        })
    })
}

watch(() => route.query, () => {
    getUserInfo()
}, { immediate: true })

onMounted(() => {
    if (!userStore.$state.token) {
        router.push({ path: "/" })
    }

    userStore.$patch({
        lookId: route.query.lookId || userStore.info.id
    })
    getUserInfo()
})


</script>

<style></style>