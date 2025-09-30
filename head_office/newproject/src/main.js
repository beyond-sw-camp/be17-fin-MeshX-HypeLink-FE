import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Bootstrap CSS 및 JS import
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// 전역 스타일 import
import './assets/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
