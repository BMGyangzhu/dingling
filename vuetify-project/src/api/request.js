import { useUserStore } from '@/store'
import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 添加拦截器
instance.interceptors.request.use(config => {
    const userStore = useUserStore()
    if (userStore.$state.token)
        config.headers.token = userStore.$state.token
    return config
}, error => {
    return Promise.reject(error)
})

export default instance;