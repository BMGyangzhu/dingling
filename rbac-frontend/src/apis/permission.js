import request from './request.js'

export const apiGetMenus = () => {
    return request.get('/authorize/permission/initMenu')
}

export const apiGetPermissions = () => {
    return request.get('/authorize/permission/list')
}

export const apiGetPermissionCascader = () => {
    return request.get('/authorize/permission/treeSelect')
}

export const apiAddPermission = (data) => {
    return request.post('/authorize/permission/', data)
}

export const apiEditPermission = (data) => {
    return request.put('/authorize/permission/', data)
}

export const apiDeletePermission = (id) => {
    return request.delete(`/authorize/permission/${id}`)
}

