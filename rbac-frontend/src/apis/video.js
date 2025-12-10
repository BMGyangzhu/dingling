import request from './request.js'

export const apiGetVideos = (data) => {
  return request.get('/admin/video/page', {
    params: {
      page: data.page,
      limit: data.limit,
      YV: data.YV || '',       // 传入 YV 搜索条件
      title: data.title || ''  // 传入 title 搜索条件
    }
  })
}

export const apiEditVideo = (data) => {
    return request.put('/admin/video/', data)
}

export const apiDeleteVideo = (id, userId) => {
    return request.delete(`/admin/video/${id}/${userId}`)
}

export const apiAuditVideo = (data) => {
    return request.post('/admin/video/audit', data)
} 


export const apiViolation = (id) => {
    return request.post(`/admin/video/violations/${id}`)
}