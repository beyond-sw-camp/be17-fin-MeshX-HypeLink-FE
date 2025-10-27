import api from "@/plugins/axiosinterceptor";

// ✅ 프로모션 생성
export const createPromotion = async (payload) => {
  const requestUrl = `/api/promotion/create`;
  let data = {};
  await api
    .post(requestUrl, payload)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

// ✅ 전체 프로모션 목록
export const getAllPromotionsList = async () => {
  const requestUrl = `/api/promotion/read/all`;
  let data = {};
  await api
    .get(requestUrl)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

// ✅ 페이징 처리된 프로모션 목록
export const getPagedPromotions = async (page, size, sortKey, sortOrder) => {
  const requestUrl = `/api/promotion/read/page/all`;
  const params = {
    page, // 0-based index
    size,
    sort: `${sortKey},${sortOrder}`, // ✅ Pageable 규격
  };

  try {
    const response = await api.get(requestUrl, { params });
    return response.data.data; // ✅ BaseResponse.data까지만 반환
  } catch (error) {
    return error.response?.data || error.message;
  }
};


// ✅ 단일 프로모션 상세 조회
export const getPromotionDetail = async (id) => {
  const requestUrl = `/api/promotion/read/${id}`;
  let data = {};
  await api
    .get(requestUrl)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

// ✅ 프로모션 수정
export const updatePromotion = async (id, payload) => {
  const requestUrl = `/api/promotion/update/${id}`;
  let data = {};
  await api
    .patch(requestUrl, payload)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

// ✅ 프로모션 삭제
export const deletePromotion = async (id) => {
  const requestUrl = `/api/promotion/delete/${id}`;
  let data = {};
  await api
    .delete(requestUrl)
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

export default {
  createPromotion,
  getAllPromotionsList,
  getPagedPromotions,
  getPromotionDetail,
  updatePromotion,
  deletePromotion,
};