import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useOrderStore = defineStore('orders', () => {
  const allOrders = ref([
    { id: 1, productId: 1, productName: 'Hype-Tee', quantity: 50, requestDate: '2025-09-29', status: '요청 완료', storeName: 'HypeLink 강남점' },
    { id: 2, productId: 2, productName: 'Link-Pants', quantity: 30, requestDate: '2025-09-28', status: '처리중', storeName: 'HypeLink 강남점' },
    { id: 3, productId: 1, productName: 'Hype-Tee', quantity: 20, requestDate: '2025-09-27', status: '요청 완료', storeName: 'HypeLink 홍대점' },
    { id: 4, productId: 3, productName: 'Hyper-Jacket', quantity: 10, requestDate: '2025-09-26', status: '취소', storeName: 'HypeLink 부산점' },
  ]);

  const submitOrder = (order) => {
    allOrders.value.push({
      id: allOrders.value.length + 1,
      ...order,
      requestDate: new Date().toISOString().slice(0, 10),
      status: '요청 완료',
    });
  };

  const updateOrderStatus = (id, newStatus) => {
    const order = allOrders.value.find(o => o.id === id);
    if (order) {
      order.status = newStatus;
    }
  };

  return { allOrders, submitOrder, updateOrderStatus };
});
