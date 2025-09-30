const salesRoutes = [
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default salesRoutes;
