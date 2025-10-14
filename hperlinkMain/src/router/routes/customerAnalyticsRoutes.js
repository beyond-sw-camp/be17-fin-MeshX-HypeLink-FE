const customerAnalyticsRoutes = [
  {
    path: '/customer-analytics',
    name: 'customer-analytics',
    component: () => import('@/views/CustomerAnalyticsView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default customerAnalyticsRoutes;
