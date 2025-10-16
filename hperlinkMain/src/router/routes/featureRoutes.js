const featureRoutes = [
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('@/views/ShipmentTrackingView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  },
  {
    path: '/customer-analytics',
    name: 'customer-analytics',
    component: () => import('@/views/CustomerAnalyticsView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  },
  {
    path: '/communication',
    name: 'communication',
    component: () => import('@/views/CommunicationView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  },
  {
    path: '/pos-health',
    name: 'pos-health',
    component: () => import('@/views/POSHealthCheckView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  },
  {
    path: '/drivers',
    name: 'drivers',
    component: () => import('@/views/DriverManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RoleManagementView.vue'),
    meta: { roles: ['super_admin'] }
  }
];

export default featureRoutes;