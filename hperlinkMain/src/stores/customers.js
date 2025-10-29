import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getAllCustomers } from '@/api/customers'; // Import API function

export const useCustomerStore = defineStore('customers', () => {
  const allCustomers = ref([]); // Initialize as empty array
  const isLoading = ref(false);
  const totalPages = ref(0);
  const totalElements = ref(0);
  const currentPage = ref(0);
  const pageSize = ref(10);

  // --- Actions ---
  const fetchAllCustomers = async (page = 0, size = 10) => {
    isLoading.value = true;
    try {
      const response = await getAllCustomers(page, size);
      if (response.data && response.data.customerInfoResList) {
        allCustomers.value = response.data.customerInfoResList; // Assign the list from the response
        totalPages.value = response.data.totalPages || 0;
        totalElements.value = response.data.totalElements || 0;
        currentPage.value = response.data.currentPage || 0;
        pageSize.value = response.data.pageSize || size;
      }
    } catch (error) {
      console.error('고객 목록 조회 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  return { allCustomers, isLoading, totalPages, totalElements, currentPage, pageSize, fetchAllCustomers };
});
