import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useShipmentStore = defineStore('shipments', () => {
  const allShipments = ref([
    { id: 'HYP-001', driver: '김기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', location: [37.504, 127.024], item: 'Hype-Tee', qty: 50 },
    { id: 'HYP-002', driver: '이기사', from: '부산 물류센터', to: 'HypeLink 부산점', status: '지연', location: [35.163, 129.160], item: 'Link-Pants', qty: 30 },
    { id: 'HYP-003', driver: '박기사', from: '서울 본사', to: 'HypeLink 홍대점', status: '완료', location: [37.556, 126.922], item: 'Hyper-Jacket', qty: 20 },
    { id: 'HYP-004', driver: '최기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', location: [37.534, 126.990], item: 'Mesh-Cap', qty: 100 },
  ]);

  const createShipment = (shipmentDetails) => {
    const newId = `HYP-${String(allShipments.value.length + 1).padStart(3, '0')}`;
    const newShipment = {
      id: newId,
      ...shipmentDetails,
      status: '배송중',
      location: [37.566, 126.977] // 서울 시청 (출발지점)
    };
    allShipments.value.unshift(newShipment);
  };

  return { allShipments, createShipment };
});
