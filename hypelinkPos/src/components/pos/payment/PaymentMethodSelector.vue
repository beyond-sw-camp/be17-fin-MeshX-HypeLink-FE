<script setup>
const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const paymentMethods = [
  { id: 'card', name: '카드', icon: '💳' },
  { id: 'cash', name: '현금', icon: '💵' },
  { id: 'portone', name: 'PortOne', icon: '📱' },
  { id: 'transfer', name: '계좌이체', icon: '🏦' }
]

const selectMethod = (method) => {
  emit('update:modelValue', method)
}
</script>

<template>
  <div class="payment-methods">
    <button
      v-for="method in paymentMethods"
      :key="method.id"
      class="method-btn"
      :class="{ active: modelValue === method.id }"
      @click="selectMethod(method.id)"
    >
      <span class="icon">{{ method.icon }}</span>
      <span>{{ method.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.payment-methods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover {
  border-color: var(--primary-color);
}

.method-btn.active {
  border-color: var(--primary-color);
  background: #EBF3FF;
  color: var(--primary-color);
}

.method-btn .icon {
  font-size: 32px;
}
</style>