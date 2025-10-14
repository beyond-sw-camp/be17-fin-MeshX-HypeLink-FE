const trackingRoutes = [
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('@/views/ShipmentTrackingView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default trackingRoutes;
