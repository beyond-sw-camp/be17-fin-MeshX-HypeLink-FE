import { ref } from 'vue';
import { defineStore } from 'pinia';

export const usePromotionStore = defineStore('promotions', () => {
  const allPromotions = ref([
    { 
      id: 1, 
      name: '신학기 맞이 10% 할인', 
      period: '2025-03-01 ~ 2025-03-31', 
      target: '전체 고객', 
      status: '진행중',
      description: '새 학기를 맞아 모든 상품 10% 할인 프로모션 진행',
      salesImpact: { 
        labels: ['2월', '3월', '4월'], 
        before: [100, 110, 105], 
        during: [120, 150, 140], 
        after: [115, 125, 120] 
      }
    },
    { 
      id: 2, 
      name: '여름맞이 특별 세일', 
      period: '2024-07-01 ~ 2024-07-31', 
      target: '온라인 구매 고객', 
      status: '종료',
      description: '여름 시즌 상품 최대 30% 할인 프로모션',
      salesImpact: { 
        labels: ['6월', '7월', '8월'], 
        before: [90, 95, 88], 
        during: [130, 160, 150], 
        after: [100, 105, 98] 
      }
    },
  ]);

  const addPromotion = (promotion) => {
    const newId = allPromotions.value.length > 0 ? Math.max(...allPromotions.value.map(p => p.id)) + 1 : 1;
    allPromotions.value.unshift({ id: newId, ...promotion });
  };

  const updatePromotion = (updatedPromo) => {
    const index = allPromotions.value.findIndex(p => p.id === updatedPromo.id);
    if (index !== -1) {
      allPromotions.value[index] = { ...allPromotions.value[index], ...updatedPromo };
    }
  };

  const deletePromotion = (id) => {
    allPromotions.value = allPromotions.value.filter(p => p.id !== id);
  };

  return { allPromotions, addPromotion, updatePromotion, deletePromotion };
});
