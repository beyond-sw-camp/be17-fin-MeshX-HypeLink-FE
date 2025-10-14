const storeRoutes = [
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default storeRoutes;
