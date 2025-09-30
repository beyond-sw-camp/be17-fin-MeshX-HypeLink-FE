<template>
  <div>
    <UserList :users="users" @change-role="changeUserRole" @add-manager="isAddManagerModalOpen = true" />

    <!-- 지점장 추가 모달 -->
    <BaseModal v-model="isAddManagerModalOpen">
      <template #header><h5>새 지점장 추가</h5></template>
      <form @submit.prevent="addManager">
        <div class="mb-3">
          <label class="form-label">이름 (매장명)</label>
          <input type="text" class="form-control" v-model="newManager.name">
        </div>
        <div class="mb-3">
          <label class="form-label">아이디</label>
          <input type="text" class="form-control" v-model="newManager.username">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호</label>
          <input type="password" class="form-control" v-model="newManager.password">
        </div>
        <div class="mb-3">
          <label class="form-label">가입일</label>
          <input type="text" class="form-control" v-model="newManager.joinDate" placeholder="예: 2024-01-01">
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddManagerModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addManager">추가하기</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import UserList from './users/UserList.vue';
import BaseModal from '@/components/BaseModal.vue';

const users = ref([
  { id: 1, name: '총괄 관리자', role: 'super_admin', joinDate: '2024-01-01', username: 'admin', password: 'admin123' },
  { id: 2, name: '부관리자', role: 'sub_admin', joinDate: '2024-01-02', username: 'subadmin', password: 'subadmin123' },
  { id: 3, name: 'HypeLink 강남점', role: 'store_manager', joinDate: '2024-02-15', username: 'gangnam', password: 'gangnam123' },
  { id: 4, name: 'HypeLink 홍대점', role: 'store_manager', joinDate: '2024-03-10', username: 'hongdae', password: 'hongdae123' },
]);

const isAddManagerModalOpen = ref(false);
const newManager = reactive({ name: '', username: '', password: '', joinDate: '' });

const changeUserRole = ({ userId, role }) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    if (confirm(`'${user.name}' 사용자의 역할을 '${role}'(으)로 변경하시겠습니까?`)) {
      user.role = role;
    }
  }
};

const addManager = () => {
  if (!newManager.name || !newManager.username || !newManager.password || !newManager.joinDate) {
    alert('모든 항목을 입력해주세요.');
    return;
  }
  users.value.push({ 
    id: users.value.length + 1, 
    ...newManager, 
    role: 'store_manager' 
  });
  Object.assign(newManager, { name: '', username: '', password: '', joinDate: '' });
  isAddManagerModalOpen.value = false;
};
</script>
