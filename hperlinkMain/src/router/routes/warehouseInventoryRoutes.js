const warehouseInventoryRoutes = [
  {
    path: '/warehouse-inventory',
    name: 'warehouse-inventory',
    component: () => import('@/views/WarehouseInventoryView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default warehouseInventoryRoutes;
