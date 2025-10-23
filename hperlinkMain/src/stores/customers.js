import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getAllCustomers } from '@/api/customers'; // Import API function

export const useCustomerStore = defineStore('customers', () => {
  const allCustomers = ref([]); // Initialize as empty array
  const isLoading = ref(false);

  // --- Actions ---
  const fetchAllCustomers = async () => {
    isLoading.value = true;
    try {
      const response = await getAllCustomers();
      if (response.data && response.data.customerInfoResList) {
        allCustomers.value = response.data.customerInfoResList; // Assign the list from the response
      }
    } catch (error) {
      console.error('고객 목록 조회 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  return { allCustomers, isLoading, fetchAllCustomers };
});
