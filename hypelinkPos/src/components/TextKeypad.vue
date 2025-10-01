<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  title: {
    type: String,
    default: '텍스트 입력'
  },
  placeholder: {
    type: String,
    default: '입력하세요'
  },
  maxLength: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

const inputValue = ref(props.modelValue || '')
const isShiftActive = ref(false)

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal || ''
})

const koreanLayout = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
]

const koreanShiftLayout = [
  ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
]

const currentLayout = ref(koreanLayout)

// 한글 자모 조합 로직
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const JUNG_COMPOSE = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ'
}

const JONG_COMPOSE = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ'
}

const isChosung = (char) => CHO.includes(char)
const isJungsung = (char) => JUNG.includes(char)
const isJongsung = (char) => JONG.includes(char) && char !== ''

const composeHangul = (cho, jung, jong = '') => {
  const choIndex = CHO.indexOf(cho)
  const jungIndex = JUNG.indexOf(jung)
  const jongIndex = JONG.indexOf(jong)

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) return null

  return String.fromCharCode(0xAC00 + (choIndex * 21 + jungIndex) * 28 + jongIndex)
}

const decomposeHangul = (char) => {
  const code = char.charCodeAt(0) - 0xAC00
  if (code < 0 || code > 11171) return null

  const cho = CHO[Math.floor(code / 588)]
  const jung = JUNG[Math.floor((code % 588) / 28)]
  const jong = JONG[code % 28]

  return { cho, jung, jong }
}

const appendChar = (char) => {
  if (inputValue.value.length >= props.maxLength) return

  const lastChar = inputValue.value[inputValue.value.length - 1]

  // 마지막 글자가 한글 완성형인지 확인
  const decomposed = lastChar ? decomposeHangul(lastChar) : null

  if (decomposed) {
    // 초성 + 중성만 있는 경우
    if (!decomposed.jong) {
      // 종성 추가 시도
      if (isChosung(char) || isJongsung(char)) {
        const composed = composeHangul(decomposed.cho, decomposed.jung, char)
        if (composed) {
          inputValue.value = inputValue.value.slice(0, -1) + composed
          emit('update:modelValue', inputValue.value)
          if (isShiftActive.value) toggleShift()
          return
        }
      }
    }
    // 초성 + 중성 + 종성이 있는 경우
    else {
      // 중성 추가 시도 (종성을 초성으로, 새 중성 추가)
      if (isJungsung(char)) {
        const newCho = decomposed.jong
        const composed = composeHangul(newCho, char)
        if (composed) {
          const prevComposed = composeHangul(decomposed.cho, decomposed.jung)
          if (prevComposed) {
            inputValue.value = inputValue.value.slice(0, -1) + prevComposed + composed
            emit('update:modelValue', inputValue.value)
            if (isShiftActive.value) toggleShift()
            return
          }
        }
      }
      // 종성 겹받침 시도
      else if (isChosung(char) || isJongsung(char)) {
        const composeKey = decomposed.jong + char
        const composedJong = JONG_COMPOSE[composeKey]
        if (composedJong) {
          const composed = composeHangul(decomposed.cho, decomposed.jung, composedJong)
          if (composed) {
            inputValue.value = inputValue.value.slice(0, -1) + composed
            emit('update:modelValue', inputValue.value)
            if (isShiftActive.value) toggleShift()
            return
          }
        }
      }
    }
  }

  // 마지막 글자가 자음인 경우
  if (lastChar && isChosung(lastChar)) {
    if (isJungsung(char)) {
      // 자음 + 모음 조합
      const composed = composeHangul(lastChar, char)
      if (composed) {
        inputValue.value = inputValue.value.slice(0, -1) + composed
        emit('update:modelValue', inputValue.value)
        if (isShiftActive.value) toggleShift()
        return
      }
    }
  }

  // 마지막 글자가 모음인 경우 (복합 모음 시도)
  if (lastChar && isJungsung(lastChar)) {
    const composeKey = lastChar + char
    const composedJung = JUNG_COMPOSE[composeKey]
    if (composedJung && isJungsung(char)) {
      inputValue.value = inputValue.value.slice(0, -1) + composedJung
      emit('update:modelValue', inputValue.value)
      if (isShiftActive.value) toggleShift()
      return
    }
  }

  // 조합 불가능하면 그냥 추가
  inputValue.value += char
  emit('update:modelValue', inputValue.value)

  if (isShiftActive.value) {
    toggleShift()
  }
}

const deleteLastChar = () => {
  const lastChar = inputValue.value[inputValue.value.length - 1]
  const decomposed = lastChar ? decomposeHangul(lastChar) : null

  if (decomposed) {
    // 종성이 있으면 종성만 제거
    if (decomposed.jong) {
      const composed = composeHangul(decomposed.cho, decomposed.jung)
      if (composed) {
        inputValue.value = inputValue.value.slice(0, -1) + composed
        emit('update:modelValue', inputValue.value)
        return
      }
    }
    // 중성만 있으면 중성 제거하고 초성만 남김
    else {
      inputValue.value = inputValue.value.slice(0, -1) + decomposed.cho
      emit('update:modelValue', inputValue.value)
      return
    }
  }

  // 일반 삭제
  inputValue.value = inputValue.value.slice(0, -1)
  emit('update:modelValue', inputValue.value)
}

const clear = () => {
  inputValue.value = ''
  emit('update:modelValue', inputValue.value)
}

const addSpace = () => {
  if (inputValue.value.length < props.maxLength) {
    inputValue.value += ' '
    emit('update:modelValue', inputValue.value)
  }
}

const toggleShift = () => {
  isShiftActive.value = !isShiftActive.value
  currentLayout.value = isShiftActive.value ? koreanShiftLayout : koreanLayout
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
    <div class="text-keypad-modal" @click.stop>
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

        <div class="korean-keyboard">
          <div v-for="(row, rowIndex) in currentLayout" :key="rowIndex" class="keyboard-row">
            <button
              v-for="(char, charIndex) in row"
              :key="charIndex"
              class="key-btn char-btn"
              @click="appendChar(char)"
            >
              {{ char }}
            </button>
          </div>

          <div class="keyboard-row bottom-row">
            <button class="key-btn shift-btn" :class="{ active: isShiftActive }" @click="toggleShift">
              ⇧
            </button>
            <button class="key-btn space-btn" @click="addSpace">
              스페이스
            </button>
            <button class="key-btn clear-btn" @click="clear">
              C
            </button>
            <button class="key-btn delete-btn" @click="deleteLastChar">
              ⌫
            </button>
          </div>
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

.text-keypad-modal {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 640px;
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
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
  background: var(--bg-gray);
}

.display-input::placeholder {
  color: var(--text-secondary);
  font-size: 16px;
}

.korean-keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.keyboard-row.bottom-row {
  margin-top: 8px;
}

.key-btn {
  padding: 14px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  min-width: 48px;
}

.key-btn:hover {
  background: var(--bg-gray);
  border-color: var(--primary-color);
}

.key-btn:active {
  transform: scale(0.95);
  background: #E8F5E9;
}

.char-btn {
  flex: 1;
}

.shift-btn {
  background: #E3F2FD;
  color: var(--primary-color);
  font-size: 20px;
  min-width: 80px;
}

.shift-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.shift-btn:hover {
  background: var(--primary-color);
  color: white;
}

.space-btn {
  flex: 2;
  background: #F5F5F5;
  font-size: 14px;
}

.space-btn:hover {
  background: #E0E0E0;
}

.clear-btn {
  background: #FFF3E0;
  color: var(--warning-color);
  font-weight: 700;
  min-width: 70px;
}

.clear-btn:hover {
  background: var(--warning-color);
  color: white;
}

.delete-btn {
  background: #FFEBEE;
  color: var(--error-color);
  font-size: 20px;
  min-width: 80px;
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
