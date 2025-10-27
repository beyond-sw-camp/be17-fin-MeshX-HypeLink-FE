<script setup>
const emit = defineEmits(['close'])
</script>

<template>
  <div class="success-message">
    <div class="success-icon">✓</div>
    <h2>결제 완료</h2>
    <p>정상적으로 결제가 완료되었습니다.</p>
    <div class="success-actions">
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
  justify-content: center;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.done-btn {
  padding: 14px 48px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--primary-color);
  color: white;
}

.done-btn:hover {
  background: #0052CC;
}
</style>