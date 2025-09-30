const productRoutes = [
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default productRoutes;
