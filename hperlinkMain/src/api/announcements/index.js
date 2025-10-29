import api from "@/plugins/axiosinterceptor";

export const createAnnouncement = async (payload) => {
    const requestUrl = `/api/notice/create`
    let data = {}
    await api.post(requestUrl,payload)
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            data = error.response?.data || error.message;
        });
    return data
};

export const getAllAnnouncementsList = async () => {
  const requestUrl = `/api/notice/read/all`;
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

export const getPagedAnnouncements = async ({ page = 0, size = 6, sort = 'id,desc' } = {}) => {
  const requestUrl = `/api/notice/read/page/all`;
  let data = {};
  await api
    .get(requestUrl, { params: { page, size, sort } })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

export const getAnnouncementDetail = async (id) => {
  const requestUrl = `/api/notice/read/${id}`;
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

export const deleteAnnouncement = async (id) => {
  const requestUrl = `/api/notice/delete/${id}`;
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

export const updateAnnouncement = async (id, payload) => {
  const requestUrl = `/api/notice/update/${id}`;
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


export default {
    createAnnouncement,
    getAllAnnouncementsList,
    getPagedAnnouncements,
    getAnnouncementDetail,
    deleteAnnouncement,
    updateAnnouncement
}