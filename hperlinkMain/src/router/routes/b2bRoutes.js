const b2bRoutes = [
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/views/InventoryManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/pos-support',
    name: 'pos-support',
    component: () => import('@/views/POSSupportView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('@/views/PromotionManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/promotions/:id',
    name: 'promotion-detail',
    component: () => import('@/views/PromotionDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/item/ProductManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/warehouse-inventory',
    name: 'warehouse-inventory',
    component: () => import('@/views/WarehouseInventoryView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/purchase-orders',
    name: 'purchase-orders',
    component: () => import('@/views/PurchaseOrderView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default b2bRoutes;
