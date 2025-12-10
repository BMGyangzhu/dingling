import { registerPlugins } from '@/plugins'
import videojs from "video.js"
import "video.js/dist/video-js.css";

import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'unfonts.css'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.config.globalProperties.$video = videojs

registerPlugins(app)

app.mount('#app')
