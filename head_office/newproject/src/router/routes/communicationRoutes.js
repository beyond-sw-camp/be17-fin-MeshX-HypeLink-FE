const communicationRoutes = [
  {
    path: '/messenger',
    name: 'messenger',
    component: () => import('@/views/MessengerView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  },
  {
    path: '/announcements',
    name: 'announcements',
    component: () => import('@/views/AnnouncementView.vue'),
    meta: { roles: ['super_admin', 'sub_admin', 'store_manager'] }
  }
];

export default communicationRoutes;