import api from "@/plugins/axiosinterceptor";

export const getAllCustomers = async (page = 0, size = 10) => {
  const requestUrl = `api/mono/customer/list?page=${page}&size=${size}`;
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

export const issueCouponToCustomer = async (customerId, couponId) => {
  const requestUrl = `/api/mono/customer/${customerId}/coupons?couponId=${couponId}`;
  let data = {};
  try {
    const response = await api.post(requestUrl);
    data = response.data;
  } catch (error) {
    data = error.response?.data || error.message;
    throw error; // Re-throw the error so the calling component can handle it
  }
  return data;
};

export const searchCustomers = async (keyword = '', ageGroup = 'all', page = 0, size = 10) => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (ageGroup && ageGroup !== 'all') params.append('ageGroup', ageGroup);
  params.append('page', page);
  params.append('size', size);

  const requestUrl = `/api/mono/customer/search?${params.toString()}`;
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

export default {
  getAllCustomers,
  issueCouponToCustomer,
  searchCustomers,
};
