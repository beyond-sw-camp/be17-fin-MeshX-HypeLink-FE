const storeRoutes = [
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreManagementView.vue'),
    meta: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: '/pos-management',
    name: 'pos-management',
    component: () => import('@/views/PosManagementView.vue'),
    meta: { 
      title: 'POS 기기 관리',
      roles: ['ADMIN', 'MANAGER'] 
    }
  },
  {
    path: '/my-store',
    name: 'my-store',
    component: () => import('@/views/MyStoreView.vue'),
    meta: { 
      title: '내 점포 관리',
      roles: ['BRANCH_MANAGER'] 
    }
  },
  {
    path: '/store-detail/:id',
    name: 'store-detail',
    component: () => import('@/views/MyStoreView.vue'),
    meta: { 
      title: '점포 상세 정보',
      roles: ['ADMIN', 'MANAGER'] 
    }
  }
];

export default storeRoutes;