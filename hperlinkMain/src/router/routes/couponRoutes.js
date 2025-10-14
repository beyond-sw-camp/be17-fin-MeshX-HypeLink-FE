import CouponManagementView from '@/views/CouponManagementView.vue';

export default [
  {
    path: '/coupons',
    name: 'coupons',
    component: CouponManagementView,
    meta: { roles: ['super_admin', 'sub_admin'] },
  },
];
