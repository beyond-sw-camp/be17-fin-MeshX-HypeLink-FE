<script setup>
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';
import userApi from '@/api/users'
import {onMounted, ref} from "vue";
import {useToastStore} from "@/stores/toast.js";

const allStores = ref([]);
const toastStore = useToastStore();
const selectStore = ref(null);

const getStores = async () => {
  let res =  await userApi.getStoresList();
  if(res.success) {
    allStores.value = res.data;
    return;
  }
  toastStore.showToast('Store 정보를 못 받아왔습니다.', 'danger');
}

defineProps({ inventory: Array });
const emit = defineEmits(['send-shipment']);
const authStore = useAuthStore();

onMounted(() => {
  getStores();
})
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 class="mb-0">재고 현황</h5>
      <select class="form-select form-select-sm me-2" v-model="selectStore">
        <option value=0>본사 재고</option>
        <option v-for="cat in allStores" :key="cat.storeName" :value="cat.storeId">
          {{ cat.storeName }}
        </option>
      </select>
    </template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th v-if="authStore.isAdmin">점포명</th>
          <th>상품 코드</th>
          <th>상품명</th>
          <th>현재고</th>
          <th>안전재고</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventory" :key="item.id">
          <td v-if="authStore.isAdmin">{{ item.storeName }}</td>
          <td>{{ item.code }}</td>
          <td>{{ item.name }}</td>
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
</template>