import request from './request'

export const apiGetRootComments = (videoId, page = 1, size = 5) => {
  return request.get('/comment/root', {
    params: {
      videoId,
      current: page,
      size
    }
  })
}

export const apiPushComment = (videoId, parentId, rootId, toUserId, content) => {
  return request.post('/comment', null, {
    params: {
      videoId,
      parentId,
      rootId,
      toUserId,
      content
    }
  })
}

export const apiLikeComment = (commentId) => {
    return request.post(`/comment/like/${commentId}`)
}