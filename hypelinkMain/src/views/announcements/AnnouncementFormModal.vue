<script setup>
import { ref, reactive, watch } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { useModalStore } from '@/stores/modal';

const props = defineProps({ 
  modelValue: Boolean, 
  initialData: Object, 
  isEditing: Boolean 
});
const emit = defineEmits(['update:modelValue', 'save']);

const modalStore = useModalStore();
const isModalOpen = ref(props.modelValue);
const form = reactive({ title: '', content: '' });

watch(() => props.modelValue, (newValue) => {
  isModalOpen.value = newValue;
  if (newValue && props.isEditing && props.initialData) {
    Object.assign(form, props.initialData);
  } else if (newValue && !props.isEditing) {
    Object.assign(form, { title: '', content: '' });
  }
});

watch(isModalOpen, (newValue) => {
  emit('update:modelValue', newValue);
});

const saveAnnouncement = () => {
  if (!form.title || !form.content) {
    modalStore.show({ title: '입력 오류', message: '제목과 내용을 모두 입력해주세요.' });
    return;
  }
  emit('save', { ...form });
  isModalOpen.value = false;
};
</script>

<template>
  <BaseModal v-model="isModalOpen">
    <template #header><h5>{{ isEditing ? '공지 수정' : '새 공지 작성' }}</h5></template>
    <form @submit.prevent="saveAnnouncement">
      <div class="mb-3">
        <label class="form-label">제목</label>
        <input type="text" class="form-control" v-model="form.title">
      </div>
      <div class="mb-3">
        <label class="form-label">내용</label>
        <textarea class="form-control" rows="5" v-model="form.content"></textarea>
      </div>
    </form>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
      <button type="button" class="btn btn-primary" @click="saveAnnouncement">저장</button>
    </template>
  </BaseModal>
</template>
