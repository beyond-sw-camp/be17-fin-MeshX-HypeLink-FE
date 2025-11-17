const customerAnalyticsRoutes = [
  {
    path: '/customer-analytics',
    name: 'customer-analytics',
    component: () => import('@/views/CustomerAnalyticsView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default customerAnalyticsRoutes;
