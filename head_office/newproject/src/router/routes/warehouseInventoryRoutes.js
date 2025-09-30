const warehouseInventoryRoutes = [
  {
    path: '/warehouse-inventory',
    name: 'warehouse-inventory',
    component: () => import('@/views/WarehouseInventoryView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default warehouseInventoryRoutes;
