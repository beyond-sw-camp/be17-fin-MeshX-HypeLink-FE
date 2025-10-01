import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);

  // Getters
  const isLoggedIn = computed(() => !!user.value);
  const isSuperAdmin = computed(() => {
    const result = user.value?.role === 'super_admin';
    console.log("[Auth Store] isSuperAdmin computed:", result, "for user:", user.value?.role);
    return result;
  });
  const isSubAdmin = computed(() => {
    const result = user.value?.role === 'sub_admin';
    console.log("[Auth Store] isSubAdmin computed:", result, "for user:", user.value?.role);
    return result;
  });
  
  const isStoreManager = computed(() => {
    const result = user.value?.role === 'store_manager';
    console.log("[Auth Store] isStoreManager computed:", result, "for user:", user.value?.role);
    return result;
  });

  // Actions
  function login(role) {
    if (role === 'super_admin') {
      user.value = { id: 1, name: '총괄 관리자', role: 'super_admin' };
    } else if (role === 'sub_admin') {
      user.value = { id: 2, name: '부관리자', role: 'sub_admin' };
    } else if (role === 'store_manager') {
      user.value = { id: 3, name: 'HypeLink 강남점', role: 'store_manager' };
    }
  }

  function logout() {
    user.value = null;
  }

  return { user, isLoggedIn, isSuperAdmin, isSubAdmin, isStoreManager, login, logout };
});
