import api from "@/plugins/axiosinterceptor";

export const getCategories = async () => {
    const requestUrl = `/api/category/all`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    getCategories
}