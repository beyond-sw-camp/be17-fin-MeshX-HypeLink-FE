<template>
  <BaseCard class="d-flex flex-column h-100">
    <template #header><h5>{{ chatPartner?.name || '대화 상대를 선택하세요' }}</h5></template>
    
    <div class="chat-body flex-grow-1 p-3" style="overflow-y: auto;">
      <div v-for="(msg, index) in messages" :key="index" class="d-flex mb-3" :class="msg.from === currentUser.id ? 'justify-content-end' : 'justify-content-start'">
        <div class="message-bubble p-2 px-3 rounded" :class="msg.from === currentUser.id ? 'bg-primary text-white' : 'bg-light'">
          {{ msg.text }}
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

<style scoped>
.chat-body {
  min-height: 60vh;
}
.message-bubble {
  max-width: 70%;
}
</style>
