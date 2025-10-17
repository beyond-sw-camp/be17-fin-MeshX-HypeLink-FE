<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import UserListTable from './users/UserListTable.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useUserStore } from '@/stores/users';
import { geocodeAddress } from '@/api/navermaps';

const toastStore = useToastStore();
const modalStore = useModalStore();
const userStore = useUserStore();

const isLoading = ref(true);
const isGeocoding = ref(false);

const isAddManagerModalOpen = ref(false);
const formSubmitted = ref(false);

const newManagerDefaults = {
  name: '',
  email: '',
  password: '',
  role: 'MANAGER',
  phone: '',
  address: '',
  region: 'SEOUL_GYEONGGI',
  lat: null,
  lon: null,
  posCount: 0,
  storeNumber: ''
};

const newManager = reactive({ ...newManagerDefaults });

const regionOptions = {
  SEOUL_GYEONGGI: "서울/경기",
  GANGWON: "강원",
  CHUNGCHEONG: "충청",
  GYEONGSANG: "경상",
  JEOLLA: "전라",
  JEJU: "제주"
};

const handleGeocode = async () => {
  if (!newManager.address) {
    toastStore.showToast('주소를 먼저 입력해주세요.', 'warning');
    return;
  }
  isGeocoding.value = true;
  try {
    const result = await geocodeAddress(newManager.address);
    if (result.success) {
      newManager.lat = result.coords.lat;
      newManager.lon = result.coords.lon;
      toastStore.showToast('좌표가 성공적으로 변환되었습니다.', 'success');
    } else {
      newManager.lat = null;
      newManager.lon = null;
      toastStore.showToast(result.message, 'danger');
    }
  } catch (error) {
    toastStore.showToast('좌표 변환 중 오류가 발생했습니다.', 'danger');
  } finally {
    isGeocoding.value = false;
  }
};

const openPostcodeSearch = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.address;
      let extraAddress = '';

      if (data.addressType === 'R') {
        if (data.bname !== '') {
          extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
          extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
      }

      newManager.address = fullAddress;
      handleGeocode(); // 주소 선택 후 자동으로 좌표 변환 실행
    },
  }).open();
};


// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterRole = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 ---
onMounted(async () => {
  isLoading.value = true;
  try {
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Failed to fetch users on mount:', error);
    toastStore.showToast('사용자 목록을 불러오는 데 실패했습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedUsers = computed(() => {
  let users = [...userStore.allUsers];

  // 역할 기반 정렬 순서
  const roleOrder = {
    'ADMIN': 1, // 총괄 관리자
    'MANAGER': 2, // 중간 관리자
    'BRANCH_MANAGER': 3, // 지점장
    'DRIVER': 4 // 운전기사
  };

  // 필터링
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    // 검색 필드를 username에서 email로 변경
    users = users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  }

  if (filterRole.value !== 'all') {
    users = users.filter(user => user.role === filterRole.value);
  }

  // 정렬
  users.sort((a, b) => {
    // 1. 역할 기반 정렬
    const roleA = roleOrder[a.role] || 99;
    const roleB = roleOrder[b.role] || 99;
    if (roleA !== roleB) {
      return roleA - roleB;
    }

    // 2. 현재 선택된 정렬 키(sortKey)에 따른 2차 정렬
    if (sortKey.value) {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    }
    
    return 0;
  });

  return users;
});

// --- 페이지네이션 로직 ---
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedUsers.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedUsers.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSearchTerm = (term) => { searchTerm.value = term; currentPage.value = 1; };
const updateFilterRole = (role) => { filterRole.value = role; currentPage.value = 1; };
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

// openAddManagerModal 함수 수정
const openAddManagerModal = () => {
  formSubmitted.value = false;
  Object.assign(newManager, newManagerDefaults);
  isAddManagerModalOpen.value = true;
};

// addManager 함수 수정
const addManager = async () => {
  formSubmitted.value = true;
  
  // 기본 유효성 검사
  if (!newManager.name || !newManager.email || !newManager.password || !newManager.role || !newManager.phone || !newManager.address || !newManager.region) {
    toastStore.showToast('필수 항목을 모두 입력해주세요.', 'danger');
    return;
  }

  // 지점장일 경우 추가 유효성 검사
  if (newManager.role === 'BRANCH_MANAGER') {
    if (newManager.lat === null || newManager.lon === null || newManager.posCount === null || !newManager.storeNumber) {
      toastStore.showToast('지점장 정보(위도, 경도, POS 수, 가게 번호)를 모두 입력해주세요.', 'danger');
      return;
    }
  }

  try {
    // 서버에 보낼 데이터 정제
    const payload = { ...newManager };
    if (payload.role !== 'BRANCH_MANAGER') {
      delete payload.lat;
      delete payload.lon;
      delete payload.posCount;
      delete payload.storeNumber;
    }

    await userStore.addManager(payload);
    toastStore.showToast('새로운 사용자가 추가되었습니다.', 'success');
    isAddManagerModalOpen.value = false;
  } catch (error) {
    toastStore.showToast(error.message || '사용자 추가에 실패했습니다.', 'danger');
  }
};

const changeUserRole = async ({ userId, role }) => {
  const user = userStore.allUsers.find(u => u.id === userId);
  if (user) {
    const confirmed = await modalStore.show({
      title: '역할 변경 확인',
      message: `'${user.name}' 사용자의 역할을 '${role}'(으)로 변경하시겠습니까?`,
      isConfirmation: true,
    });
    if (confirmed) {
      userStore.changeUserRole(userId, role);
      toastStore.showToast(`'${user.name}'의 역할이 '${role}'(으)로 변경되었습니다.`, 'success');
    }
  }
};
</script>

<template>
  <div>
    <UserListTable 
      :users="paginatedUsers"
      :totalUsers="filteredAndSortedUsers.length"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      :searchTerm="searchTerm"
      :filterRole="filterRole"
      @change-role="changeUserRole"
      @add-manager="openAddManagerModal"
      @update:search-term="updateSearchTerm"
      @update:filter-role="updateFilterRole"
      @update:sort="updateSort"
      @update:page="updatePage"
    />

    <BaseModal v-model="isAddManagerModalOpen">
      <template #header><h5>새 사용자 추가</h5></template>
      <form @submit.prevent="addManager">
        <!-- Common Fields -->
        <div class="mb-3">
          <label class="form-label">이름 (매장명) <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newManager.name" :class="{ 'is-invalid': !newManager.name && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="newManager.email" :class="{ 'is-invalid': !newManager.email && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newManager.password" :class="{ 'is-invalid': !newManager.password && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">전화번호 <span class="text-danger">*</span></label>
          <input type="tel" class="form-control" v-model="newManager.phone" :class="{ 'is-invalid': !newManager.phone && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">주소 <span class="text-danger">*</span></label>
          <div class="input-group">
            <input type="text" class="form-control" v-model="newManager.address" :class="{ 'is-invalid': !newManager.address && formSubmitted }" readonly placeholder="주소 검색 버튼을 클릭하세요">
            <button class="btn btn-outline-secondary" type="button" @click="openPostcodeSearch">
              주소 검색
            </button>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">지역 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="newManager.region" :class="{ 'is-invalid': !newManager.region && formSubmitted }">
            <option v-for="(name, key) in regionOptions" :key="key" :value="key">{{ name }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">역할 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="newManager.role" :class="{ 'is-invalid': !newManager.role && formSubmitted }">
            <option value="MANAGER">중간 관리자</option>
            <option value="BRANCH_MANAGER">지점장</option>
          </select>
        </div>

        <!-- Branch Manager Specific Fields -->
        <div v-if="newManager.role === 'BRANCH_MANAGER'">
          <hr/>
          <h6 class="mb-3">지점장 정보</h6>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">위도 (Lat) <span class="text-danger">*</span></label>
              <input type="number" step="any" class="form-control" v-model.number="newManager.lat" :class="{ 'is-invalid': newManager.lat === null && formSubmitted }" readonly>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">경도 (Lon) <span class="text-danger">*</span></label>
              <input type="number" step="any" class="form-control" v-model.number="newManager.lon" :class="{ 'is-invalid': newManager.lon === null && formSubmitted }" readonly>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">가게 번호 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="newManager.storeNumber" :class="{ 'is-invalid': !newManager.storeNumber && formSubmitted }">
          </div>
          <div class="mb-3">
            <label class="form-label">POS 수 <span class="text-danger">*</span></label>
            <input type="number" class="form-control" v-model.number="newManager.posCount" :class="{ 'is-invalid': newManager.posCount === null && formSubmitted }">
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddManagerModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addManager">추가하기</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading || isGeocoding" height="200px" />
  </div>
</template>