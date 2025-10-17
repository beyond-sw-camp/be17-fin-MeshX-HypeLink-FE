const trackingRoutes = [
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('@/views/ShipmentTrackingView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default trackingRoutes;
