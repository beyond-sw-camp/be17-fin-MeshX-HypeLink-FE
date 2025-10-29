import api from "@/plugins/axiosinterceptors.js";

// 공지사항 페이징 목록 조회
const getPagedNotices = async ({ page = 0, size = 6, sort = 'id,desc' } = {}) => {
    const url = "/api/notice/read/page/all"
    let result = { success: false }

    await api.get(url, { params: { page, size, sort } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "공지사항 조회 실패" }
        })

    return result
}

// 공지사항 상세 조회 (이미지 포함)
const getNoticeDetail = async (id) => {
    const url = `/api/notice/read/${id}`
    let result = { success: false }

    await api.get(url)
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "공지사항 상세 조회 실패" }
        })

    return result
}

export default {
    getPagedNotices,
    getNoticeDetail
}
