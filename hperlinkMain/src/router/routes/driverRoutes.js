const driverRoutes = [
  {
    path: '/drivers',
    name: 'drivers',
    component: () => import('@/views/DriverManagementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin'] }
  }
];

export default driverRoutes;
