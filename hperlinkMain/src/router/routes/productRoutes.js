const productRoutes = [
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default productRoutes;
