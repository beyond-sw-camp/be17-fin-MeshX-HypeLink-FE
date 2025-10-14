<script setup>
import { useModalStore } from '@/stores/modal';
import BaseModal from '@/components/BaseModal.vue';

const modalStore = useModalStore();
</script>

<template>
  <BaseModal :model-value="modalStore.isOpen" @update:modelValue="modalStore.handleCancel">
    <template #header>{{ modalStore.title }}</template>
    
    <p>{{ modalStore.message }}</p>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="modalStore.handleCancel">{{ modalStore.isConfirmation ? '취소' : '닫기' }}</button>
      <button v-if="modalStore.isConfirmation" type="button" class="btn btn-primary" @click="modalStore.handleConfirm">확인</button>
    </template>
  </BaseModal>
</template>
