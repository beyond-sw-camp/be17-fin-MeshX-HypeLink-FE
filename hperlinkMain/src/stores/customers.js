import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useCustomerStore = defineStore('customers', () => {
  const allCustomers = ref([
    { id: 1, name: '김철수', ageGroup: '20대', isMember: true, totalPurchases: 150000, lastPurchase: '2025-09-25', purchaseHistory: [{ category: '하의', amount: 55000 }, { category: '상의', amount: 95000 }] },
    { id: 2, name: '이영희', ageGroup: '30대', isMember: true, totalPurchases: 200000, lastPurchase: '2025-09-20', purchaseHistory: [{ category: '아우터', amount: 200000 }] },
    { id: 3, name: '박민수', ageGroup: '20대', isMember: false, totalPurchases: 80000, lastPurchase: '2025-09-28', purchaseHistory: [{ category: '상의', amount: 80000 }] },
    { id: 4, name: '최지영', ageGroup: '40대', isMember: true, totalPurchases: 300000, lastPurchase: '2025-09-15', purchaseHistory: [{ category: '악세서리', amount: 300000 }] },
    { id: 5, name: '정현우', ageGroup: '10대', isMember: true, totalPurchases: 50000, lastPurchase: '2025-09-29', purchaseHistory: [{ category: '상의', amount: 50000 }] },
  ]);

  const topItemsByAge = {
    '10대': [
      { name: 'Hype-Tee (Black)', sales: 1200 },
      { name: 'Mesh-Cap (White)', sales: 950 },
    ],
    '20대': [
      { name: 'Link-Pants (Beige)', sales: 2500 },
      { name: 'Hype-Tee (White)', sales: 2100 },
      { name: 'Hyper-Jacket (Khaki)', sales: 1800 },
      { name: 'Mesh-Cap (Black)', sales: 1500 },
      { name: 'Logo Socks (3-pack)', sales: 1200 },
    ],
    '30대': [
      { name: 'Hyper-Jacket (Black)', sales: 1900 },
      { name: 'Link-Pants (Black)', sales: 1500 },
    ],
    '40대': [
      { name: 'Classic-Polo', sales: 800 },
    ],
    '50대 이상': [
      { name: 'Comfort-Pants', sales: 600 },
    ]
  };

  const topItemsByCategory = {
    '상의': [{ name: 'Hype-Tee (White)', sales: 3100 }, { name: 'Classic-Polo', sales: 1800 }],
    '하의': [{ name: 'Link-Pants (Beige)', sales: 2800 }, { name: 'Link-Pants (Black)', sales: 1900 }],
    '아우터': [{ name: 'Hyper-Jacket (Khaki)', sales: 2200 }, { name: 'Hyper-Jacket (Black)', sales: 2100 }],
    '악세서리': [{ name: 'Mesh-Cap (Black)', sales: 1800 }, { name: 'Logo Socks (3-pack)', sales: 1500 }]
  };

  return { allCustomers, topItemsByAge, topItemsByCategory };
});
