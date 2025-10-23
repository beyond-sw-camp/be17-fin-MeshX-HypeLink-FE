import api from "@/plugins/axiosinterceptor";

export const getColors = async () => {
    const requestUrl = `/api/color/all`
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
    getColors
}