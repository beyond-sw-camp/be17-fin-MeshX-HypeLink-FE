<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  member: Object,
  totalAmount: Number,
  modelValue: Number
})

const emit = defineEmits(['update:modelValue'])

const pointsToUse = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const availablePoints = computed(() => {
  return props.member ? props.member.points : 0
})

const maxUsablePoints = computed(() => {
  return Math.min(availablePoints.value, props.totalAmount)
})

const useAllPoints = () => {
  pointsToUse.value = maxUsablePoints.value
}

const clearPoints = () => {
  pointsToUse.value = 0
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div v-if="member" class="points-section">
    <div class="points-header">
      <div class="member-info-display">
        <span class="member-icon">👤</span>
        <span class="member-name-display">{{ member.name }}</span>
        <span class="available-points">보유: {{ availablePoints.toLocaleString() }}P</span>
      </div>
    </div>

    <div class="points-input-group">
      <div class="points-input">
        <label>포인트 사용</label>
        <input
          v-model.number="pointsToUse"
          type="number"
          :max="maxUsablePoints"
          min="0"
          placeholder="0"
        />
      </div>
      <button class="use-all-points-btn" @click="useAllPoints">전액 사용</button>
      <button v-if="pointsToUse > 0" class="clear-points-btn" @click="clearPoints">초기화</button>
    </div>

    <div v-if="pointsToUse > 0" class="final-amount-display">
      <span>포인트 차감 후</span>
      <span class="final-price">{{ formatPrice(totalAmount - pointsToUse) }}</span>
    </div>
  </div>
</template>

<style scoped>
.points-section {
  background: #F0F9FF;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #D0E7FF;
}

.points-header {
  margin-bottom: 16px;
}

.member-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.member-icon {
  font-size: 20px;
}

.member-name-display {
  font-weight: 600;
  color: var(--text-primary);
}

.available-points {
  color: var(--primary-color);
  font-weight: 600;
  margin-left: auto;
}

.points-input-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.points-input {
  flex: 1;
}

.points-input label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.points-input input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: white;
}

.points-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.use-all-points-btn,
.clear-points-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.use-all-points-btn {
  background: var(--primary-color);
  color: white;
}

.use-all-points-btn:hover {
  background: #0052CC;
}

.clear-points-btn {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.clear-points-btn:hover {
  background: var(--bg-gray);
}

.final-amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.final-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--success-color);
}
</style>