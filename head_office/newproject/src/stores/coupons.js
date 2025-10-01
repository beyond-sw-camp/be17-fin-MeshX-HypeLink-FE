import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useCouponStore = defineStore('coupons', () => {
  const allCoupons = ref([
    { id: 1, name: '신규 가입 10% 할인 쿠폰', type: 'Percentage', value: 10, expiryDate: '2025-12-31' },
    { id: 2, name: '5,000원 할인 쿠폰', type: 'Fixed', value: 5000, expiryDate: '2025-11-30' },
    { id: 3, name: '아우터 20% 특별 할인', type: 'Percentage', value: 20, expiryDate: '2025-10-31' },
  ]);

  const addCoupon = (coupon) => {
    const newId = allCoupons.value.length > 0 ? Math.max(...allCoupons.value.map(c => c.id)) + 1 : 1;
    allCoupons.value.push({ id: newId, ...coupon });
  };

  const deleteCoupon = (id) => {
    allCoupons.value = allCoupons.value.filter(c => c.id !== id);
  };

  return { allCoupons, addCoupon, deleteCoupon };
});
