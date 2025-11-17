const analyticsRoutes = [
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsDashboardView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/analytics/sales',
    name: 'analytics-sales',
    component: () => import('@/views/SalesDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/analytics/orders',
    name: 'analytics-orders',
    component: () => import('@/views/OrdersDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/analytics/stores',
    name: 'analytics-stores',
    component: () => import('@/views/StoresDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/analytics/products',
    name: 'analytics-products',
    component: () => import('@/views/ProductsDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/analytics/inventory',
    name: 'analytics-inventory',
    component: () => import('@/views/InventoryDetailView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default analyticsRoutes;
