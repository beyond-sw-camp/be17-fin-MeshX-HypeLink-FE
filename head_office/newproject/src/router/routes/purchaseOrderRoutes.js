const purchaseOrderRoutes = [
  {
    path: '/purchase-orders',
    name: 'purchase-orders',
    component: () => import('@/views/PurchaseOrderView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default purchaseOrderRoutes;
