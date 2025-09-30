const b2bRoutes = [
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreManagementView.vue')
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/views/InventoryManagementView.vue')
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesManagementView.vue')
  },
  {
    path: '/pos-support',
    name: 'pos-support',
    component: () => import('@/views/POSSupportView.vue')
  }
];

export default b2bRoutes;
