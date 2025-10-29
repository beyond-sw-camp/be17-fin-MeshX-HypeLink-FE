const warehouseInventoryRoutes = [
  {
    path: '/warehouse-inventory',
    name: 'warehouse-inventory',
    component: () => import('@/views/HeadPurchaseOrderView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default warehouseInventoryRoutes;
