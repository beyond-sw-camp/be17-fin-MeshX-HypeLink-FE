<template>
  <div>
    <!-- 디버깅용: isModalOpen 상태 -->
    <div class="alert alert-info">모달 상태: {{ isModalOpen ? '열림' : '닫힘' }}</div>

    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">프로모션 목록</h5>
          <button class="btn btn-primary btn-sm" @click="openPromotionModal()">+ 새 프로모션 등록</button>
        </div>
      </template>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>프로모션명</th>
            <th>기간</th>
            <th>대상</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promotionStore.allPromotions" :key="promo.id">
            <td><router-link :to="`/promotions/${promo.id}`">{{ promo.name }}</router-link></td>
            <td>{{ promo.period }}</td>
            <td>{{ promo.target }}</td>
            <td><span class="badge" :class="statusClass(promo.status)">{{ promo.status }}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-secondary me-2" @click="openPromotionModal(promo)">수정</button>
              <button class="btn btn-sm btn-danger" @click="deletePromotion(promo.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <!-- 프로모션 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '프로모션 수정' : '새 프로모션 등록' }}</h5></template>
      <form @submit.prevent="savePromotion">
        <div class="mb-3">
          <label class="form-label">프로모션명</label>
          <input type="text" class="form-control" v-model="promoForm.name">
        </div>
        <div class="mb-3">
          <label class="form-label">기간</label>
          <input type="text" class="form-control" v-model="promoForm.period" placeholder="예: 2025-01-01 ~ 2025-01-31">
        </div>
        <div class="mb-3">
          <label class="form-label">대상</label>
          <input type="text" class="form-control" v-model="promoForm.target">
        </div>
        <div class="mb-3">
          <label class="form-label">상태</label>
          <select class="form-select" v-model="promoForm.status">
            <option>진행중</option>
            <option>예정</option>
            <option>종료</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">설명</label>
          <textarea class="form-control" rows="3" v-model="promoForm.description"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="savePromotion">저장</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import { usePromotionStore } from '@/stores/promotions';

const router = useRouter();
const promotionStore = usePromotionStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const promoForm = reactive({
  id: null,
  name: '',
  period: '',
  target: '',
  status: '예정',
  description: '',
});

const statusClass = (status) => {
  if (status === '진행중') return 'bg-primary';
  if (status === '예정') return 'bg-info';
  if (status === '종료') return 'bg-secondary';
  return 'bg-light';
};

const openPromotionModal = (promo = null) => {
  if (promo) {
    isEditing.value = true;
    Object.assign(promoForm, promo);
  } else {
    isEditing.value = false;
    Object.assign(promoForm, { id: null, name: '', period: '', target: '', status: '예정', description: '' });
  }
  isModalOpen.value = true;
};

const savePromotion = () => {
  if (!promoForm.name || !promoForm.period) {
    alert('프로모션명과 기간은 필수입니다.');
    return;
  }
  if (isEditing.value) {
    promotionStore.updatePromotion(promoForm);
  } else {
    promotionStore.addPromotion(promoForm);
  }
  isModalOpen.value = false;
};

const deletePromotion = (id) => {
  if (confirm('정말 이 프로모션을 삭제하시겠습니까?')) {
    promotionStore.deletePromotion(id);
  }
};

// 상세 페이지로 이동
const goToDetail = (id) => {
  router.push(`/promotions/${id}`);
};
</script>
