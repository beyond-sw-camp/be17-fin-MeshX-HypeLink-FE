import { ref, reactive } from 'vue';
import { Client } from '@stomp/stompjs';
import { getChatHistory, sendMessageHttp, markMessagesAsRead } from '@/api/chat';

export function useChat() {
    // State
    const messages = ref([]);
    const stompClient = ref(null);
    const isConnected = ref(false);
    const chatPartner = ref(null);
    const unreadCountUpdateCallback = ref(null); // 읽지 않은 메시지 수 업데이트 콜백
    const pagination = reactive({
        page: 0,
        pageSize: 8, // 한 번에 8개씩 로드
        totalPages: 1,
        loading: false,
        isLastPage: false
    });

    // Private function to handle incoming messages
    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);

        // 백엔드 응답을 프론트엔드 형식으로 변환
        const transformedMessage = {
            from: message.senderEmail,
            to: message.receiverEmail,
            text: message.content,
            timestamp: message.createdAt,
            senderName: message.senderName,
            isRead: message.isRead,
            messageId: message.messageId
        };

        // 현재 보고 있는 채팅방의 메시지만 추가
        // (내가 보낸 메시지 또는 상대방이 보낸 메시지)
        if (chatPartner.value &&
            (message.senderEmail === chatPartner.value.email || message.receiverEmail === chatPartner.value.email)) {

            // 스크롤이 맨 아래에 있는지 확인
            const chatBody = document.querySelector('.chat-body');
            let wasAtBottom = false;
            if (chatBody) {
                const threshold = 100; // 맨 아래로부터 100px 이내면 자동 스크롤
                wasAtBottom = (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight) < threshold;
            }

            messages.value.push(transformedMessage);

            // 스크롤이 맨 아래에 있었다면 자동으로 스크롤
            if (wasAtBottom) {
                setTimeout(() => {
                    if (chatBody) {
                        chatBody.scrollTop = chatBody.scrollHeight;
                    }
                }, 100);
            }
        } else {
            // 현재 보고 있지 않은 채팅방의 메시지일 경우 읽지 않은 메시지 수 업데이트
            if (unreadCountUpdateCallback.value) {
                unreadCountUpdateCallback.value();
            }
        }
    };

    // Private function to handle read receipts
    const onReadReceiptReceived = (payload) => {
        const message = JSON.parse(payload.body);

        // 현재 채팅방의 메시지인 경우에만 처리
        if (chatPartner.value &&
            (message.senderEmail === chatPartner.value.email || message.receiverEmail === chatPartner.value.email)) {
            // messages 배열에서 해당 메시지를 찾아서 isRead 업데이트
            const msgIndex = messages.value.findIndex(m => m.messageId === message.messageId);
            if (msgIndex !== -1) {
                messages.value[msgIndex].isRead = true;
            }
        }
    };

    // Methods
    const connect = (token) => {
        if (isConnected.value) return;

        // 동적 WebSocket URL 생성
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // 현재 도메인과 포트
        const wsUrl = `${protocol}//${host}/ws?token=${token}`;

        console.log('Chat WebSocket URL:', wsUrl);

        // WebSocket은 헤더를 지원하지 않으므로 쿼리 파라미터로 토큰 전달
        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            isConnected.value = true;
            console.log('STOMP 연결 성공');

            // 개인 메시지 큐 구독
            client.subscribe('/user/queue/messages', onMessageReceived);
            // 읽음 확인 큐 구독
            client.subscribe('/user/queue/read-receipt', onReadReceiptReceived);
        };

        client.onStompError = (frame) => {
            console.error('STOMP 에러:', frame.headers['message'], frame.body);
            isConnected.value = false;
        };

        client.onDisconnect = () => {
            isConnected.value = false;
            console.log('STOMP 연결 해제');
        };

        client.activate();
        stompClient.value = client;
    };

    const disconnect = () => {
        stompClient.value?.deactivate();
    };

    const fetchHistory = async (otherUserId) => {
        if (pagination.loading) return;
        pagination.loading = true;

        try {
            const response = await getChatHistory(otherUserId, {
                page: 0,
                pageSize: pagination.pageSize,
                sortBy: 'createdAt',
                direction: 'desc'
            });
            if (response.data) {
                // 백엔드 응답을 프론트엔드 형식으로 변환
                const transformedMessages = response.data.content.map(msg => ({
                    from: msg.senderEmail,
                    to: msg.receiverEmail,
                    text: msg.content,
                    timestamp: msg.createdAt,
                    senderName: msg.senderName,
                    isRead: msg.isRead,
                    messageId: msg.messageId
                }));
                messages.value = transformedMessages.reverse(); // 최신 메시지가 아래로 가도록 순서 뒤집기
                pagination.page = response.data.currentPage;
                pagination.totalPages = response.data.totalPages;
                pagination.isLastPage = response.data.isLast;
            } else {
                messages.value = [];
            }
        } catch (error) {
            console.error('대화 내역 조회 실패:', error);
        } finally {
            pagination.loading = false;
        }
    };

    const loadMoreHistory = async () => {
        if (pagination.loading || pagination.isLastPage) return;

        pagination.loading = true;
        const nextPage = pagination.page + 1;

        try {
            const response = await getChatHistory(chatPartner.value.id, {
                page: nextPage,
                pageSize: pagination.pageSize,
                sortBy: 'createdAt',
                direction: 'desc'
            });
            if (response.data && response.data.content.length > 0) {
                // 백엔드 응답을 프론트엔드 형식으로 변환
                const transformedMessages = response.data.content.map(msg => ({
                    from: msg.senderEmail,
                    to: msg.receiverEmail,
                    text: msg.content,
                    timestamp: msg.createdAt,
                    senderName: msg.senderName,
                    isRead: msg.isRead,
                    messageId: msg.messageId
                }));
                const reversedNewMessages = transformedMessages.reverse();
                messages.value = [...reversedNewMessages, ...messages.value];
                pagination.page = response.data.currentPage;
                pagination.isLastPage = response.data.isLast;
            }
        } catch (error) {
            console.error('추가 대화 내역 조회 실패:', error);
        } finally {
            pagination.loading = false;
        }
    };

    const sendMessage = async (receiverId, content) => {
        // WebSocket이 연결되어 있으면 실시간 전송
        if (stompClient.value?.connected) {
            stompClient.value.publish({
                destination: '/hypelink/send',
                body: JSON.stringify({ receiverId, content }),
            });
        } else {
            // WebSocket이 연결되지 않았으면 HTTP API로 폴백
            try {
                const response = await sendMessageHttp(receiverId, content);
                if (response.data) {
                    // HTTP로 보낸 메시지를 즉시 화면에 표시
                    const transformedMessage = {
                        from: response.data.senderEmail,
                        to: response.data.receiverEmail,
                        text: response.data.content,
                        timestamp: response.data.createdAt,
                        senderName: response.data.senderName,
                        isRead: response.data.isRead,
                        messageId: response.data.messageId
                    };
                    messages.value.push(transformedMessage);
                } else {
                    console.error('메시지 전송 실패:', response.message);
                }
            } catch (error) {
                console.error('메시지 전송 중 오류:', error);
            }
        }
    };

    const selectChatPartner = async (user) => {
        chatPartner.value = user;
        await fetchHistory(user.id);
        // 채팅방 진입 시 읽음 처리
        await markMessagesAsRead(user.id);
        // 읽음 처리 후 사용자 목록 업데이트
        if (unreadCountUpdateCallback.value) {
            unreadCountUpdateCallback.value();
        }
    };

    const setUnreadCountUpdateCallback = (callback) => {
        unreadCountUpdateCallback.value = callback;
    };

    return {
        messages,
        isConnected,
        chatPartner,
        pagination,
        connect,
        disconnect,
        sendMessage,
        selectChatPartner,
        loadMoreHistory,
        setUnreadCountUpdateCallback
    };
}
