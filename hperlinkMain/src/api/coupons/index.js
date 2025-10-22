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

export const getAllCoupons = async () => {
  const requestUrl = `/api/coupon/read/all`;
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

export default {
  createCoupon,
  getAllCoupons,
  getPagedCoupons,
  getCouponDetail,
  deleteCoupon,
};
