const baseRoutes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue') // 대시보드는 모든 역할이 접근 가능
  },
  {
    path: '/my-store',
    name: 'my-store',
    component: () => import('@/views/MyStoreView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default baseRoutes;