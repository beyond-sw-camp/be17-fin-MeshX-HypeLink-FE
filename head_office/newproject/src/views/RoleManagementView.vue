<template>
  <div>
    <BaseCard>
      <template #header><h5>역할별 권한 관리</h5></template>
      <p class="text-muted">총괄 관리자(super_admin)는 시스템의 모든 권한을 가집니다.</p>
      <hr>
      <div v-for="(allowedRoutes, role) in permissions" :key="role">
        <div v-if="role !== 'super_admin'" class="mb-4">
          <h4>'{{ role }}' 역할의 권한</h4>
          <div class="row">
            <div v-for="route in allRoutes" :key="route" class="col-md-4 col-sm-6">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :id="`${role}-${route}`" 
                  :value="route"
                  :checked="allowedRoutes.includes(route)"
                  @change="updatePermission(role, route, $event.target.checked)"
                >
                <label class="form-check-label" :for="`${role}-${route}`">
                  {{ route }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary" @click="savePermissions">변경사항 저장</button>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { usePermissionStore } from '@/stores/permissions';

const permissionStore = usePermissionStore();

// 스토어의 상태를 로컬 ref로 복사하여 UI와 바인딩
const allRoutes = ref([]);
const permissions = ref({});

onMounted(() => {
  allRoutes.value = [...permissionStore.allRoutes];
  permissions.value = JSON.parse(JSON.stringify(permissionStore.permissions));
});

const updatePermission = (role, route, isChecked) => {
  const allowedRoutes = permissions.value[role];
  if (isChecked) {
    if (!allowedRoutes.includes(route)) {
      allowedRoutes.push(route);
    }
  } else {
    const index = allowedRoutes.indexOf(route);
    if (index > -1) {
      allowedRoutes.splice(index, 1);
    }
  }
};

const savePermissions = () => {
  // sub_admin 권한 업데이트
  permissionStore.updatePermissions('sub_admin', permissions.value.sub_admin);
  // store_manager 권한 업데이트
  permissionStore.updatePermissions('store_manager', permissions.value.store_manager);
  alert('권한이 업데이트되었습니다. 변경된 권한은 다시 로그인하면 적용됩니다.');
};

</script>
