import api from "@/plugins/axiosinterceptor";

export const getSizes = async () => {
    const requestUrl = `/api/size/all`
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
    getSizes
}