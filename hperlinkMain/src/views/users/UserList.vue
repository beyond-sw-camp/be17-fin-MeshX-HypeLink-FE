<script setup>
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';

defineProps({ users: Array });
const emit = defineEmits(['change-role', 'add-manager']);
const authStore = useAuthStore();

const roleClass = (role) => {
  if (role === 'super_admin') return 'bg-danger';
  if (role === 'sub_admin') return 'bg-primary';
  if (role === 'store_manager') return 'bg-success';
  return 'bg-secondary';
};
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">사용자 관리</h5>
        <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm" @click="emit('add-manager')">+ 지점장 추가</button>
      </div>
    </template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>이름</th>
          <th>역할</th>
          <th>가입일</th>
          <th v-if="authStore.isAdmin">권한 변경</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>
            <span class="badge" :class="roleClass(user.role)">{{ user.role }}</span>
          </td>
          <td>{{ user.joinDate }}</td>
          <td v-if="authStore.isAdmin">
            <div class="dropdown" v-if="user.id !== authStore.user.id">
              <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">변경</button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'super_admin' })">총괄 관리자</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'sub_admin' })">부관리자</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'store_manager' })">지점장</a></li>
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </BaseCard>
</template>