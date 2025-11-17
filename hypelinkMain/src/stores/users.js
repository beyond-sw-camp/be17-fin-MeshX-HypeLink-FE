import { ref } from 'vue';
import { defineStore } from 'pinia';
import { registerUser } from '@/api/auth';
import usersApi from '@/api/users'; // default export를 가져오도록 수정

export const useUserStore = defineStore('users', () => {
  const allUsers = ref([]);
  const editingUser = ref(null); // 사용자 수정을 위한 상태 추가

  // 사용자 목록을 백엔드에서 가져오는 액션
  const fetchUsers = async () => {
    const response = await usersApi.getUsers(); // 올바른 API 호출로 수정
    if (response.success && response.data) {
      allUsers.value = response.data.users;
    } else {
      console.error('Failed to fetch users:', response.message);
      throw new Error(response.message || '사용자 목록을 가져오는데 실패했습니다.');
    }
  };

  // 사용자 상세 정보 조회를 위한 액션 추가
  const fetchUserForEdit = async (id) => {
    const response = await usersApi.getUserById(id);
    if (response.success && response.data) {
      editingUser.value = response.data;
    } else {
      console.error('Failed to fetch user for edit:', response.message);
      editingUser.value = null;
      throw new Error(response.message || '사용자 정보를 가져오는데 실패했습니다.');
    }
  };

  const addManager = async (manager) => {
    const response = await registerUser(manager);
    if (response.success) {
      await fetchUsers(); 
      return true;
    } else {
      throw new Error(response.message || '사용자 등록에 실패했습니다.');
    }
  };

  // 사용자 정보 업데이트 액션
  const updateUser = async (id, payload) => {
    const response = await usersApi.updateUser(id, payload); // 올바른 API 호출로 수정
    if (response.success) {
      await fetchUsers();
      return true;
    } else {
      throw new Error(response.message || '사용자 정보 업데이트에 실패했습니다.');
    }
  };

  // 사용자 삭제 액션
  const deleteUser = async (id) => {
    const response = await usersApi.deleteUser(id); // 올바른 API 호출로 수정
    if (response.success) {
      await fetchUsers();
      return true;
    } else {
      throw new Error(response.message || '사용자 삭제에 실패했습니다.');
    }
  };

  return { allUsers, editingUser, fetchUsers, fetchUserForEdit, addManager, updateUser, deleteUser };
});