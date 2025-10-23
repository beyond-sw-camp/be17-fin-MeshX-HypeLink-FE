import api from "@/plugins/axiosinterceptor";

export const getAllCustomers = async () => {
  const requestUrl = `/api/customer/list`;
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
};
