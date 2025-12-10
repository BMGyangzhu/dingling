import request from './request.js'

export const apiGetUsers = (data)  => {
    return request.get('/admin/user/page',{
        params: {
            page: data.page,
            limit: data.limit
        }
    })
}

export const apiAddUser = (data) => {
    return request.post('/admin/user/', data)
}

export const apiEditUser = (data) => {
    return request.put('/admin/user/', data);
}

export const apiDeleteUser = (id) => {
    return request.delete(`/admin/user/${id}`)
}