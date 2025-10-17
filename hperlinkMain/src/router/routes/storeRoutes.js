const storeRoutes = [
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default storeRoutes;
