const userRoutes = [
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { roles: ['ADMIN'] } // 총괄 관리자만 접근 가능
  }
];

export default userRoutes;
