import { createRouter, createWebHistory } from 'vue-router'

// 도메인별 라우트 파일을 import 합니다.
import baseRoutes from './routes/baseRoutes.js'
import b2bRoutes from './routes/b2bRoutes.js'
import featureRoutes from './routes/featureRoutes.js'

// 스프레드 연산자(...)를 사용하여 모든 라우트를 하나의 배열로 합칩니다.
const routes = [
  ...baseRoutes,
  ...b2bRoutes,
  ...featureRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active', // 활성 링크에 적용될 클래스 (AppSidebar.vue의 .active와 일치)
})

export default router
