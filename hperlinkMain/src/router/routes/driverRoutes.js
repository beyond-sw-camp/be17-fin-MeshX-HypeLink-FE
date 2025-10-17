const driverRoutes = [
  {
    path: '/drivers',
    name: 'drivers',
    component: () => import('@/views/DriverManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  }
];

export default driverRoutes;
