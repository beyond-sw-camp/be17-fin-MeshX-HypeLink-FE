import api from "@/plugins/axiosinterceptor";

/**
 * 특정 사용자와의 대화 내역을 페이징하여 가져옵니다.
 * @param {number} otherUserId - 대화 상대방의 ID
 * @param {object} pageReq - 페이지 요청 객체 (page, pageSize)
 * @returns {Promise<object>}
 */
export const getChatHistory = async (otherUserId, pageReq) => {
    const requestUrl = `/api/chat/list/${otherUserId}`;
    let data = {};
    await api.get(requestUrl, { params: pageReq })
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: '대화 내역 조회 실패' };
        });
    return data;
};

/**
 * HTTP API를 통해 메시지를 전송합니다 (비실시간).
 * @param {number} receiverId - 수신자 ID
 * @param {string} content - 메시지 내용
 * @returns {Promise<object>}
 */
export const sendMessageHttp = async (receiverId, content) => {
    const requestUrl = `/api/chat/send`;
    let data = {};
    await api.post(requestUrl, { receiverId, content })
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: '메시지 전송 실패' };
        });
    return data;
};

/**
 * 메시지를 읽음 처리합니다.
 * @param {number} senderId - 메시지 발신자 ID
 * @returns {Promise<object>}
 */
export const markMessagesAsRead = async (senderId) => {
    const requestUrl = `/api/chat/read/${senderId}`;
    let data = {};
    await api.post(requestUrl)
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: '읽음 처리 실패' };
        });
    return data;
};

/**
 * 채팅 가능한 사용자 목록을 가져옵니다 (자기 자신 제외).
 * @returns {Promise<object>}
 */
export const getChatUserList = async () => {
    const requestUrl = `/api/chat/users`;
    let data = {};
    await api.get(requestUrl)
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: '채팅 유저 목록 조회 실패' };
        });
    return data;
};

export default {
    getChatHistory,
    sendMessageHttp,
    markMessagesAsRead,
    getChatUserList
}
