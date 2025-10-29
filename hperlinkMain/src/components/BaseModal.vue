<script setup>
import { ref, onMounted, watch } from 'vue';
import { Modal } from 'bootstrap';

const props = defineProps({
  modelValue: Boolean,
  size: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const modalRef = ref(null);
let modalInstance = null; // Bootstrap Modal 인스턴스

onMounted(() => {
  modalInstance = new Modal(modalRef.value);

  // Bootstrap 모달이 닫힐 때 Vue의 modelValue를 업데이트하기 위한 이벤트 리스너
  modalRef.value.addEventListener('hidden.bs.modal', () => {
    emit('update:modelValue', false);
  });
});

const closeModal = () => {
  emit('update:modelValue', false);
};

// modelValue(v-model)의 변경을 감지하여 모달을 열고 닫습니다.
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    modalInstance.show();
  } else {
    modalInstance.hide();
  }
});
</script>

<template>
  <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" :class="{
    'modal-sm': props.size === 'sm',
    'modal-lg': props.size === 'lg',
    'modal-xl': props.size === 'xl',
    'modal-xxl': props.size === 'xxl'
    }">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <slot name="header">Modal Title</slot>
          </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">닫기</button>
            <button type="button" class="btn btn-primary">저장</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>