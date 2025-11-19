<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import UserListTable from './users/UserListTable.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useUserStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth'; // authStore import
import { useDriverStore } from '@/stores/drivers'; // Import driver store

const toastStore = useToastStore();
const modalStore = useModalStore();
const userStore = useUserStore();
const authStore = useAuthStore(); // authStore 인스턴스 생성
const driverStore = useDriverStore(); // driverStore 인스턴스 생성

const isLoading = ref(true);

const isAddManagerModalOpen = ref(false);
const isEditing = ref(false); // 수정 모드 여부
const formSubmitted = ref(false);

const newManagerDefaults = {
  name: '',
  email: '',
  password: '',
  role: 'MANAGER',
  phone: '',
  address: '',
  region: 'SEOUL_GYEONGGI',
  storeNumber: '',
  carNumber: '', // for DRIVER
  macAddress: '' // for DRIVER
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
    },
  }).open();
};


// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterRole = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);

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

// 사용자 수정 모달 열기 (서버에서 최신 데이터 조회)
const openEditUserModal = async (user) => {
  isEditing.value = true;
  formSubmitted.value = false;
  isLoading.value = true; // 로딩 스피너 표시

  try {
    // 1. Pinia store를 통해 사용자 상세 정보를 비동기적으로 가져옵니다.
    await userStore.fetchUserForEdit(user.id);
    
    // 2. 가져온 데이터로 newManager 폼을 채웁니다.
    const userDetails = userStore.editingUser;
    if (userDetails) {
      Object.assign(newManager, {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email, // 이메일은 수정하지 않으므로 표시만 함
        phone: userDetails.phone,
        address: userDetails.address,
        region: userDetails.region,
        role: userDetails.role,
        password: '', // 비밀번호는 수정 시 비워둠
        storeNumber: userDetails.storeNumber || '',
        carNumber: userDetails.carNumber || '', // for DRIVER
        macAddress: userDetails.macAddress || '' // for DRIVER
      });
      isAddManagerModalOpen.value = true; // 3. 데이터가 준비되면 모달을 엽니다.
    } else {
      toastStore.showToast('사용자 정보를 불러오는 데 실패했습니다.', 'danger');
    }
  } catch (error) {
    console.error('Failed to open edit modal:', error);
    toastStore.showToast(error.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.', 'danger');
  } finally {
    isLoading.value = false; // 로딩 스피너 숨김
  }
};

// 사용자 삭제
const deleteUser = async (userId) => {
  const user = userStore.allUsers.find(u => u.id === userId);
  if (user) {
    const confirmed = await modalStore.show({
      title: '사용자 삭제 확인',
      message: `'${user.name}' 사용자를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      isConfirmation: true,
    });
    if (confirmed) {
      if (user.role === 'DRIVER') {
        await driverStore.deleteDriver(userId);
        await userStore.fetchUsers(); // Refresh the main user list after deleting a driver
      } else {
        await userStore.deleteUser(userId);
      }
      toastStore.showToast(`'${user.name}' 사용자가 삭제되었습니다.`, 'success');
    }
  }
};

// openAddManagerModal 함수는 그대로 유지
const openAddManagerModal = () => {
  formSubmitted.value = false;
  isEditing.value = false; // 추가 모드 활성화
  Object.assign(newManager, newManagerDefaults);
  isAddManagerModalOpen.value = true;
};

// addManager 함수는 add/edit 겸용으로 수정
const addManager = async () => {
  formSubmitted.value = true;
  
  // 공통 유효성 검사
  let commonValidation = !newManager.name || !newManager.email || !newManager.phone || !newManager.region || !newManager.role;
  if (newManager.role !== 'DRIVER') {
    commonValidation = commonValidation || !newManager.address;
  }

  if (commonValidation) {
    toastStore.showToast('필수 항목을 모두 입력해주세요.', 'danger');
    return;
  }

  // 비밀번호는 추가 시에만 필수
  if (!isEditing.value && !newManager.password) {
    toastStore.showToast('비밀번호는 필수입니다.', 'danger');
    return;
  }

  // 지점장일 경우 추가 유효성 검사
  if (newManager.role === 'BRANCH_MANAGER' && !newManager.storeNumber) {
    toastStore.showToast('지점장 정보(가게 번호)를 모두 입력해주세요.', 'danger');
    return;
  }

  // 기사일 경우 추가 유효성 검사
  if (newManager.role === 'DRIVER' && !newManager.carNumber) {
    toastStore.showToast('기사 정보(차량 번호)를 입력해주세요.', 'danger');
    return;
  }

  try {
    const payload = { ...newManager };
    if (payload.role !== 'BRANCH_MANAGER') {
      delete payload.storeNumber;
    }
    if (payload.role !== 'DRIVER') {
      delete payload.carNumber;
      delete payload.macAddress;
    }
      if (isEditing.value) {
        // 사용자 수정 API 호출
        await userStore.updateUser(payload.id, payload);
        toastStore.showToast('사용자 정보가 수정되었습니다.', 'success');
      } else {
        // 사용자 추가 API 호출
        await userStore.addManager(payload);
        toastStore.showToast('새로운 사용자가 추가되었습니다.', 'success');
      }
      isAddManagerModalOpen.value = false;
    } catch (error) {
      toastStore.showToast(error.message || '작업에 실패했습니다.', 'danger');
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
      @add-manager="openAddManagerModal"
      @edit-user="openEditUserModal"
      @delete-user="deleteUser"
      @update:search-term="updateSearchTerm"
      @update:filter-role="updateFilterRole"
      @update:sort="updateSort"
      @update:page="updatePage"
    />

    <BaseModal v-model="isAddManagerModalOpen">
      <template #header><h5>{{ isEditing ? '사용자 수정' : '새 사용자 추가' }}</h5></template>
      <form @submit.prevent="addManager">
        <!-- Common Fields -->
        <div class="mb-3">
          <label class="form-label">역할 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="newManager.role" :class="{ 'is-invalid': !newManager.role && formSubmitted }" :disabled="isEditing">
            <option value="ADMIN">총괄 관리자</option>
            <option value="MANAGER">중간 관리자</option>
            <option value="BRANCH_MANAGER">지점장</option>
            <option value="DRIVER">기사</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">이름 (매장명) <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newManager.name" :class="{ 'is-invalid': !newManager.name && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">이메일 <span class="text-danger">*</span></label>
          <input type="email" class="form-control" v-model="newManager.email" :class="{ 'is-invalid': !newManager.email && formSubmitted, 'bg-light': isEditing }" :readonly="isEditing">
        </div>
        <div v-if="!isEditing" class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newManager.password" :class="{ 'is-invalid': !newManager.password && formSubmitted }">
        </div>
        <div class="mb-3">
          <label class="form-label">전화번호 <span class="text-danger">*</span></label>
          <input type="tel" class="form-control" v-model="newManager.phone" :class="{ 'is-invalid': !newManager.phone && formSubmitted }">
        </div>
        <div class="mb-3" v-if="newManager.role !== 'DRIVER'">
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
        <div v-if="newManager.role === 'BRANCH_MANAGER'">
          <hr/>
          <h6 class="mb-3">지점장 정보</h6>
          
          <div class="mb-3">
            <label class="form-label">가게 번호 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="newManager.storeNumber" :class="{ 'is-invalid': !newManager.storeNumber && formSubmitted }">
          </div>
          
        </div>

        <div v-if="newManager.role === 'DRIVER'">
          <hr/>
          <h6 class="mb-3">기사 정보</h6>
          <div class="mb-3">
            <label class="form-label">차량 번호 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="newManager.carNumber" :class="{ 'is-invalid': !newManager.carNumber && formSubmitted }">
          </div>
          <div class="mb-3">
            <label class="form-label">MAC 주소 <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="newManager.macAddress" :class="{ 'is-invalid': !newManager.macAddress && formSubmitted }">
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddManagerModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addManager">{{ isEditing ? '수정하기' : '추가하기' }}</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>