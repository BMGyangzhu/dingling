import request from './request.js'

export const apiGetTypes = (data)  => {
    return request.get('/admin/type/page',{
        params: {
            page: data.page,
            limit: data.limit
        }
    })
}

export const apiAddType = (data) => {
    return request.post('/admin/type/', data)
}

export const apiEditType = (data) => {
    return request.put('/admin/type/', data);
}

export const apiDeleteType = (id) => {
    return request.delete(`/admin/type/${id}`)
}