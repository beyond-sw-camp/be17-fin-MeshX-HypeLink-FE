<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">중앙 창고 재고 현황</h5>
          <button v-if="authStore.isSuperAdmin || authStore.isSubAdmin" class="btn btn-primary btn-sm" @click="isOrderModalOpen = true">+ 본사 발주</button>
        </div>
      </template>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>상품 코드</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th>현재고</th>
            <th>안전재고</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in warehouseInventory" :key="item.id">
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.currentStock }}</td>
            <td>{{ item.safeStock }}</td>
            <td>
              <span v-if="item.currentStock > item.safeStock" class="badge bg-success">양호</span>
              <span v-else-if="item.currentStock > 0" class="badge bg-warning">주의</span>
              <span v-else class="badge bg-danger">품절</span>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <!-- 본사 발주 모달 -->
    <BaseModal v-model="isOrderModalOpen">
      <template #header><h5>본사 발주 요청</h5></template>
      <form @submit.prevent="submitHeadOfficeOrder">
        <div class="mb-3">
          <label class="form-label">상품명</label>
          <select class="form-select" v-model="orderForm.productId">
            <option disabled value="">상품 선택</option>
            <option v-for="product in productStore.allProducts" :key="product.id" :value="product.id">{{ product.name }} ({{ product.code }})</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">수량</label>
          <input type="number" class="form-control" v-model.number="orderForm.quantity" min="1">
        </div>
        <div class="mb-3">
          <label class="form-label">공급처</label>
          <select class="form-select" v-model="orderForm.supplier">
            <option disabled value="">공급처 선택</option>
            <option v-for="supplier in suppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isOrderModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="submitHeadOfficeOrder">발주 요청</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import { useProductStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';

const productStore = useProductStore();
const authStore = useAuthStore();

const warehouseInventory = ref([
  { id: 1, code: 'P001', name: 'Hype-Tee', category: '상의', currentStock: 500, safeStock: 100 },
  { id: 2, code: 'P002', name: 'Link-Pants', category: '하의', currentStock: 200, safeStock: 50 },
  { id: 3, code: 'P003', name: 'Hyper-Jacket', category: '아우터', currentStock: 80, safeStock: 30 },
  { id: 4, code: 'P004', name: 'Mesh-Cap', category: '악세서리', currentStock: 0, safeStock: 20 },
  { id: 5, code: 'P005', name: 'Logo Socks', category: '악세서리', currentStock: 300, safeStock: 50 },
]);

const suppliers = ref([
  '패션원단공급', '의류부자재', '액세서리제작'
]);

const isOrderModalOpen = ref(false);
const orderForm = reactive({ productId: '', quantity: 1, supplier: '' });

const submitHeadOfficeOrder = () => {
  if (!orderForm.productId || orderForm.quantity <= 0 || !orderForm.supplier) {
    alert('모든 발주 정보를 올바르게 입력해주세요.');
    return;
  }

  const product = warehouseInventory.value.find(item => item.id === orderForm.productId);
  if (product) {
    product.currentStock += orderForm.quantity;
  } else {
    // 새로운 상품 발주 (현재는 기존 상품에만 추가)
    alert('새로운 상품 발주는 상품 관리에서 등록 후 진행해주세요.');
  }

  isOrderModalOpen.value = false;
  alert(`${product?.name || '선택 상품'} ${orderForm.quantity}개가 ${orderForm.supplier}에 발주 요청되었습니다.`);
  // 폼 초기화
  Object.assign(orderForm, { productId: '', quantity: 1, supplier: '' });
};
</script>