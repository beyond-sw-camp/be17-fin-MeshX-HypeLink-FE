<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  finalAmount: Number,
  show: Boolean
})

const receivedAmount = ref(0)
const change = computed(() => {
  return Math.max(0, receivedAmount.value - props.finalAmount)
})

const addAmount = (amount) => {
  receivedAmount.value += amount
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

// Reset received amount when modal is closed/opened
watch(() => props.show, (newVal) => {
  if (!newVal) {
    receivedAmount.value = 0
  }
})

defineExpose({
  receivedAmount,
  change
})
</script>

<template>
  <div v-if="show" class="cash-input">
    <div class="quick-amounts">
      <button @click="addAmount(1000)">+1천</button>
      <button @click="addAmount(5000)">+5천</button>
      <button @click="addAmount(10000)">+1만</button>
      <button @click="addAmount(50000)">+5만</button>
    </div>

    <div class="received-amount">
      <label>받은 금액</label>
      <input
        v-model.number="receivedAmount"
        type="number"
        placeholder="0"
      />
    </div>

    <div class="change-amount">
      <span>거스름돈</span>
      <span class="change">{{ formatPrice(change) }}</span>
    </div>
  </div>
</template>

<style scoped>
.cash-input {
  background: var(--bg-gray);
  padding: 20px;
  border-radius: 12px;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.quick-amounts button {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-amounts button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.received-amount {
  margin-bottom: 16px;
}

.received-amount label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.received-amount input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: right;
}

.change-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
}

.change-amount .change {
  font-size: 18px;
  font-weight: 700;
  color: var(--success-color);
}
</style>