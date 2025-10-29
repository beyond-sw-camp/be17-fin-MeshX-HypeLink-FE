<script setup>
import BaseCard from '@/components/BaseCard.vue';

defineProps({ users: Array, selectedUserId: Number });
const emit = defineEmits(['select-user']);

const roleClass = (role) => {
  if (role === 'ADMIN') return 'bg-danger';
  if (role === 'MANAGER') return 'bg-primary';
  if (role === 'BRANCH_MANAGER') return 'bg-success';
  return 'bg-secondary';
};
</script>

<template>
  <BaseCard>
    <template #header><h5>대화 상대</h5></template>
    <div class="list-group list-group-flush">
      <a
        href="#"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        :class="{ active: user.id === selectedUserId }"
        v-for="user in users"
        :key="user.id"
        @click.prevent="emit('select-user', user)"
      >
        <div>
          {{ user.name }} <span class="badge rounded-pill" :class="roleClass(user.role)">{{ user.role }}</span>
        </div>
        <span v-if="user.unreadCount > 0" class="badge rounded-pill bg-danger">{{ user.unreadCount }}</span>
      </a>
    </div>
  </BaseCard>
</template>