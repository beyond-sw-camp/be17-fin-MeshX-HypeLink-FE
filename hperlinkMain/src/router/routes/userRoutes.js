const userRoutes = [
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { roles: ['super_admin'] } // 총괄 관리자만 접근 가능
  }
];

export default userRoutes;
