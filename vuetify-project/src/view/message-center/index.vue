<template>
      <v-container fluid class="chat-container pa-0">
        <v-row no-gutters class="h-100">
          <!-- 左侧联系人列表 -->
          <v-col cols="3" class="contact-list-col">
            <v-card class="contact-list h-100" rounded="0" elevation="2">
              <v-card-title class="contact-header">
                <v-icon icon="mdi-forum" class="mr-2"></v-icon>
                消息
              </v-card-title>
              
              <v-list density="comfortable" class="contact-items">
                <v-list-item
                  v-for="contact in contacts"
                  :key="contact.id"
                  :class="['contact-item', { active: activeContact?.id === contact.id }]"
                  @click="selectContact(contact)"
                >
                  <template #prepend>
                    <v-avatar size="40" :color="contact.unread ? 'primary' : 'grey-lighten-2'">
                      <v-icon v-if="!contact.toUserAvatar" icon="mdi-account"></v-icon>
                      <v-img v-else :src="apiFileGet(contact.toUserAvatar)"></v-img>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="contact-name">
                    {{ contact.nickName }}
                    <v-badge
                      v-if="contact.unreadCount"
                      color="red"
                      :content="contact.unreadCount"
                      inline
                      class="ml-2"
                    ></v-badge>
                  </v-list-item-title>
                  
                  <v-list-item-subtitle class="contact-preview">
                    {{ contact.lastMessage }}
                  </v-list-item-subtitle>
                  
                  <template #append>
                    <div class="contact-time">
                      {{ formatTime(contact.lastMessageTime) }}
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- 右侧聊天区域 -->
          <v-col cols="9" class="chat-area-col">
            <IM 
              v-if="activeContact"
              :to-user-id="activeContact.toUserId"
              :to-user-avatar="activeContact.toUserAvatar"
             />
          </v-col>
        </v-row>
      </v-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { apiGetContact, apiGetMessageList ,apiCreateContact} from '@/api/im'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { apiFileGet } from '@/api/file'
import IM from '@/components/im'
const props = defineProps({
  toUserId: Number,
  toUserAvatar: Number
})

const userStore = useUserStore()
const { info } = storeToRefs(userStore)
const selfUserId = computed(() => info.value?.id)


const contacts = ref([])
const activeContact = ref(null)
const formatTime = (time) => {
  if (!time) return ''

  // 如果是 Date 对象，直接用
  const date = time instanceof Date ? time : new Date(time)

  if (isNaN(date)) return '' // 无效时间返回空

  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  const pad = (num) => String(num).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())

  if (date.toDateString() === now.toDateString()) {
    return `${hour}:${minute}` // 今天
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${hour}:${minute}` // 昨天
  } else {
    return `${year}-${month}-${day} ${hour}:${minute}` // 其他
  }
}

const selectContact = (contact) => {
  activeContact.value = contact
  if(contact.unreadCount != 0){
    userStore.unreadCount -= contact.unreadCount
    contact.unreadCount = 0
    userStore.clearUnreadByUserId(contact.toUserId)
 }
  console.log("userId", contact.toUserId)
}

const autoSelectContact = async () => {
  // 如果路由没有传 toUserId，默认选第一个
  // if (!props.toUserId) {
  //   activeContact.value = contacts.value[0] || null
  //   return
  // }
  if(!props.toUserId) return

  // 1. 查找 contacts 中是否存在
  const exist = contacts.value.find(item => item.toUserId === props.toUserId)

  if (exist) {
    activeContact.value = exist
    return
  }

  // 2. 如果不存在，调用后端创建新的会话
  await apiCreateContact(selfUserId.value, props.toUserId)
  const res = await getContact(selfUserId.value, props.toUserId)
  const newContact = res.data

  // newContact 需包含 id、toUserId、nickName、toUserAvatar 等字段

  contacts.value.unshift(newContact)
  activeContact.value = newContact
}

const getContact = async(fromUserId, toUserId) => {
  try {
    return await apiGetContact(fromUserId, toUserId)
  }catch(e) {
    console.error(e)
  }
}

const getMessageList = async () => {
  try {
    const res = await apiGetMessageList(selfUserId.value)
    contacts.value = res.data?.data || res.data || []
    userStore.unreadCount = contacts.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    await autoSelectContact()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  document.documentElement.style.overflowY = 'hidden'
  getMessageList()
})
onUnmounted(() => {
  document.documentElement.style.overflowY = ''
})

watch(
  () => userStore.messageBus,
  (msg) => {
    if (!msg || msg.type != "CHAT_MESSAGE") return

    console.log("msg.data.formUserId: ", msg.data.fromUserId)

    const contact = contacts.value.find(
      c => c.toUserId === msg.data.fromUserId
    )

    console.log("contact: ", contacts.value)

    if (contact) {
      contact.lastMessageTime = msg.data.gmtCreated
      if(!contact.unread) {
        contact.unread = 0
      }
      contact.unreadCount++
      userStore.unreadCount++
      console.log(contact)
    }
  }
)


</script>

<style scoped>
  
.chat-container {
  height: calc(100vh - 64px);
  background-color: #f5f5f5;
  
}

.h-100 {
  height: 80%;
}

/* 联系人列表样式 */
.contact-list-col {
  border-right: 1px solid #e0e0e0;
}

.contact-header {

  background-color: #1976d2;
  color: white;
}

.contact-items {
  padding: 0;
}

.contact-item {
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f5f5f5;
}

.contact-item.active {
  background-color: #e3f2fd;
}

.contact-name {
  font-weight: 600;
  font-size: 14px;
}

.contact-preview {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-time {
  font-size: 11px;
  color: #999;
}

/* 聊天区域样式 */
.chat-header {
  padding: 16px;
  background-color: white;
}

.contact-title {
  font-weight: 600;
  font-size: 16px;
}

.contact-status {
  font-size: 12px;
  color: #4caf50;
}

.messages-container {
  overflow-y: auto;
  padding: 16px;
  background-color: #fafafa;
}

.messages-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* 系统消息样式 */
.system-message {
  text-align: center;
  margin: 20px 0;
}

.system-content {
  display: inline-flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.live-notice .system-content {
  background: #fff3e0;
}

.activity-notice .system-content {
  flex-direction: column;
  align-items: center;
}

.award-content {
  margin-top: 8px;
  text-align: center;
}

.award-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 消息气泡样式 */
.message-bubble {
  margin: 8px 0;
  display: flex;
}

.message-bubble.send {
  justify-content: flex-end;
}

.message-bubble.receive {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  position: relative;
}

.message-bubble.send .message-content {
  background-color: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.receive .message-content {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-text {
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

/* 输入区域样式 */
.input-area {
  background: white;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.message-input :deep(.v-field) {
  border-radius: 24px;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
</style>