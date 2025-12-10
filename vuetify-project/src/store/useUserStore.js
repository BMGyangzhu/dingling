import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { apiMarkMessagesAsRead } from '@/api/im'

export default defineStore('user', () => {
  // 用户信息
  const info = reactive({})
  const token = ref(sessionStorage.getItem("token"))
  const lookId = ref(null)

  // WebSocket 实例
  const ws = ref(null)

  // 消息相关
  const unreadCount = ref(0) // 全局未读数
  const conversationUnread = reactive({}) // 每个联系人未读数 { userId: count }
  const messageBus = ref(null) // 最新消息总线

  // 通知
  const notifyQueue = reactive([])

  // 设置 ws
  const setWebSocket = (socket) => {
    ws.value = socket
  }

  // 触发消息总线
  const emitMessage = (msg) => {
    messageBus.value = msg
  }

  // 推送通知
  const pushNotify = (notify) => {
    notifyQueue.push(notify)
  }

  const popNotify = () => {
    notifyQueue.shift()
  }

  /** ================== 未读消息相关 ================== */

  // 增加指定联系人未读数
  const addUnread = (fromUserId) => {
    if (!conversationUnread[fromUserId]) conversationUnread[fromUserId] = 0
    conversationUnread[fromUserId]++
    unreadCount.value++
  }

  // 清空指定联系人未读
  const clearUnreadByUserId = async (fromUserId) => {
  const count = conversationUnread[fromUserId] || 0
  unreadCount.value -= count
  conversationUnread[fromUserId] = 0

  // 调用后端批量标记已读
  if (fromUserId) {
    try {
      // 这里传两个参数：当前用户 ID 和要清零的联系人 ID
      await apiMarkMessagesAsRead(fromUserId, info.id)
    } catch (err) {
      console.error('标记已读失败', err)
    }
  }
}

  return {
    info,
    token,
    lookId,
    ws,
    unreadCount,
    conversationUnread,
    messageBus,
    notifyQueue,

    setWebSocket,
    emitMessage,
    addUnread,
    clearUnreadByUserId,
    pushNotify,
    popNotify
  }
})
