import { ref } from 'vue';
import { defineStore } from 'pinia';
import { createCoupon, getAllCoupons, deleteCoupon as deleteCouponAPI } from '@/api/coupons';

export const useCouponStore = defineStore('coupons', () => {
  const allCoupons = ref([]);
  const isLoading = ref(false);

  // 전체 쿠폰 조회
  const fetchAllCoupons = async () => {
    isLoading.value = true;
    try {
      const response = await getAllCoupons();
      if (response.data && response.data.coupons) {
        // 백엔드 응답 형식을 프론트 형식으로 변환
        allCoupons.value = response.data.coupons.map(coupon => ({
          id: coupon.id,
          name: coupon.name,
          type: coupon.type, // PERCENTAGE -> Percentage 변환은 뷰에서 처리
          value: coupon.value,
          period: coupon.period,
        }));
      }
    } catch (error) {
      console.error('쿠폰 조회 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 쿠폰 추가
  const addCoupon = async (coupon) => {
    try {
      const response = await createCoupon(coupon);
      if (response.data) {
        // 추가 성공 후 목록 새로고침
        await fetchAllCoupons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('쿠폰 생성 실패:', error);
      return false;
    }
  };

  // 쿠폰 삭제
  const deleteCoupon = async (id) => {
    try {
      const response = await deleteCouponAPI(id);
      if (response.data) {
        // 삭제 성공 후 목록 새로고침
        await fetchAllCoupons();
        return true;
      }
      return false;
    } catch (error) {
      console.error('쿠폰 삭제 실패:', error);
      return false;
    }
  };

  return { allCoupons, isLoading, fetchAllCoupons, addCoupon, deleteCoupon };
});
