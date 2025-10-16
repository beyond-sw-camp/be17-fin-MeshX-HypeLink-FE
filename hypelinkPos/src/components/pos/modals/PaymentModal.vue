<script setup>
import PaymentForm from '../payment/PaymentForm.vue'

defineProps({
  total: Number,
  member: Object
})

const emit = defineEmits(['close', 'complete'])
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <PaymentForm
        :total="total"
        :member="member"
        @close="emit('close')"
        @complete="emit('complete')"
      />
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
</style>
