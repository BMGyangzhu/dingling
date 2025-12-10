<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>叮铃叮铃</v-app-bar-title>
     <!-- <v-text-field class="e700-hide" hide-details :density="'comfortable'" prepend-inner-icon="mdi-magnify" single-line
      clearable @click="openSearch" placeholder="搜索视频">
    </v-text-field> -->
    <v-spacer />
    <v-toolbar-items variant="plain" class="pr-2">
      <v-btn class="d700-hide" @click="openSearch" :variant="'text'"><v-icon>mdi-magnify</v-icon>搜索</v-btn>
    </v-toolbar-items>
    <v-dialog v-model="showSearch" max-width="500px" :location="'top'">
      <v-card>
        <v-toolbar flat color="background">
          <v-text-field autofocus ref="searchInputRef" hide-details prepend-inner-icon="mdi-magnify" single-line clearable
            v-model="searchKey" @click:clear="search" v-on:keyup.enter="search" placeholder="搜索视频">
          </v-text-field>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <h2 class="text-h6 mb-2" v-if="searchHistory.length>0">
            搜索历史
          </h2>
          <v-chip-group v-model="searchKey" column @update:model-value="search">
            <v-chip filter :value="item" variant="outlined" v-for="item in searchHistory">
              {{ item }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-divider />
        <v-card-text class="pt-0">
          <hotList elevation="0" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 未读消息闹铃按钮 -->
    <v-btn
      icon
      class="position-relative"
      v-if="userStore.token"
      @click="goToChat"
    >
      <v-icon>mdi-bell</v-icon>
      <!-- 未读数量 -->
      <span
        v-if="userStore.unreadCount > 0"
        class="badge"
      >
        {{ userStore.unreadCount }}
      </span>
    </v-btn>

         
    <v-dialog v-model="dialogActive" max-width="500" persistent>
      <template v-slot:activator="{ props: activatorProps }">
            <v-btn
            v-bind="activatorProps"
            rounded="lg"
            prepend-icon="mdi-account"
            variant="text"
            v-if="!userStore.token"
            >
            登录
            </v-btn>
            <v-btn v-else @click="outLogin" append-icon="mdi-logout" elevation="1" variant="flat"  class="text-none" color="indigo-darken-3"  >退出登录</v-btn>
      </template>

        <v-card>
          <div class="tab-buttons" style="display: none;">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              :class="['tab-button', { active: currentTab === tab.name }]"
              @click="currentTab = tab.name"
            >
              {{ tab.label }}
            </button>
          </div>

          <v-card-text>
            <KeepAlive>
              <component :is="currentComponent" :show-message="showMessage" :close-event="closeEvent"></component>
            </KeepAlive>
          </v-card-text>

          <v-card-actions style="display: block;">
            
            <div style="width: 100%; display: flex; justify-content: center;">
                <v-btn
                variant="text"
                v-if="currentTab !== 'forget'"
                @click="currentTab = 'forget'"
                >
                忘记密码？
                </v-btn>
            </div>

            <div  style="width: 100%; display: flex; justify-content: space-between;">
                <v-btn
                style="width: 50%;"
                variant="text"
                v-if="currentTab !== 'login'"
                @click="currentTab = 'login'"
                >
                登录账号
                </v-btn>

                <v-btn
                style="width: 50%;"
                variant="text"
                v-else-if="currentTab === 'login'"
                @click="currentTab = 'register'"
                >注册账号</v-btn>


                <v-btn
                style="width: 50%;"
                variant="text"
                @click="dialogActive = false"
                >
                取消
                </v-btn>
            </div>
            
          </v-card-actions>

          <v-snackbar v-model="snackbar.show" :color="snackbar.color">
            {{  snackbar.text }}

            <template v-slot:actions>
                <v-btn color="blue" variant="text" @click="snackbar.show = false">
                    了解
                </v-btn>
            </template>
          </v-snackbar>
          
        </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import Login from '@/components/user/login.vue'
import ForgetPassword from '@/components/user/ForgetPassword.vue'
import Register from '@/components/user/Register.vue'
import { useUserStore } from '@/store/index'
import router from '@/router'
import { apiInitFollowFeed } from '@/api/video'
import { apiGetUserInfo, apiGetUserSearchHistory  } from '@/api/user/user'
import { apiGetUnread } from '@/api/im'
import { useRoute } from 'vue-router'

const props = defineProps({
  drawer: Boolean
})
const emit = defineEmits(['update:drawer'])
const toggleDrawer = () => {
  console.log('toggleDrawer 被点击了')
  console.log('当前 drawer 值:', props.drawer)
  emit('update:drawer', !props.drawer)
  console.log('更新后的 drawer 值:', !props.drawer)
}

const route = useRoute()
const userStore = useUserStore()
const searchKey = ref("")
const showSearch = ref(false)
const openSearch = () => {
  showSearch.value = !showSearch.value
}
const searchHistory = ref([])
onMounted(()=>{
  apiGetUserSearchHistory().then(({data})=>{
    searchHistory.value = data.data
  })
})
const search = () => {
  showSearch.value = false
  if (!searchKey.value || searchKey.value.length == 0) {
    router.push({
      path: "/",
    })
    return
  }
  router.push({
    path: "/video/search/" + searchKey.value,
  })
  apiGetUserSearchHistory().then(({data})=>{
    searchHistory.value = data.data
  })
  searchKey.value = ""
}
const dialogActive = ref(false)
const tabs = [
  { name: 'login', label: '登录', component: Login },
  { name: 'forget', label: '忘记密码', component: ForgetPassword },
  { name: 'register', label: '注册', component: Register },
]
const currentTab = ref('login')
const currentComponent = computed(() => {
  const tab = tabs.find(t => t.name === currentTab.value)
  return tab ? tab.component : null
})
const snackbar = ref({
  text: "",
  show: false
})

const showMessage = (text, color) => {
    snackbar.value = {
        text,
        color,
        show: true
    }
}

const closeEvent = (data) => {
    userStore.$patch({
        token: data.token
    })
    sessionStorage.setItem("token", data.token)
    getUserInfo()
    dialogActive.value = false
}

const getUserInfo = async() => {
    const { data } =  await apiGetUserInfo()
    if (!data.state) {
        userStore.$patch({
            info: {},
            token: null
        })
        return
    }
    apiInitFollowFeed()
    userStore.$patch({
        info: data.data
    })

    connectWS()
}

const outLogin = () => {
  sessionStorage.removeItem("token")

  if (userStore.ws) {
    userStore.ws.close()
    userStore.setWebSocket(null)
  }

  userStore.$patch({
    token: null,
    info: {}
  })

  router.push({ path: "/" })
}

const connectWS = () => {
  if (userStore.ws) return // 防止重复连接

  const token = sessionStorage.getItem("token")
  if (!token) return
  const ws = new WebSocket(`ws://localhost:8888/ws?token=${token}`)
  //  const ws = new WebSocket('ws://localhost:8888/ws')
  console.log("ws实例已创建")

  ws.onopen = () => {
    console.log('websocket已连接')
    userStore.setWebSocket(ws)
  }

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)

     if (msg.type === 'KICK_OUT') {
    alert(msg.data || '你的账号已在其他地方登录')

    // 清理登录态
    sessionStorage.removeItem("token")

    userStore.$patch({
      token: null,
      info: {}
    })

    ws.close()
    userStore.setWebSocket(null)

    router.push({ path: "/" })
    return
  }

    if (!msg || msg.type !== 'CHAT_MESSAGE') return

    userStore.emitMessage(msg) // 通知im页面

  // 如果当前路径不是 /message-center，则增加未读数
  if (route.path !== '/message-center') {
    userStore.unreadCount++;
  }


    userStore.pushNotify({  // 顶部通知
      avatar: msg.fromUserAvatar,
      nickName: msg.fromUserName,
      content: msg.content
    })
    
  }

  ws.onclose = () => {
      console.log('WebSocket 已断开')
      userStore.setWebSocket(null)
    }

    ws.onerror = (err) => {
      console.error('ws 错误', err)
    }
}

const getUnread = async () =>{
    try {
      const res = await apiGetUnread(userStore.info.id)
      userStore.unreadCount = res.data.length
    } catch (e) {
      console.error(e)
    }
}
onMounted(() => {
  getUserInfo().then(getUnread)
})
</script>

<style scoped>
.tab-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  margin-bottom: 16px;
}

.tab-button {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
}

.tab-button.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 8px;
  background-color: red;
  color: white;
  text-align: center;
}
.position-relative {
  position: relative;
}
</style>
