<script setup>
import { ref } from 'vue';
import BaseCard from '@/components/BaseCard.vue';

const props = defineProps({
  currentUser: Object,
  chatPartner: Object,
  messages: Array
});
const emit = defineEmits(['send-message']);

const newMessage = ref('');

const onSend = () => {
  if (!newMessage.value.trim()) return;
  emit('send-message', newMessage.value);
  newMessage.value = '';
};
</script>

<template>
  <BaseCard class="d-flex flex-column h-100">
    <template #header><h5>{{ chatPartner?.name || '대화 상대를 선택하세요' }}</h5></template>
    
    <div class="chat-body flex-grow-1 p-3" style="overflow-y: auto;">
      <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.from === currentUser?.email ? 'my-message' : 'other-message'">

        <!-- 상대방 메시지 - 왼쪽 -->
        <div v-if="msg.from !== currentUser?.email" class="message-container left">
          <div class="sender-name">{{ msg.senderName || chatPartner?.name }}</div>
          <div class="message-content-wrapper">
            <div class="message-bubble other">
              {{ msg.text }}
            </div>
            <div class="message-meta">
              <span class="message-time">
                {{ msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 내 메시지 - 오른쪽 -->
        <div v-else class="message-container right">
          <div class="message-content-wrapper">
            <div class="message-bubble mine">
              {{ msg.text }}
            </div>
            <div class="message-meta">
              <span class="unread-count" v-if="msg.isRead === false">1</span>
              <span class="message-time">
                {{ msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '' }}
              </span>
            </div>
          </div>
        </div>

      </div>
      <div v-if="!chatPartner" class="text-center text-muted mt-5">사용자 목록에서 대화를 시작할 상대를 선택해주세요.</div>
    </div>

    <div class="chat-input p-3 border-top">
      <form @submit.prevent="onSend" class="d-flex">
        <input type="text" class="form-control me-2" v-model="newMessage" placeholder="메시지를 입력하세요..." :disabled="!chatPartner">
        <button class="btn btn-primary" type="submit" :disabled="!chatPartner">전송</button>
      </form>
    </div>
  </BaseCard>
</template>

<style scoped>
.chat-body {
  min-height: 60vh;
  background-color: #f8f9fa;
}

.message-row {
  margin-bottom: 12px;
  display: flex;
}

.message-row.my-message {
  justify-content: flex-end;
}

.message-row.other-message {
  justify-content: flex-start;
}

.message-container {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-container.left {
  align-items: flex-start;
}

.message-container.right {
  align-items: flex-end;
}

.sender-name {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 4px;
  padding: 0 8px;
  font-weight: 500;
}

.message-content-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.message-container.left .message-content-wrapper {
  flex-direction: row;
}

.message-container.right .message-content-wrapper {
  flex-direction: row-reverse;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.95rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-bubble.mine {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.other {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
  border: 1px solid #e9ecef;
}

.message-meta {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 2px;
  min-width: 45px;
}

.message-time {
  font-size: 0.7rem;
  color: #6c757d;
  white-space: nowrap;
}

.unread-count {
  font-size: 0.7rem;
  color: #ffc107;
  font-weight: 600;
}
</style>