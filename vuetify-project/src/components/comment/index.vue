<template>
    <div>
        <div class="comment-list" ref="commentList" @scroll="onScroll" @wheel.stop>

            <div class="comment-item" v-for="comment in rootComments" :key="comment.id">
                <div class="comment-item-avatar">
                    <v-avatar :image="apiFileGet(comment.fromUserAvatar) || '@/assets/logo.png'"></v-avatar>
                </div>
                <div class="comment-item-main">
                    <div class="comment-item-username">{{ comment.fromUserName }}</div>
                    <div class="comment-item-content">{{ comment.content }}</div>
                    <div class="comment-item-time">{{ comment.gmtCreated }}</div>

                    <div class="comment-item-actions">
                        <v-btn variant="plain" prepend-icon="mdi-comment" size="x-small" @click="reply(comment)">
                            回复
                        </v-btn>
                        <v-btn variant="plain" prepend-icon="mdi-heart" size="x-small" @click="like(comment)">
                            {{ comment.likeCount }}
                        </v-btn>
                    </div>
                    <!-- 二级评论 -->
                    <div class="comment-item" v-for="childComment in comment.children" :key="childComment.id">

                        <div class="comment-item-avatar">
                            <v-avatar
                                :image="apiFileGet(childComment.fromUserAvatar) || '@/assets/logo.png'"></v-avatar>
                        </div>

                        <div class="comment-item-main">
                            <div class="comment-item-username">
                                <span> {{ childComment.fromUserName }} </span>
                                <span v-if="childComment.toUserId && childComment.toUserId !== comment.fromUserId">
                                    => {{ childComment.toUserName }}
                                </span>
                            </div>
                            <div class="comment-item-content">{{ childComment.content }}</div>
                            <div class="comment-item-time">{{ comment.gmtCreated }}</div>

                            <div class="comment-item-actions">
                                <v-btn variant="plain" prepend-icon="mdi-comment" size="x-small"
                                    @click="reply(childComment)">
                                    回复
                                </v-btn>
                                <v-btn variant="plain" prepend-icon="mdi-heart" size="x-small"
                                    @click="like(childComment)">
                                    {{ childComment.likeCount }}
                                </v-btn>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
            <v-snackbar v-model="snackbar.show" :color="snackbar.color">
                {{ snackbar.text }}

                <template v-slot:actions>
                    <v-btn color="blue" variant="text" @click="snackbar.show = false">
                        了解
                    </v-btn>
                </template>
            </v-snackbar>
        </div>
        <!-- 回复输入框 -->
        <div class="reply-box">
            <v-textarea v-model="replyContent" rows="1" auto-grow density="compact" variant="outlined"
                :placeholder="replyPlaceholder" hide-details rounded />

            <v-btn color="primary" size="small" :disabled="!replyContent.trim()" @click="submitReply">
                发送
            </v-btn>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { apiFileGet } from '@/api/file';
import { apiGetRootComments, apiPushComment, apiLikeComment } from '@/api/comment';

const props = defineProps({
    videoId: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
})
const emits = defineEmits(['update:total'])

const allCommentsLength = computed(() => {
    return rootComments.value.reduce((sum, c) => sum + 1 + (c.children?.length || 0), 0)
})
const rootComments = ref([])
const replyContent = ref('')
const replyTarget = ref(null)
const replyPlaceholder = computed(() => {
    return replyTarget.value ? `回复 @${replyTarget.value.fromUserName}` : '说点什么吧...'
})
const currentPage = ref(1)
const pageSize = 10
const hasMore = ref(true)
// const totalCount = ref(props.total)
const loading = ref(false)
const commentList = ref(null)
const snackbar = ref({
    show: false,
    text: ""
})
const dataPages = ref()

const reply = (comment) => {
    replyTarget.value = comment

}
const like = async (comment) => {
    try {
        const res = await apiLikeComment(comment.id)
        snackbar.value = {
            show: true,
            text: res.data.message
        }
        if (res.data.message == '已点赞') {
            comment.likeCount++
        } else {
            comment.likeCount--
        }
    } catch (e) {
        console.error(e)
    }
}

// 加载分页评论
const loadComments = async () => {
    console.log("hasMore.value: ", hasMore.value)
    if (!hasMore.value || loading.value) return

    loading.value = true
    try {
        const res = await apiGetRootComments(props.videoId, currentPage.value, pageSize)
        dataPages.value = res.data.data.pages
        const newComments = res.data.data.records
        rootComments.value.push(...newComments)

        if (currentPage.value >= res.data.data.pages) {
            hasMore.value = false
        } else {
            currentPage.value += 1
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// 提交回复
const submitReply = async () => {
    if (!replyContent.value.trim()) return

    const content = replyContent.value.trim()

    // 一级评论和回复统一调用
    if (!replyTarget.value) await loadAllComments()
    const res = await apiPushComment(
        props.videoId,                              // videoId
        replyTarget.value ? replyTarget.value.id : 0,       // parentId
        replyTarget.value ? replyTarget.value.rootId : 0,  // rootId
        replyTarget.value ? replyTarget.value.fromUserId : 0, // toUserId
        content
    )

    const newComment = res.data.data


    if (!replyTarget.value) {
        // 一级评论：乐观追加到末尾

        // await loadAllComments() // 确保分页加载完
        rootComments.value.push({ ...newComment, children: [] })
        await scrollToBottom()
        emits('update:total', 1)

    } else {
        // 二级评论：追加到对应一级评论 children
        console.log("replayTarget: ", replyTarget.value)
        const parent = rootComments.value.find(c => c.id == replyTarget.value.rootId);
        console.log("回复二级评论：", parent)
        console.log("replayTarget.value.rootId: ", replyTarget.value.rootId)

        parent.children.push(newComment);
        emits('update:total', 1)
    }

    // 清空输入框
    replyContent.value = ''
    replyTarget.value = null

    // 可以刷新评论列表
    // await getRootComments()
}
// 滚动监听
const onScroll = () => {

    const el = commentList.value

    if (!el) return

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        loadComments()
    }
}
const getRootComments = async () => {
    try {
        const res = await apiGetRootComments(props.videoId)
        rootComments.value = res.data.data.records

    } catch (e) {
        console.error(e)
    }
}

const loadAllComments = async () => {

    while (hasMore.value) {
        await loadComments()
    }
}
const scrollToBottom = async () => {
    await nextTick()
    const el = commentList.value
    if (!el) return

    // 滚动到最底部
    el.scrollTop = el.scrollHeight
}

// watch(
//   () => totalCount.value,
//   (newVal, oldVal) => {
//     console.log('totalCount:', newVal)
//     console.log('rootComments.length:', rootComments.value.length)
//     hasMore.value = rootComments.value.length < newVal
//     console.log('hasMore:', hasMore.value)
//   }
// )
onMounted(() => {
    loadComments()
})




</script>

<style scoped>
.comment-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    /*height: 100%;*/
    height: calc(100vh - 200px);
    /* 预留给你回复框 */
    padding-bottom: 60px;
}

.comment-item {
    display: flex;
    width: 100%;
    margin-bottom: 12px;
}

.comment-item-avatar {
    margin-right: 8px;
}

.comment-item-main {
    flex: 1;
}

.comment-item-username {
    font-weight: bold;
    margin-bottom: 4px;
}

.comment-item-content {
    margin-bottom: 4px;
}

.comment-item-time {
    font-size: 13px;
    color: #999;
    margin-top: 4px;
}

.comment-item-actions v-btn {
    margin-right: 8px;
}

.two-level-comment {
    display: flex;
    width: 90%;
    margin-left: 10px;
}

.reply-box {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: white;
    border-top: 1px solid #eee;
    z-index: 10;
}
</style>