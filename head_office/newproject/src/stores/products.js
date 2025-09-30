import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useProductStore = defineStore('products', () => {
  const allProducts = ref([
    { id: 1, code: 'P001', name: 'Hype-Tee', category: '상의', price: 35000 },
    { id: 2, code: 'P002', name: 'Link-Pants', category: '하의', price: 55000 },
    { id: 3, code: 'P003', name: 'Hyper-Jacket', category: '아우터', price: 89000 },
    { id: 4, code: 'P004', name: 'Mesh-Cap', category: '악세서리', price: 25000 },
  ]);

  const addProduct = (product) => {
    const newId = allProducts.value.length > 0 ? Math.max(...allProducts.value.map(p => p.id)) + 1 : 1;
    allProducts.value.push({ id: newId, ...product });
  };

  const updateProduct = (updatedProduct) => {
    const index = allProducts.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      allProducts.value[index] = { ...allProducts.value[index], ...updatedProduct };
    }
  };

  const deleteProduct = (id) => {
    allProducts.value = allProducts.value.filter(p => p.id !== id);
  };

  return { allProducts, addProduct, updateProduct, deleteProduct };
});
