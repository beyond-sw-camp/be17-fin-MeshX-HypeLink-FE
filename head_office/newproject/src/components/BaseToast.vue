<script setup>
import { useToastStore } from '@/stores/toast';
const toastStore = useToastStore();
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      class="toast show align-items-center text-white border-0"
      :class="`bg-${toast.type}`"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-for="toast in toastStore.toasts"
      :key="toast.id"
    >
      <div class="d-flex">
        <div class="toast-body">
          {{ toast.message }}
        </div>
        <button 
          type="button" 
          class="btn-close btn-close-white me-2 m-auto"
          @click="toastStore.hideToast(toast.id)"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>