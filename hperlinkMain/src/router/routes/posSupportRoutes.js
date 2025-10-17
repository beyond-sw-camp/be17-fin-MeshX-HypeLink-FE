const posSupportRoutes = [
  {
    path: '/pos-support',
    name: 'pos-support',
    component: () => import('@/views/POSSupportView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default posSupportRoutes;
