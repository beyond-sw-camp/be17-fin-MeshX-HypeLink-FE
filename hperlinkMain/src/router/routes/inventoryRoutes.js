const inventoryRoutes = [
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/views/InventoryManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default inventoryRoutes;
