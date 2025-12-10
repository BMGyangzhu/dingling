<template>
  <div class="chat-container">
    <div class="chat-list" ref="chatList">
      <div v-for="msg in messages" :key="msg.id"
        :class="['chat-message', msg.fromUserId === currentUserId ? 'self' : 'other']">
        <v-avatar :image="msg.fromUserId === currentUserId
            ? apiFileGet(userStore.info.avatar)
            : apiFileGet(toUserAvatar)"
            ></v-avatar>
        <div class="content">{{ msg.content }}</div>
        <div class="time">{{ formatTime(msg.gmtCreated) }}</div>
      </div>
    </div>

    <div class="chat-input">
      <textarea v-model="inputContent" @keyup.enter="sendMessage" placeholder="输入消息..." />
      
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useUserStore } from '@/store/'
import { apiFileGet } from '@/api/file'
import { apiMarkMessagesAsRead, apiGetHistory } from '@/api/im'

const props = defineProps({
  toUserId: { type: Number, required: true },
  toUserAvatar: { type: Number, required: true }
})

const toUserId = computed(() => props.toUserId)
const toUserAvatar = computed(() => props.toUserAvatar)

const userStore = useUserStore()
const currentUserId = computed(() => userStore.info?.id)
const ws = computed(() => userStore.ws)

const messages = ref([])
const inputContent = ref('')
const chatList = ref(null)

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = time instanceof Date ? time : new Date(time)
  if (isNaN(date)) return ''
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const pad = (num) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  if (date.toDateString() === now.toDateString()) return `${hour}:${minute}`
  else if (date.toDateString() === yesterday.toDateString()) return `昨天 ${hour}:${minute}`
  else return `${year}-${month}-${day} ${hour}:${minute}`
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatList.value) chatList.value.scrollTop = chatList.value.scrollHeight
  })
}

// 发送消息
const sendMessage = () => {
  if (!inputContent.value.trim() || !ws.value || ws.value.readyState !== WebSocket.OPEN) return

  const msg = {
    fromUserId: currentUserId.value,
    toUserId: toUserId.value,
    content: inputContent.value.trim()
  }

  ws.value.send(JSON.stringify(msg))
  inputContent.value = ''
}

// 推送消息到当前聊天
const pushMessage = (msg) => {
  const exist = messages.value.some(m => m.id === msg.id)
  if (!exist) {
    messages.value.push(msg)
    scrollToBottom()
  }
}

// 加载历史消息
const loadHistory = async () => {
  if (!toUserId.value) return
  try {
    const res = await apiGetHistory(currentUserId.value, toUserId.value)
    messages.value = res.data
    scrollToBottom()
    // 当前聊天窗口打开，标记未读
    // if (res.data.length) {
    //   await userStore.clearUnreadByUserId(toUserId.value)
    // }
  } catch (err) {
    console.error(err)
  }
}

// 初始化聊天
const initChat = async () => {
  messages.value = []
  await loadHistory()
}

// 切换联系人时初始化聊天
watch(toUserId, () => {
  initChat()
}, { immediate: true })

// 监听 WebSocket 消息
watch(() => userStore.messageBus, async (msg) => {
  if (!msg || msg.type !== "CHAT_MESSAGE") return

  const fromId = msg.data.fromUserId
  const toId = msg.data.toUserId

  if (
    (fromId === toUserId.value && toId === currentUserId.value) ||
    (fromId === currentUserId.value && toId === toUserId.value)
  ) {
    // 当前聊天窗口是该联系人
    pushMessage(msg.data)
    scrollToBottom()
    // 标记为已读
    if (fromId === toUserId.value) {
      await userStore.clearUnreadByUserId(fromId)
    }
  } else if (toId === currentUserId.value) {
    // 非当前聊天窗口，对方发来的消息
  }
})
</script>



<style scoped>
  
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 整个屏幕高度 */
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

/* 消息气泡 */
.chat-message {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  max-width: 40%;
  word-wrap: break-word;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
}

/* 自己的消息靠右 */
.chat-message.self {
  align-items: flex-end;
  margin-left: auto;
  /* 靠右 */
  background-color: #d2f8c6;
  border-radius: 12px 12px 0 12px;
}

/* 对方消息靠左 */
.chat-message.other {
  align-items: flex-start;
  margin-right: auto;
  /* 靠左 */
  background-color: #fff;
  border-radius: 12px 12px 12px 0;
}

.chat-message .time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

/* 输入框固定在底部 */
.chat-input {
  flex-shrink: 0;
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  background-color: #fff;
}

.chat-input textarea {
  flex: 1;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
}

.chat-input button {
  margin-left: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  background-color: #0084ff;
  color: #fff;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #006bbd;
}
</style>
