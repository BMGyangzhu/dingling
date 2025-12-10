import request from './request.js'

export const apiGetSetting = () => {
    return request.get('/admin/setting')
}

export const apiEditSetting = (data) => {
    return request.put('/admin/setting/', data)
}