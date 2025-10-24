<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAsStore } from '@/stores/as';
import { useToastStore } from '@/stores/toast';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const asStore = useAsStore();
const toastStore = useToastStore();
const router = useRouter();

const asRequestForm = ref({
  title: '',
  description: '',
  // 필요한 경우 추가 필드 (예: product_id, contact_info 등)
});

const handleSubmit = async () => {
  if (!asRequestForm.value.title || !asRequestForm.value.description) {
    toastStore.showToast('제목과 내용을 모두 입력해주세요.', 'danger');
    return;
  }

  const result = await asStore.createAsRequest(asRequestForm.value);
  if (result.success) {
    toastStore.showToast('AS 요청이 성공적으로 접수되었습니다.', 'success');
    router.push({ name: 'asList' });
  } else {
    toastStore.showToast(result.message || 'AS 요청 접수에 실패했습니다.', 'danger');
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="as-create-view">
    <h2>AS 요청 신청</h2>
    <BaseCard>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="asTitle" class="form-label">제목</label>
          <input type="text" class="form-control" id="asTitle" v-model="asRequestForm.title" required>
        </div>
        <div class="mb-3">
          <label for="asDescription" class="form-label">내용</label>
          <textarea class="form-control" id="asDescription" rows="5" v-model="asRequestForm.description" required></textarea>
        </div>
        <!-- 추가 필드가 있다면 여기에 추가 -->
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" @click="goBack">취소</button>
          <button type="submit" class="btn btn-primary" :disabled="asStore.isLoading">
            <BaseSpinner v-if="asStore.isLoading" small />
            <span v-else>신청하기</span>
          </button>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
