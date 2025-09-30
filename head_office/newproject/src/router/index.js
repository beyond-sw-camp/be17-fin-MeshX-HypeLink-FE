import { createRouter, createWebHistory } from 'vue-router'

// 도메인별 라우트 파일을 import 합니다.
import baseRoutes from './routes/baseRoutes.js'
import userRoutes from './routes/userRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import posSupportRoutes from './routes/posSupportRoutes.js'
import promotionRoutes from './routes/promotionRoutes.js'
import productRoutes from './routes/productRoutes.js'
import warehouseInventoryRoutes from './routes/warehouseInventoryRoutes.js'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js'
import trackingRoutes from './routes/trackingRoutes.js'
import customerAnalyticsRoutes from './routes/customerAnalyticsRoutes.js'
import posHealthRoutes from './routes/posHealthRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import roleRoutes from './routes/roleRoutes.js'
import communicationRoutes from './routes/communicationRoutes.js'

// 스프레드 연산자(...)를 사용하여 모든 라우트를 하나의 배열로 합칩니다.
const routes = [
  ...baseRoutes,
  ...userRoutes,
  ...storeRoutes,
  ...inventoryRoutes,
  ...salesRoutes,
  ...posSupportRoutes,
  ...promotionRoutes,
  ...productRoutes,
  ...warehouseInventoryRoutes,
  ...purchaseOrderRoutes,
  ...trackingRoutes,
  ...customerAnalyticsRoutes,
  ...posHealthRoutes,
  ...driverRoutes,
  ...roleRoutes,
  ...communicationRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active', // 활성 링크에 적용될 클래스
})

export default router
