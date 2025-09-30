<template>
  <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
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

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Modal } from 'bootstrap';

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);

const modalRef = ref(null);

const closeModal = () => {
  emit('update:modelValue', false);
};

// modelValue(v-model)의 변경을 감지하여 모달을 열고 닫습니다.
watch(() => props.modelValue, (newValue) => {
  if (!modalRef.value) return;
  
  // 항상 최신 상태의 모달 인스턴스를 가져오거나 생성합니다. (더 안정적인 방식)
  const modalInstance = Modal.getOrCreateInstance(modalRef.value);

  if (newValue) {
    modalInstance.show();
  } else {
    modalInstance.hide();
  }
});
</script>
