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
import communicationRoutes from './routes/communicationRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import LoginView from '@/views/LoginView.vue';

// 스프레드 연산자(...)를 사용하여 모든 라우트를 하나의 배열로 합칩니다.
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
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
  ...communicationRoutes,
  ...couponRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active', // 활성 링크에 적용될 클래스
})

router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('../stores/auth.js');
  const { usePermissionStore } = await import('../stores/permissions.js');
  const { useModalStore } = await import('../stores/modal.js');
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  const modalStore = useModalStore();

  const requiresAuth = to.meta.requiresAuth !== false;
  const isLoggedIn = authStore.isLoggedIn;
  const userRole = authStore.user?.role;
  const routeName = to.name;

  // 로그인 페이지 접근 시
  if (routeName === 'login') {
    if (isLoggedIn) {
      return next({ path: '/' }); // 로그인 상태면 대시보드로
    }
    return next(); // 로그인 상태가 아니면 로그인 페이지로
  }

  // 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (requiresAuth && !isLoggedIn) {
    modalStore.show({ title: '로그인 필요', message: '로그인이 필요한 페이지입니다.' });
    return next({ name: 'login' });
  }

  // 인증된 사용자만 접근 가능한 페이지에 대한 권한 확인
  if (isLoggedIn && routeName && !permissionStore.canAccess(userRole, routeName)) {
    modalStore.show({ title: '권한 없음', message: '이 페이지에 접근할 권한이 없습니다.' });
    return next({ path: '/' }); // 권한 없으면 대시보드로 리다이렉트
  }

  next();
});

export default router
