const inventoryRoutes = [
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/views/InventoryManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default inventoryRoutes;
