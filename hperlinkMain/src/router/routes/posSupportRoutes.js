const posSupportRoutes = [
  {
    path: '/pos-support',
    name: 'pos-support',
    component: () => import('@/views/POSSupportView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default posSupportRoutes;
