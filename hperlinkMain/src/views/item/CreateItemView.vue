<script setup lang="js">
import {ref, watch} from 'vue';
import draggable from 'vuedraggable'; // npm install vuedraggable@next

const props = defineProps(['itemForm', 'isModalOpen']);
const emit = defineEmits(['submit']);
const itemForm = props.itemForm;

const imagePreviews = ref([]);
const fileLabel = ref('파일 선택');

// ✅ 파일 선택
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  const newFiles = files.map(file => ({
    file,
    name: file.name,
    url: URL.createObjectURL(file)
  }));

  imagePreviews.value.push(...newFiles);
  itemForm.images.push(...files);

  updateFileLabel();

  // ✅ 파일 input 초기화 (같은 파일 다시 선택 시에도 인식되게)
  e.target.value = '';
};

// ✅ 파일명 + 개수 업데이트
const updateFileLabel = () => {
  const count = imagePreviews.value.length;
  if (count === 0) {
    fileLabel.value = '파일 선택';
  } else if (count === 1) {
    fileLabel.value = imagePreviews.value[0].name;
  } else {
    fileLabel.value = `${imagePreviews.value[0].name} 외 ${count - 1}개`;
  }
};

// ✅ 삭제
const removeImage = (index) => {
  imagePreviews.value.splice(index, 1);
  itemForm.images.splice(index, 1);
  updateFileLabel();
};

// ✅ 순서 변경
const updateOrder = () => {
  itemForm.images = imagePreviews.value.map(img => img.file);
};

// ✅ 기본 폼 초기화 함수
const resetForm = () => {
  // 이미지 객체 URL 해제 (메모리 누수 방지)
  imagePreviews.value.forEach(img => URL.revokeObjectURL(img.url));

  // reactive 객체라서 완전 교체보단 프로퍼티만 재할당
  Object.assign(itemForm, {
    enName: '',
    koName: '',
    amount: 0,
    category: '상의',
    itemCode: '',
    content: '',
    company: '',
    itemDetailList: [],
    images: [],
  });

  imagePreviews.value = [];
  fileLabel.value = '파일 선택';
};

// ✅ 모달 닫힐 때 전체 리셋
watch(
    () => props.isModalOpen,
    (newVal) => {
      if (!newVal) resetForm();
    }
);
</script>

<template>
  <form @submit.prevent="emit('submit')">
    <div class="mb-3">
      <label class="form-label">상품 코드 *</label>
      <input type="text" class="form-control" v-model="itemForm.itemCode" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">한글명 *</label>
      <input type="text" class="form-control" v-model="itemForm.koName" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">영문명</label>
      <input type="text" class="form-control" v-model="itemForm.enName"/>
    </div>

    <div class="mb-3">
      <label class="form-label">가격 *</label>
      <input type="number" class="form-control" v-model.number="itemForm.amount" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">카테고리</label>
      <select class="form-select" v-model="itemForm.category">
        <option>상의</option>
        <option>하의</option>
        <option>아우터</option>
        <option>신발</option>
        <option>악세서리</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">회사명</label>
      <input type="text" class="form-control" v-model="itemForm.company"/>
    </div>

    <div class="mb-3">
      <label class="form-label">상품 설명</label>
      <textarea class="form-control" rows="3" v-model="itemForm.content"></textarea>
    </div>

    <!-- 상품 상세(색상/사이즈/재고) 추가 -->
    <div class="mb-3">
      <label class="form-label">상품 상세 리스트</label>
      <div v-for="(detail, idx) in itemForm.itemDetailList" :key="idx" class="border p-2 mb-2 rounded">
        <div class="row">
          <div class="col">
            <input type="text" class="form-control size-input" placeholder="사이즈" v-model="detail.size"/>
          </div>
          <div class="col">
            <input type="text" class="form-control color-input" placeholder="색상" v-model="detail.color"/>
          </div>
          <div class="col">
            <input type="number" class="form-control stock-input" placeholder="재고" v-model.number="detail.stock"/>
          </div>
          <div class="col">
            <input
                type="text"
                class="form-control code-input"
                placeholder="상세코드 (예: ITEM001-M-WH)"
                v-model="detail.itemDetailCode"
            />
          </div>
          <div class="col-1 text-center">
            <button type="button" class="btn btn-outline-danger btn-sm" @click="itemForm.itemDetailList.splice(idx, 1)">
              ✕
            </button>
          </div>
        </div>
      </div>

      <button
          type="button"
          class="btn btn-sm btn-outline-primary mt-2"
          @click="itemForm.itemDetailList.push({ size: '', color: '', stock: 0, itemDetailCode: '' })"
      >
        + 상세 추가
      </button>
    </div>

    <div class="mb-3">
      <label class="form-label">상품 이미지</label>

      <div class="input-group">
        <!-- 실제 파일 input (숨김 처리) -->
        <input
            type="file"
            id="imageUpload"
            class="d-none"
            accept="image/*"
            multiple
            @change="handleFileSelect"
        />

        <!-- 파일 선택 버튼 -->
        <label for="imageUpload" class="btn btn-outline-secondary mb-0">
          파일 선택
        </label>

        <!-- 파일명 표시 영역도 클릭 가능하게 label 처리 -->
        <label
            for="imageUpload"
            class="form-control bg-white text-truncate mb-0 clickable-area"
        >
          {{ fileLabel }}
        </label>
      </div>

      <small class="text-muted d-block mt-1">
        * 이미지를 드래그해서 순서를 변경할 수 있습니다.
      </small>
    </div>


    <!-- ✅ 이미지 리스트 (드래그 + 삭제 가능) -->
    <draggable
        v-model="imagePreviews"
        item-key="name"
        class="list-group"
        @end="updateOrder"
        ghost-class="drag-ghost"
        animation="150"
    >
      <template #item="{ element, index }">
        <li class="list-group-item d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <img :src="element.url" alt="preview" width="60" height="60" class="rounded" />
            <span class="text-truncate" style="max-width: 200px;">{{ element.name }}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="text-muted small">{{ index + 1 }}번</span>
            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeImage(index)">
              삭제
            </button>
          </div>
        </li>
      </template>
    </draggable>
  </form>
</template>

<style scoped>
.size-input {
  width: 210px;
}
.color-input {
  width: 210px;
}
.stock-input {
  width: 203px;
}
.code-input {
  width: 300px;
}
.list-group-item img {
  object-fit: cover;
  border: 1px solid #ccc;
}

.clickable-area {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-left: none;
  border-radius: 0 0.375rem 0.375rem 0;
  background-color: #fff;
  transition: all 0.15s ease;
  cursor: pointer;
  user-select: none;
  text-align: left;
}

/* Hover 시 약간의 시각 피드백 */
.clickable-area:hover {
  background-color: #f8f9fa;
}

/* Active (클릭 시 눌리는 모션) */
.clickable-area:active {
  background-color: #e9ecef;
  transform: scale(0.985);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 포커스 유지 시 파란 outline */
.clickable-area:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>