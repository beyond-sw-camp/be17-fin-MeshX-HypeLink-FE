import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useShipmentStore = defineStore('shipments', () => {
  const allShipments = ref([
    { driverId: 'HYP-001', name: '김기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', latitude: 37.504, longitude: 127.024, item: 'Hype-Tee', qty: 50 },
    { driverId: 'HYP-002', name: '이기사', from: '부산 물류센터', to: 'HypeLink 부산점', status: '지연', latitude: 35.163, longitude: 129.160, item: 'Link-Pants', qty: 30 },
    { driverId: 'HYP-003', name: '박기사', from: '서울 본사', to: 'HypeLink 홍대점', status: '완료', latitude: 37.556, longitude: 126.922, item: 'Hyper-Jacket', qty: 20 },
    { driverId: 'HYP-004', name: '최기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', latitude: 37.534, longitude: 126.990, item: 'Mesh-Cap', qty: 100 },
  ]);

  // 신규 배송 생성
  const createShipment = (shipmentDetails) => {
    const newId = `HYP-${String(allShipments.value.length + 1).padStart(3, '0')}`;
    const newShipment = {
      driverId: newId,
      ...shipmentDetails,
      status: '배송중',
      latitude: 37.566,   // 서울 시청 (출발지점)
      longitude: 126.977
    };
    allShipments.value.unshift(newShipment);
  };

  // 기사 위치 업데이트 (WebSocket 데이터 반영)
  const updateDriverLocation = (driverData) => {
    const idx = allShipments.value.findIndex(s => s.driverId === driverData.driverId);
    if (idx !== -1) {
      allShipments.value[idx] = {
        ...allShipments.value[idx],
        status: driverData.status,
        latitude: driverData.latitude,
        longitude: driverData.longitude
      };
    } else {
      // 기존에 없는 기사라면 신규 추가
      allShipments.value.push({
        driverId: driverData.driverId,
        name: driverData.name,
        from: '알 수 없음',
        to: '알 수 없음',
        status: driverData.status,
        latitude: driverData.latitude,
        longitude: driverData.longitude,
        item: 'Unknown',
        qty: 0
      });
    }
  };

  return { allShipments, createShipment, updateDriverLocation };
});
