const roleRoutes = [
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RoleManagementView.vue'),
    meta: { roles: ['super_admin'] }
  }
];

export default roleRoutes;
