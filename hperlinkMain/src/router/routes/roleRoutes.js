const roleRoutes = [
  {
    path: '/roles',
    name: 'roles',
    component: () => import('@/views/RoleManagementView.vue'),
    meta: { roles: ['ADMIN'] }
  }
];

export default roleRoutes;
