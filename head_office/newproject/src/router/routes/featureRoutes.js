const featureRoutes = [
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('@/views/ShipmentTrackingView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/customer-analytics',
    name: 'customer-analytics',
    component: () => import('@/views/CustomerAnalyticsView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/communication',
    name: 'communication',
    component: () => import('@/views/CommunicationView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/pos-health',
    name: 'pos-health',
    component: () => import('@/views/POSHealthCheckView.vue'),
    meta: { requiresAdmin: true }
  }
];

export default featureRoutes;