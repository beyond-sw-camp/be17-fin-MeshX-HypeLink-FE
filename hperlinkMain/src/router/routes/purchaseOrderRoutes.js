const purchaseOrderRoutes = [
  {
    path: '/purchase-orders',
    name: 'purchase-orders',
    component: () => import('@/views/PurchaseOrderView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default purchaseOrderRoutes;
