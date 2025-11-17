const asRoutes = [
  {
    path: '/as',
    name: 'asList',
    component: () => import('@/views/as/AsListView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] } // All roles can view list
  },
  {
    path: '/as/create',
    name: 'asCreate',
    component: () => import('@/views/as/AsCreateView.vue'),
    meta: { requiresAuth: true, roles: ['BRANCH_MANAGER'] } // Only BRANCH_MANAGER can create
  },
  {
    path: '/as/:id',
    name: 'asDetail',
    component: () => import('@/views/as/AsDetailView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] } // All roles can view detail
  }
];

export default asRoutes;
