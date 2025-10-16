<script setup>
const emit = defineEmits(['print-receipt', 'close'])
</script>

<template>
  <div class="success-message">
    <div class="success-icon">✓</div>
    <h2>결제 완료</h2>
    <p>정상적으로 결제가 완료되었습니다.</p>
    <div class="success-actions">
      <button class="receipt-btn" @click="emit('print-receipt')">영수증 출력</button>
      <button class="done-btn" @click="emit('close')">확인</button>
    </div>
  </div>
</template>

<style scoped>
.success-message {
  padding: 60px 40px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 24px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-message h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

.success-message p {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 24px;
}

.success-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.receipt-btn,
.done-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.receipt-btn {
  background: var(--primary-color);
  color: white;
}

.receipt-btn:hover {
  background: #0052CC;
}

.done-btn {
  background: var(--bg-gray);
  color: var(--text-primary);
}

.done-btn:hover {
  background: #E5E8EB;
}
</style>