import { ref } from 'vue';
import { defineStore } from 'pinia';
import { createCoupon, getAllCoupons, deleteCoupon as deleteCouponAPI, updateCoupon as updateCouponAPI } from '@/api/coupons';

export const useCouponStore = defineStore('coupons', () => {
  const allCoupons = ref([]);
  const isLoading = ref(false);
  const totalPages = ref(0);
  const totalElements = ref(0);
  const currentPage = ref(0);
  const pageSize = ref(10);

  // 전체 쿠폰 조회 (페이징)
  const fetchAllCoupons = async (page = 0, size = 10) => {
    isLoading.value = true;
    try {
      const response = await getAllCoupons(page, size);
      if (response.data && response.data.couponInfoResList) {
        // 백엔드 응답 형식을 프론트 형식으로 변환
        allCoupons.value = response.data.couponInfoResList.map(coupon => ({
          id: coupon.id,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          period: coupon.period,
        }));
        totalPages.value = response.data.totalPages || 0;
        totalElements.value = response.data.totalElements || 0;
        currentPage.value = response.data.currentPage || 0;
        pageSize.value = response.data.pageSize || size;
      }
    } catch (error) {
      console.error('쿠폰 조회 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 쿠폰 추가
  const addCoupon = async (coupon, page = 0) => {
    try {
      const response = await createCoupon(coupon);
      if (response.data) {
        // 추가 성공 후 목록 새로고침
        await fetchAllCoupons(page, pageSize.value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('쿠폰 생성 실패:', error);
      return false;
    }
  };

  // 쿠폰 삭제
  const deleteCoupon = async (id, page = 0) => {
    try {
      const response = await deleteCouponAPI(id);
      if (response.data) {
        // 삭제 성공 후 목록 새로고침
        await fetchAllCoupons(page, pageSize.value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('쿠폰 삭제 실패:', error);
      return false;
    }
  };

  // 쿠폰 수정
  const updateCoupon = async (id, coupon, page = 0) => {
    try {
      const response = await updateCouponAPI(id, coupon);
      if (response.data) {
        // 수정 성공 후 목록 새로고침
        await fetchAllCoupons(page, pageSize.value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('쿠폰 수정 실패:', error);
      return false;
    }
  };

  return { allCoupons, isLoading, totalPages, totalElements, currentPage, pageSize, fetchAllCoupons, addCoupon, deleteCoupon, updateCoupon };
});
