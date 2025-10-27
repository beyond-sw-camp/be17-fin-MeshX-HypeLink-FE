<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import chatApi from '@/api/chat';
import { useChat } from '@/js/useChat.js'; // 새로 만든 composable import

import UserListPanel from './communication/UserListPanel.vue';
import ChatWindow from './communication/ChatWindow.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

const allUsers = ref([]);
const isLoading = ref(true);
const searchTerm = ref('');

// --- Chat composable 사용 ---
const {
  messages,
  isConnected,
  chatPartner,
  pagination,
  connect,
  disconnect,
  sendMessage,
  selectChatPartner,
  loadMoreHistory,
  setUnreadCountUpdateCallback
} = useChat();

const chatBodyRef = ref(null); // 무한 스크롤을 위한 ref

// --- Fetch User Data from API ---
const fetchUsers = async () => {
  try {
    const response = await chatApi.getChatUserList();
    if (response.success) {
      allUsers.value = response.data;
    } else {
      toastStore.showToast('대화 상대 목록을 불러오는데 실패했습니다.', 'danger');
    }
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await fetchUsers();
    // WebSocket 연결
    if (authStore.accessToken) {
      connect(authStore.accessToken);
    }
    // 읽지 않은 메시지 수 업데이트 콜백 설정
    setUnreadCountUpdateCallback(fetchUsers);
  } catch (error) {
    toastStore.showToast('데이터 로딩 중 오류가 발생했습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  disconnect(); // 컴포넌트 파괴 시 연결 해제
});

// 자기 자신을 제외한 대화 상대 목록
const availableUsers = computed(() => 
  allUsers.value.filter(u => u.id !== authStore.user?.id)
);

// --- Chat Logic ---
const handleSelectUser = async (user) => {
  await selectChatPartner(user);
  // 대화 내역 로드 후 스크롤을 맨 아래로 이동
  await nextTick();
  scrollToBottom();
};

const scrollToBottom = () => {
  const chatBody = document.querySelector('.chat-body');
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
};

const handleSendMessage = async (text) => {
  if (!text.trim()) {
    toastStore.showToast('메시지 내용을 입력해주세요.', 'danger');
    return;
  }
  await sendMessage(chatPartner.value.id, text);
  // 메시지 전송 후 스크롤을 맨 아래로
  await nextTick();
  scrollToBottom();
};

// 이전 메시지 불러오기 핸들러
const handleLoadMore = async () => {
  if (pagination.loading || pagination.isLastPage) return;

  const chatBody = chatBodyRef.value;
  const oldScrollHeight = chatBody.scrollHeight;

  await loadMoreHistory();

  await nextTick();
  chatBody.scrollTop = chatBody.scrollHeight - oldScrollHeight;
};

</script>

<template>
  <div class="row h-100">
    <div class="col-md-4 h-100">
      <input type="text" class="form-control mb-3" v-model="searchTerm" placeholder="대화 상대 검색...">
      <UserListPanel :users="availableUsers" :selectedUserId="chatPartner?.id" @select-user="handleSelectUser" />
    </div>
    <div class="col-md-8 h-100">
      <div class="chat-window-wrapper">
        <div v-if="pagination.loading" class="spinner-container">
          <BaseSpinner />
        </div>
        <div class="chat-body" ref="chatBodyRef">
          <!-- 이전 메시지 불러오기 버튼 -->
          <div v-if="chatPartner && !pagination.isLastPage" class="load-more-container">
            <button
              class="btn btn-sm btn-outline-secondary load-more-btn"
              @click="handleLoadMore"
              :disabled="pagination.loading"
            >
              <span v-if="pagination.loading">불러오는 중...</span>
              <span v-else>↑ 이전 메시지 보기</span>
            </button>
          </div>

          <ChatWindow
            :current-user="authStore.user"
            :chat-partner="chatPartner"
            :messages="messages"
            @send-message="handleSendMessage"
          />
        </div>
      </div>
    </div>

    <BaseSpinner v-if="isLoading && !chatPartner" height="100%" />
  </div>
</template>

<style scoped>
.chat-window-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.spinner-container {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.chat-body {
  flex-grow: 1;
  overflow-y: auto;
  height: 100%;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 5;
  border-bottom: 1px solid #dee2e6;
}

.load-more-btn {
  font-size: 0.875rem;
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>