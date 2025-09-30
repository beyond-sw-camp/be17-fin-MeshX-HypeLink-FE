<template>
  <div>
    <InventoryList :inventory="filteredInventory" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import InventoryList from './inventory-management/InventoryList.vue';
const authStore = useAuthStore();
const allInventory = ref([
  { id: 1, storeName: 'HypeLink 강남점', code: 'P001', name: 'Hype-Tee', currentStock: 150, safeStock: 50 },
  { id: 2, storeName: 'HypeLink 강남점', code: 'P002', name: 'Link-Pants', currentStock: 45, safeStock: 50 },
  { id: 3, storeName: 'HypeLink 홍대점', code: 'P001', name: 'Hype-Tee', currentStock: 80, safeStock: 50 },
  { id: 4, storeName: 'HypeLink 부산점', code: 'P003', name: 'Hyper-Jacket', currentStock: 90, safeStock: 30 },
  { id: 5, storeName: 'HypeLink 강남점', code: 'P004', name: 'Mesh-Cap', currentStock: 0, safeStock: 20 },
]);
const filteredInventory = computed(() => {
  if (authStore.isStoreOwner) {
    return allInventory.value.filter(item => item.storeName === authStore.user.name);
  }
  return allInventory.value;
});
</script>