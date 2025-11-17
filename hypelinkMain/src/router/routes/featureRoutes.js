const featureRoutes = [
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('@/views/ShipmentTrackingView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/customer-analytics',
    name: 'customer-analytics',
    component: () => import('@/views/CustomerAnalyticsView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/communication',
    name: 'communication',
    component: () => import('@/views/CommunicationView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/pos-health',
    name: 'pos-health',
    component: () => import('@/views/POSHealthCheckView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/drivers',
    name: 'drivers',
    component: () => import('@/views/DriverManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RoleManagementView.vue'),
    meta: { roles: ['ADMIN'] }
  }
];

export default featureRoutes;