<script setup lang="js">
import {onMounted, ref, watch} from 'vue';
import draggable from 'vuedraggable'; // npm install vuedraggable@next
import {useToastStore} from "@/stores/toast.js";

import colorApi from '@/api/item/color'
import categoryApi from '@/api/item/category'
import sizeApi from '@/api/item/size'
import {uploadItemImage} from "@/api/image/index.js";

const toastStore = useToastStore();

const props = defineProps(['itemForm', 'isModalOpen']);
const emit = defineEmits(['submit']);
const itemForm = props.itemForm;
const uploadedFiles = new Set();
const imagePreviews = ref([]);
const fileLabel = ref('파일 선택');

const sizes = ref([]);
const categories = ref([]);
const colors = ref([]);

// 파일 선택
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileKey = `${file.name}-${file.size}`;

    // 이미 업로드된 파일이면 스킵
    if (uploadedFiles.has(fileKey)) {
      continue;
    }

    try {
      // 업로드 진행
      const uploaded = await uploadItemImage(file);

      // 업로드 성공 시 등록
      const preview = {
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        index: imagePreviews.value.length,
      };

      imagePreviews.value.push(preview);
      itemForm.images.push({
        ...uploaded, // s3Key, originalFilename, fileSize, contentType 등
        index: preview.index,
      });

      // 업로드된 파일로 등록
      uploadedFiles.add(fileKey);
    } catch (err) {
      toastStore.showToast("[FAIL]" + file.name + "업로드 실패", "danger");
    }
  }

  updateFileLabel();
};

const getColors = async () => {
  let res = await colorApi.getColors();
  if(res.status !== 200) {
    toastStore.showToast("색깔을 불러오지 못했습니다.", "danger")
  }
  colors.value = res.data.data.colors;
}

const getCategories = async () => {
  let res = await categoryApi.getCategories();
  if(res.status !== 200) {
    toastStore.showToast("카테고리를 불러오지 못했습니다.", "danger")
  }
  categories.value = res.data.data.categories;
}

const getSizes = async () => {
  let res = await sizeApi.getSizes();
  if(res.status !== 200) {
    toastStore.showToast("색깔을 불러오지 못했습니다.", "danger")
  }
  sizes.value = res.data.data.sizes;
}

// 파일명 + 개수 업데이트
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

// 삭제
const removeImage = (index) => {
  imagePreviews.value.splice(index, 1);
  itemForm.images.splice(index, 1);

  // 이후 남은 이미지들의 index 재정렬
  imagePreviews.value = imagePreviews.value.map((img, i) => ({
    ...img,
    index: i
  }));

  itemForm.images = itemForm.images.map((img, i) => ({
    ...img,
    index: i
  }));

  updateFileLabel();
};

// 순서 변경
const updateOrder = () => {
  // imagePreviews의 index도 새 순서로 갱신
  imagePreviews.value = imagePreviews.value.map((img, idx) => ({
    ...img,
    index: idx
  }));

  // itemForm.images도 동일하게 맞춤
  itemForm.images = imagePreviews.value.map((img, idx) => ({
    ...itemForm.images.find(i => i.originalFilename === img.name), // s3Key 등 기존 정보 유지
    index: idx
  }));
};

// 기본 폼 초기화 함수
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

const isLightColor = (hex) => {
  if (!hex) return false;
  let r, g, b;

  if (hex.startsWith('#')) {
    const c = hex.substring(1);
    if (c.length === 3) {
      r = parseInt(c[0] + c[0], 16);
      g = parseInt(c[1] + c[1], 16);
      b = parseInt(c[2] + c[2], 16);
    } else if (c.length === 6) {
      r = parseInt(c.substring(0, 2), 16);
      g = parseInt(c.substring(2, 4), 16);
      b = parseInt(c.substring(4, 6), 16);
    }
  } else if (hex.startsWith('rgb')) {
    [r, g, b] = hex.match(/\d+/g).map(Number);
  } else return false;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
}

// 모달 닫힐 때 전체 리셋
watch(
    () => props.isModalOpen,
    (newVal) => {
      if (!newVal) resetForm();
    }
);

onMounted(async () => {
  await getColors();
  await getSizes();
  await getCategories();
})
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
      <label class="form-label">원가 *</label>
      <input type="number" class="form-control" v-model.number="itemForm.unitPrice" required/>
    </div>

    <div class="mb-3">
      <label class="form-label">카테고리</label>
      <select class="form-select" v-model="itemForm.category">
        <option disabled value="">카테고리를 선택하세요</option>
        <option v-for="cat in categories" :key="cat.category" :value="cat.category">
          {{ cat.category }}
        </option>
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
          <!-- 사이즈 선택 -->
          <div class="col">
            <select class="form-select size-input" v-model="detail.size">
              <option disabled value="">사이즈 선택</option>
              <option v-for="s in sizes" :key="s.size" :value="s.size">
                {{ s.size }}
              </option>
            </select>
          </div>

          <!-- 색상 선택 -->
          <div class="col">
            <select class="form-select color-input" v-model="detail.color">
              <option disabled value="">색상 선택</option>
              <option
                  v-for="c in colors"
                  :key="c.id"
                  :value="c.colorName"
                  :style="{ backgroundColor: c.colorCode, color: isLightColor(c.colorCode) ? '#000' : '#fff' }"
              >
                {{ c.colorName }}
              </option>
            </select>
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