import { ref } from 'vue';
import { defineStore } from 'pinia';
import { registerUser } from '@/api/auth';
import { getUsers } from '@/api/users'; // Add this import

export const useUserStore = defineStore('users', () => {
  // 모의 데이터 (나중에 백엔드 API 호출로 대체)
  const allUsers = ref([]);

  // 사용자 목록을 백엔드에서 가져오는 액션
  const fetchUsers = async () => {
    const response = await getUsers();
    if (response.success) {
      allUsers.value = response.users; // Assuming response.users contains List<UserListItemDto>
    } else {
      // 에러 처리 (예: 토스트 메시지)
      console.error('Failed to fetch users:', response.message);
      // toastStore.showToast(response.message || '사용자 목록을 가져오는데 실패했습니다.', 'danger');
    }
  };

  const addManager = async (manager) => {
    const response = await registerUser(manager);

    if (response.success) {
      // 등록 성공 후, 전체 사용자 목록을 다시 불러옵니다.
      await fetchUsers(); 
      return true; // 성공을 알림
    } else {
      // API 호출 실패 시 에러를 발생시켜 컴포넌트에서 처리할 수 있도록 합니다.
      throw new Error(response.message || '사용자 등록에 실패했습니다.');
    }
  };

  const changeUserRole = (userId, role) => {
    const user = allUsers.value.find(u => u.id === userId);
    if (user) {
      user.role = role;
    }
  };

  return { allUsers, fetchUsers, addManager, changeUserRole };
});