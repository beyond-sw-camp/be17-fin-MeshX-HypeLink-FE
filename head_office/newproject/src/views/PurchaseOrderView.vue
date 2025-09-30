<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">발주서 작성</h5>
          <button class="btn btn-primary btn-sm" @click="openOrderModal()">+ 새 발주서 작성</button>
        </div>
      </template>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>발주 번호</th>
            <th>상품명</th>
            <th>수량</th>
            <th>요청일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in purchaseOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.productName }}</td>
            <td>{{ order.quantity }}</td>
            <td>{{ order.requestDate }}</td>
            <td><span class="badge" :class="orderStatusClass(order.status)">{{ order.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <!-- 발주서 작성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>새 발주서 작성</h5></template>
      <form @submit.prevent="submitOrder">
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
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="submitOrder">발주 요청</button>
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

const purchaseOrders = ref([
  { id: 1, productId: 1, productName: 'Hype-Tee', quantity: 50, requestDate: '2025-09-29', status: '요청 완료', storeName: 'HypeLink 강남점' },
  { id: 2, productId: 2, productName: 'Link-Pants', quantity: 30, requestDate: '2025-09-28', status: '처리중', storeName: 'HypeLink 강남점' },
]);

const isModalOpen = ref(false);
const orderForm = reactive({ productId: '', quantity: 1 });

const openOrderModal = () => {
  orderForm.productId = '';
  orderForm.quantity = 1;
  isModalOpen.value = true;
};

const submitOrder = () => {
  if (!orderForm.productId || orderForm.quantity <= 0) {
    alert('상품과 수량을 올바르게 입력해주세요.');
    return;
  }
  const product = productStore.allProducts.find(p => p.id === orderForm.productId);
  if (!product) {
    alert('선택된 상품을 찾을 수 없습니다.');
    return;
  }

  purchaseOrders.value.push({
    id: purchaseOrders.value.length + 1,
    productId: orderForm.productId,
    productName: product.name,
    quantity: orderForm.quantity,
    requestDate: new Date().toISOString().slice(0, 10),
    status: '요청 완료',
    storeName: authStore.user.name // 현재 로그인한 지점장 이름
  });
  isModalOpen.value = false;
  alert('발주 요청이 완료되었습니다.');
};

const orderStatusClass = (status) => {
  if (status === '요청 완료') return 'bg-info';
  if (status === '처리중') return 'bg-warning';
  if (status === '배송중') return 'bg-primary';
  if (status === '완료') return 'bg-success';
  return 'bg-secondary';
};
</script>
