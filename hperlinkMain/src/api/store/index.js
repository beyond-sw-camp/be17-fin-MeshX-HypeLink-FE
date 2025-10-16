import api from "@/plugins/axiosinterceptor";

export const getAllStoreList = async () => {
    const requestUrl = `/api/store/all`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    getAllStoreList
}