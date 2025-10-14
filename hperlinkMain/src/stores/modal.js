import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false);
  const title = ref('');
  const message = ref('');
  const isConfirmation = ref(false);

  let resolvePromise = null;

  const show = (options) => {
    isOpen.value = true;
    title.value = options.title || '알림';
    message.value = options.message || '';
    isConfirmation.value = options.isConfirmation || false;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(true);
    }
  };

  const handleCancel = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(false);
    }
  };

  return { isOpen, title, message, isConfirmation, show, handleConfirm, handleCancel };
});
