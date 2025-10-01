import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('users', () => {
  const allUsers = ref([
    { id: 1, name: '총괄 관리자', role: 'super_admin', joinDate: '2024-01-01', username: 'admin', password: 'admin123' },
    { id: 2, name: '부관리자', role: 'sub_admin', joinDate: '2024-01-02', username: 'subadmin', password: 'subadmin123' },
    { id: 3, name: 'HypeLink 강남점', role: 'store_manager', joinDate: '2024-02-15', username: 'gangnam', password: 'gangnam123' },
    { id: 4, name: 'HypeLink 홍대점', role: 'store_manager', joinDate: '2025-03-10', username: 'hongdae', password: 'hongdae123' },
    { id: 5, name: 'HypeLink 부산점', role: 'store_manager', joinDate: '2025-04-05', username: 'busan', password: 'busan123' },
  ]);

  const addManager = (manager) => {
    allUsers.value.push({ 
      id: allUsers.value.length + 1, 
      ...manager, 
      role: 'store_manager' 
    });
  };

  const changeUserRole = (userId, role) => {
    const user = allUsers.value.find(u => u.id === userId);
    if (user) {
      user.role = role;
    }
  };

  return { allUsers, addManager, changeUserRole };
});
