<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  title: {
    type: String,
    default: '번호 입력'
  },
  placeholder: {
    type: String,
    default: '번호를 입력하세요'
  },
  maxLength: {

    type: Number,
    default: 11
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

const inputValue = ref(props.modelValue || '')

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal || ''
})

const appendNumber = (num) => {
  if (inputValue.value.length < props.maxLength) {
    inputValue.value += num.toString()
    emit('update:modelValue', inputValue.value)
  }
}

const deleteLastDigit = () => {
  inputValue.value = inputValue.value.slice(0, -1)
  emit('update:modelValue', inputValue.value)
}

const clear = () => {
  inputValue.value = ''
  emit('update:modelValue', inputValue.value)
}

const confirm = () => {
  emit('confirm', inputValue.value)
}

const cancel = () => {
  emit('close')
}
</script>

<template>
  <div class="keypad-overlay" @click="cancel">
    <div class="keypad-modal" @click.stop>
      <div class="keypad-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="cancel">✕</button>
      </div>

      <div class="keypad-body">
        <div class="keypad-display">
          <input
            :value="inputValue"
            type="text"
            readonly
            :placeholder="placeholder"
            class="display-input"
          />
        </div>

        <div class="keypad-grid">
          <button class="key-btn" @click="appendNumber(1)">1</button>
          <button class="key-btn" @click="appendNumber(2)">2</button>
          <button class="key-btn" @click="appendNumber(3)">3</button>
          <button class="key-btn" @click="appendNumber(4)">4</button>
          <button class="key-btn" @click="appendNumber(5)">5</button>
          <button class="key-btn" @click="appendNumber(6)">6</button>
          <button class="key-btn" @click="appendNumber(7)">7</button>
          <button class="key-btn" @click="appendNumber(8)">8</button>
          <button class="key-btn" @click="appendNumber(9)">9</button>
          <button class="key-btn clear-btn" @click="clear">C</button>
          <button class="key-btn" @click="appendNumber(0)">0</button>
          <button class="key-btn delete-btn" @click="deleteLastDigit">⌫</button>
        </div>
      </div>

      <div class="keypad-footer">
        <button class="cancel-btn" @click="cancel">취소</button>
        <button class="confirm-btn" @click="confirm">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keypad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.keypad-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.keypad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.keypad-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
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

.keypad-body {
  padding: 24px;
}

.keypad-display {
  margin-bottom: 24px;
}

.display-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
  background: var(--bg-gray);
  letter-spacing: 2px;
}

.display-input::placeholder {
  color: var(--text-secondary);
  font-size: 16px;
  letter-spacing: normal;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.key-btn {
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.key-btn:hover {
  background: var(--bg-gray);
  border-color: var(--primary-color);
}

.key-btn:active {
  transform: scale(0.95);
  background: #E8F5E9;
}

.clear-btn {
  background: #FFF3E0;
  color: var(--warning-color);
  font-weight: 700;
}

.clear-btn:hover {
  background: var(--warning-color);
  color: white;
}

.delete-btn {
  background: #FFEBEE;
  color: var(--error-color);
  font-size: 28px;
}

.delete-btn:hover {
  background: var(--error-color);
  color: white;
}

.keypad-footer {
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
  border-radius: 8px;
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
