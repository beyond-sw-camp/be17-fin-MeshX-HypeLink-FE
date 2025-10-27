import api from "@/plugins/axiosinterceptors.js";

// 카테고리 목록 조회
const getCategoryList = async () => {
    const url = "/api/direct/category/list"
    let result = { success: false }

    await api.get(url)
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "카테고리 목록 조회 실패" }
        })

    return result
}

export default {
    getCategoryList
}
