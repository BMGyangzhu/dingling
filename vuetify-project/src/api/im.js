import request from './imrequest'

export const apiGetMessageList = (id) => {
    return request.get(`/getMessageLists/${id}`)
}

export const apiCreateContact = (fromUserId, toUserId) => {
    return request.post('/addContact', 
        {
            userId: fromUserId,
            toUserId
        }
    )
}

export const apiGetContact = (fromUserId, toUserId) => {
    return request.post('/getMessageList',
        {
            userId: fromUserId,
            toUserId
        }
    )
}

export const apiMarkMessagesAsRead = (userId, toUserId) => {
    return request.post(`/readAll?userId=${userId}&toUserId=${toUserId}`)
}

export const apiGetHistory = (user1, user2) => {
    return request.get('/history',{
        params: {
            user1,
            user2
        }
    })
}

export const apiGetUnread = (userId) => {
    return request.get('/unread',{
        params:{
            userId
        }
    })
}