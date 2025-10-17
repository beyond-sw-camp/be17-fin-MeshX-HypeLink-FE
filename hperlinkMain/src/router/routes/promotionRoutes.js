const promotionRoutes = [
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('@/views/PromotionManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/promotions/:id',
    name: 'promotion-detail',
    component: () => import('@/views/PromotionDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default promotionRoutes;
