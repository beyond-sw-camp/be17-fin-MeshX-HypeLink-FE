<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { useCouponStore } from '@/stores/coupons';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useAuthStore } from '@/stores/auth';

const couponStore = useCouponStore();
const toastStore = useToastStore();
const modalStore = useModalStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const isModalOpen = ref(false);
const formSubmitted = ref(false);

const couponForm = reactive({
  name: '',
  type: 'Percentage',
  value: 0,
  expiryDate: '',
});

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

const openCouponModal = () => {
  formSubmitted.value = false;
  Object.assign(couponForm, { name: '', type: 'Percentage', value: 0, expiryDate: '' });
  isModalOpen.value = true;
};

const saveCoupon = () => {
  formSubmitted.value = true;
  if (!couponForm.name || !couponForm.value || !couponForm.expiryDate) {
    toastStore.showToast('모든 필드를 올바르게 입력해주세요.', 'danger');
    return;
  }
  couponStore.addCoupon(couponForm);
  toastStore.showToast('새 쿠폰이 등록되었습니다.', 'success');
  isModalOpen.value = false;
};

const deleteCoupon = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 쿠폰을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    couponStore.deleteCoupon(id);
    toastStore.showToast('쿠폰이 삭제되었습니다.', 'success');
  }
};

const formatValue = (type, value) => {
  return type === 'Percentage' ? `${value}%` : `${value.toLocaleString()}원`;
};

</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">쿠폰 관리</h5>
          <div class="d-flex">
            <button v-if="authStore.isSuperAdmin || authStore.isSubAdmin" class="btn btn-primary btn-sm" @click="openCouponModal">+ 새 쿠폰 생성</button>
          </div>
        </div>
      </template>

      <BaseSpinner v-if="isLoading" />

      <div v-else-if="couponStore.allCoupons.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>쿠폰명</th>
              <th>타입</th>
              <th>할인 값</th>
              <th>만료일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in couponStore.allCoupons" :key="coupon.id">
              <td>{{ coupon.name }}</td>
              <td>{{ coupon.type }}</td>
              <td>{{ formatValue(coupon.type, coupon.value) }}</td>
              <td>{{ coupon.expiryDate }}</td>
              <td>
                <button v-if="authStore.isSuperAdmin || authStore.isSubAdmin" class="btn btn-sm btn-danger" @click="deleteCoupon(coupon.id)">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BaseEmptyState v-else message="생성된 쿠폰이 없습니다." />

    </BaseCard>

    <!-- 쿠폰 생성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>새 쿠폰 생성</h5></template>
      <form @submit.prevent="saveCoupon">
        <div class="mb-3">
          <label class="form-label">쿠폰명 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="couponForm.name" :class="{ 'is-invalid': !couponForm.name && formSubmitted }">
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">할인 타입</label>
            <select class="form-select" v-model="couponForm.type">
              <option value="Percentage">퍼센트 (%)</option>
              <option value="Fixed">정액 (원)</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">할인 값 <span class="text-danger">*</span></label>
            <input type="number" class="form-control" v-model.number="couponForm.value" :class="{ 'is-invalid': !couponForm.value && formSubmitted }">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">만료일 <span class="text-danger">*</span></label>
          <input type="date" class="form-control" v-model="couponForm.expiryDate" :class="{ 'is-invalid': !couponForm.expiryDate && formSubmitted }">
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveCoupon">저장</button>
      </template>
    </BaseModal>
  </div>
</template>
