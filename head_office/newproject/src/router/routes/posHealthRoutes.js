const posHealthRoutes = [
  {
    path: '/pos-health',
    name: 'pos-health',
    component: () => import('@/views/POSHealthCheckView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default posHealthRoutes;
