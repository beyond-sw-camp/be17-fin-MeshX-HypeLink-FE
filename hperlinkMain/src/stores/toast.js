import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let toastId = 0;

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++;
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      hideToast(id);
    }, duration);
  };

  const hideToast = (id) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  return { toasts, showToast, hideToast };
});
