<script setup>
import { reactive } from 'vue';
import BaseCard from '@/components/BaseCard.vue';

const props = defineProps({ storeName: String });
const emit = defineEmits(['submit-report']);

const form = reactive({
  issueType: '',
  description: ''
});

const submitReport = () => {
  emit('submit-report', { ...form });
  form.issueType = '';
  form.description = '';
};
</script>

<template>
  <BaseCard>
    <template #header><h5>POS 기기 문제 신고</h5></template>
    <form @submit.prevent="submitReport">
      <div class="mb-3">
        <label for="storeName" class="form-label">점포명</label>
        <input type="text" class="form-control" id="storeName" :value="storeName" disabled>
      </div>
      <div class="mb-3">
        <label for="issueType" class="form-label">문제 유형</label>
        <select class="form-select" id="issueType" v-model="form.issueType">
          <option disabled value="">유형을 선택하세요</option>
          <option>결제 오류</option>
          <option>화면 안 켜짐</option>
          <option>영수증 프린터 문제</option>
          <option>기타</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">상세 내용</label>
        <textarea class="form-control" id="description" rows="5" v-model="form.description" placeholder="문제 상황을 최대한 자세하게 적어주세요."></textarea>
      </div>
      <div class="d-grid">
        <button type="submit" class="btn btn-primary">신고 접수하기</button>
      </div>
    </form>
  </BaseCard>
</template>