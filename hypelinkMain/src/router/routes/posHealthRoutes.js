const posHealthRoutes = [
  {
    path: '/pos-health',
    name: 'pos-health',
    component: () => import('@/views/POSHealthCheckView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default posHealthRoutes;
