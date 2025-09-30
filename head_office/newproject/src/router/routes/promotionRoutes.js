const promotionRoutes = [
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('@/views/PromotionManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  },
  {
    path: '/promotions/:id',
    name: 'promotion-detail',
    component: () => import('@/views/PromotionDetailView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default promotionRoutes;
