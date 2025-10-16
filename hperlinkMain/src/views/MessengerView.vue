<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMessageStore } from '@/stores/messages';
import { useToastStore } from '@/stores/toast';
import UserListPanel from './communication/UserListPanel.vue';
import ChatWindow from './communication/ChatWindow.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const authStore = useAuthStore();
const messageStore = useMessageStore();
const toastStore = useToastStore();

const allUsers = ref([]);
const isLoading = ref(true);

// --- Mock User Data ---
// 실제로는 사용자 관리 DB에서 가져와야 합니다.
onMounted(() => {
  setTimeout(() => {
    allUsers.value = [
      { id: 1, name: '총괄 관리자', role: 'super_admin' },
      { id: 2, name: '부관리자', role: 'sub_admin' },
      { id: 3, name: 'HypeLink 강남점', role: 'store_manager' },
      { id: 4, name: 'HypeLink 홍대점', role: 'store_manager' },
    ];
    isLoading.value = false;
  }, 1000);
});

// 자기 자신을 제외한 대화 상대 목록
const availableUsers = computed(() => 
  allUsers.value.filter(u => u.id !== authStore.user?.id)
);

// --- Chat Logic ---
const selectedUser = ref(null);

const selectUser = (user) => {
  selectedUser.value = user;
};

// 선택된 사용자와의 대화 내용을 계산
const messages = computed(() => {
  if (!selectedUser.value || !authStore.user) return [];
  return messageStore.getConversation(authStore.user.id, selectedUser.value.id);
});

// 메시지 전송 처리
const sendMessage = (text) => {
  if (!text.trim()) {
    toastStore.showToast('메시지 내용을 입력해주세요.', 'danger');
    return;
  }
  messageStore.sendMessage({
    from: authStore.user.id,
    to: selectedUser.value.id,
    text,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  });
  toastStore.showToast('메시지를 전송했습니다.', 'success');
};
</script>

<template>
  <div class="row h-100">
    <div class="col-md-4 h-100">
      <input type="text" class="form-control mb-3" v-model="searchTerm" placeholder="대화 상대 검색...">
      <UserListPanel :users="availableUsers" :selectedUserId="selectedUser?.id" @select-user="selectUser" />
    </div>
    <div class="col-md-8 h-100">
      <ChatWindow 
        :current-user="authStore.user"
        :chat-partner="selectedUser"
        :messages="messages"
        @send-message="sendMessage"
      />
    </div>

    <BaseSpinner v-if="isLoading" height="100%" />
  </div>
</template>
