import api from "@/plugins/axiosinterceptor";

export const createCoupon = async (payload) => {
  const requestUrl = `/api/coupon/create`;
  let data = {};
  await api
    .post(requestUrl, {
      name: payload.name,
      couponType: payload.type.toUpperCase(), // Percentage -> PERCENTAGE
      value: payload.value,
      period: payload.period,
    })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

export const getAllCoupons = async (page = 0, size = 10) => {
  const requestUrl = `/api/coupon/list?page=${page}&size=${size}`;
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

export const getPagedCoupons = async (pageReq) => {
  const requestUrl = `/api/coupon/read/page/all`;
  let data = {};
  await api
    .get(requestUrl, { params: pageReq })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

export const getCouponDetail = async (id) => {
  const requestUrl = `/api/coupon/read/${id}`;
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

export const deleteCoupon = async (id) => {
  const requestUrl = `/api/coupon/delete/${id}`;
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

export const updateCoupon = async (id, payload) => {
  const requestUrl = `/api/coupon/update/${id}`;
  let data = {};
  await api
    .patch(requestUrl, {
      name: payload.name,
      couponType: payload.type.toUpperCase(), // Percentage -> PERCENTAGE
      value: payload.value,
      period: payload.period,
    })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

export default {
  createCoupon,
  getAllCoupons,
  getPagedCoupons,
  getCouponDetail,
  deleteCoupon,
  updateCoupon,
};
