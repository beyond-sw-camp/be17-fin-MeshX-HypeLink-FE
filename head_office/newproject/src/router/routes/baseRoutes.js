const baseRoutes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue')
  },
  {
    path: '/my-store',
    name: 'my-store',
    component: () => import('@/views/MyStoreView.vue')
  }
];

export default baseRoutes;
