import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWarehouseStore = defineStore('warehouse', () => {
  const allInventory = ref([
    { id: 1, code: 'P001', name: 'Hype-Tee', category: '상의', currentStock: 500, safeStock: 100 },
    { id: 2, code: 'P002', name: 'Link-Pants', category: '하의', currentStock: 200, safeStock: 50 },
    { id: 3, code: 'P003', name: 'Hyper-Jacket', category: '아우터', currentStock: 80, safeStock: 30 },
    { id: 4, code: 'P004', name: 'Mesh-Cap', category: '악세서리', currentStock: 0, safeStock: 20 },
    { id: 5, code: 'P005', name: 'Logo Socks', category: '악세서리', currentStock: 300, safeStock: 50 },
  ]);

  const suppliers = ref([
    '패션원단공급', '의류부자재', '액세서리제작'
  ]);

  const submitHeadOfficeOrder = (order) => {
    const product = allInventory.value.find(item => item.id === order.productId);
    if (product) {
      product.currentStock += order.quantity;
    }
  };

  return { allInventory, suppliers, submitHeadOfficeOrder };
});
