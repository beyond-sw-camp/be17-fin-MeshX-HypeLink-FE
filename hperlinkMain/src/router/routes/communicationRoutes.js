import AnnouncementDetailView from '@/views/AnnouncementDetailView.vue';

const communicationRoutes = [
  {
    path: '/messenger',
    name: 'messenger',
    component: () => import('@/views/MessengerView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/announcements',
    name: 'announcements',
    component: () => import('@/views/AnnouncementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  },
  {
    path: '/announcements/:id',
    name: 'announcement-detail',
    component: AnnouncementDetailView,
    meta: { roles: ['ADMIN', 'MANAGER', 'BRANCH_MANAGER'] }
  }
];

export default communicationRoutes;