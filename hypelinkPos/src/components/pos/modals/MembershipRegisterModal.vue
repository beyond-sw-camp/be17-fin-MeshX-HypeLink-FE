<script setup>
defineProps({
  newMemberName: String,
  newMemberPhone: String,
  newMemberBirthdate: String
})

defineEmits([
  'update:newMemberName',
  'update:newMemberPhone',
  'update:newMemberBirthdate',
  'close',
  'register',
  'openNameKeypad',
  'openRegisterPhoneKeypad'
])
</script>

<template>
  <div class="modal-overlay">
    <div class="membership-register-modal" @click.stop>
      <div class="modal-header">
        <h2>멤버십 가입</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>이름</label>
          <input
            :value="newMemberName"
            type="text"
            placeholder="이름 입력"
            class="form-input"
            readonly
            @click="$emit('openNameKeypad')"
          />
        </div>

        <div class="form-group">
          <label>전화번호</label>
          <input
            :value="newMemberPhone"
            type="tel"
            placeholder="전화번호 입력"
            maxlength="11"
            class="form-input"
            readonly
            @click="$emit('openRegisterPhoneKeypad')"
          />
        </div>

        <div class="form-group">
          <label>생년월일</label>
          <input
            :value="newMemberBirthdate"
            type="date"
            placeholder="생년월일 선택"
            class="form-input date-input"
            @input="$emit('update:newMemberBirthdate', $event.target.value)"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">
          취소
        </button>
        <button class="confirm-btn" @click="$emit('register')">가입</button>
      </div>
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

.membership-register-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
}

.form-input[readonly] {
  background: var(--bg-gray);
  cursor: pointer;
}

.date-input {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 14px 16px;
  line-height: 1.5;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover {
  background: #0052CC;
}
</style>
