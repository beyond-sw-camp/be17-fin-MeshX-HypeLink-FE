<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMyStore } from '@/stores/store';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';

const myStore = useMyStore();
const route = useRoute();

const fetchDataForRoute = (id) => {
  myStore.fetchMyStoreData(id);
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchDataForRoute(route.params.id);
});

// Watch for route changes to refetch data if the user navigates between different store detail pages
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchDataForRoute(newId);
  }
});

</script>

<template>
  <div>
    <BaseSpinner v-if="myStore.isLoading" />

    <div v-else>
      <!-- Store Details Card -->
      <BaseCard v-if="myStore.storeDetails" class="mb-4">
        <template #header><h5>점포 정보</h5></template>
        <div class="row">
          <div class="col-md-6">
            <p><strong>가게명:</strong> {{ myStore.storeDetails.name }}</p>
            <p><strong>주소:</strong> {{ myStore.storeDetails.address }}</p>
          </div>
          <div class="col-md-6">
            <p><strong>지역:</strong> {{ myStore.storeDetails.region }}</p>
          </div>
        </div>
      </BaseCard>

      <!-- POS Devices Card (Read-only) -->
      <BaseCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">POS 기기 목록</h5>
          </div>
        </template>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>POS 코드</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pos in myStore.posDevices" :key="pos.id">
                <td>{{ pos.name }}</td>
                <td>{{ pos.email }}</td>
                <td>{{ pos.posCode }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="myStore.posDevices.length === 0" class="text-center text-muted mt-3">등록된 POS 기기가 없습니다.</p>
      </BaseCard>
    </div>
  </div>
</template>