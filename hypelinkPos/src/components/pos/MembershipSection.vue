<script setup>
import { useCouponsStore } from '@/stores/coupons'

defineProps({
  memberPhone: String,
  currentMember: Object
})

const emit = defineEmits(['openPhoneKeypad', 'clearMember'])

const couponsStore = useCouponsStore()
</script>

<template>
  <div class="membership-section">
    <div v-if="!currentMember" class="membership-search">
      <input
        :value="memberPhone"
        type="tel"
        placeholder="전화번호 입력 (멤버십 조회)"
        class="member-phone-input"
        maxlength="11"
        readonly
        @click="emit('openPhoneKeypad')"
      />
      <button class="member-search-btn" @click="emit('openPhoneKeypad')">조회</button>
    </div>
    <div v-else class="member-info">
      <div class="member-details">
        <span class="member-name">👤 {{ currentMember.name }}</span>
        <span class="member-points">💰 {{ currentMember.points.toLocaleString() }}P</span>
        <span class="member-coupons" v-if="couponsStore.getAvailableCoupons(currentMember.id, 0).length > 0">
          🎟️ {{ couponsStore.getAvailableCoupons(currentMember.id, 0).length }}장
        </span>
      </div>
      <button class="member-clear-btn" @click="emit('clearMember')">✕</button>
    </div>
  </div>
</template>

<style scoped>
.membership-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: #F0F9FF;
}

@media (min-width: 1024px) {
  .membership-section {
    padding: 20px 28px;
  }
}

.membership-search {
  display: flex;
  gap: 8px;
}

.member-phone-input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
  background: white;
}

.member-phone-input:focus {
  border-color: var(--primary-color);
}

.member-search-btn {
  padding: 12px 20px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.member-search-btn:hover {
  background: #0052CC;
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-details {
  display: flex;
  gap: 16px;
  align-items: center;
}

.member-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.member-points {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-color);
}

.member-coupons {
  font-size: 14px;
  font-weight: 600;
  color: var(--warning-color);
}

.member-clear-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 50%;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.member-clear-btn:hover {
  background: var(--error-color);
  color: white;
}
</style>
