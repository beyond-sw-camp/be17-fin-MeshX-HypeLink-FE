<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">상품 목록</h5>
          <button class="btn btn-primary btn-sm" @click="openProductModal()">+ 새 상품 등록</button>
        </div>
      </template>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>상품 코드</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th>가격</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productStore.allProducts" :key="product.id">
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>{{ product.price.toLocaleString() }}원</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary me-2" @click="openProductModal(product)">수정</button>
              <button class="btn btn-sm btn-danger" @click="deleteProduct(product.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <!-- 상품 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '상품 수정' : '새 상품 등록' }}</h5></template>
      <form @submit.prevent="saveProduct">
        <div class="mb-3">
          <label class="form-label">상품 코드</label>
          <input type="text" class="form-control" v-model="productForm.code">
        </div>
        <div class="mb-3">
          <label class="form-label">상품명</label>
          <input type="text" class="form-control" v-model="productForm.name">
        </div>
        <div class="mb-3">
          <label class="form-label">카테고리</label>
          <select class="form-select" v-model="productForm.category">
            <option>상의</option>
            <option>하의</option>
            <option>아우터</option>
            <option>악세서리</option>
            <option>기타</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">가격</label>
          <input type="number" class="form-control" v-model.number="productForm.price">
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveProduct">저장</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { useProductStore } from '@/stores/products';
import BaseModal from '@/components/BaseModal.vue';

const productStore = useProductStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const productForm = reactive({
  id: null,
  code: '',
  name: '',
  category: '상의',
  price: 0,
});

const openProductModal = (product = null) => {
  if (product) {
    isEditing.value = true;
    Object.assign(productForm, product);
  } else {
    isEditing.value = false;
    Object.assign(productForm, { id: null, code: '', name: '', category: '상의', price: 0 });
  }
  isModalOpen.value = true;
};

const saveProduct = () => {
  if (!productForm.code || !productForm.name || !productForm.price) {
    alert('상품 코드, 상품명, 가격은 필수입니다.');
    return;
  }
  if (isEditing.value) {
    productStore.updateProduct(productForm);
  } else {
    productStore.addProduct(productForm);
  }
  isModalOpen.value = false;
};

const deleteProduct = (id) => {
  if (confirm('정말 이 상품을 삭제하시겠습니까?')) {
    productStore.deleteProduct(id);
  }
};
</script>