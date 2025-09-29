import axios from "axios"

const api = axios.create({
    baseURL: '',
    timeout: 5000
});


api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("응답을 받기 전 실행");
        return response;
    },
    (error) => {
        console.log("응답 받을 때 에러 처리");

        if (error.response) {
            console.log("에러 상태 코드:", error.response.status);
            console.log("에러 응답 데이터:", error.response.data);
        } else if (error.request) {
            console.log("응답을 받지 못했습니다:", error.request);
        } else {
            console.log('요청 설정 에러:', error.message);
        }

        return Promise.reject(error);
    }
);


export default api;