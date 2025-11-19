const salesRoutes = [
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default salesRoutes;
