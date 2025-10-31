import { Client } from '@stomp/stompjs';
import { useShipmentStore } from '@/stores/shipments';

export function useShipmentSocket(updateMapMarkers) {
    const shipmentStore = useShipmentStore();
    let stompClient = null;
    const subscriptions = new Map(); // topic → subscription 객체

    /** 🌐 WebSocket 연결 */
    const connectWebSocket = (token) => {
        // 동적 WebSocket URL 생성
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // 현재 도메인과 포트
        const wsUrl = `${protocol}//${host}/ws?token=${token}`;

        stompClient = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        stompClient.onConnect = () => {
        };

        stompClient.onStompError = frame =>
            console.error('STOMP 에러:', frame.headers['message']);

        stompClient.activate();
    };

    /** 📡 구독 메서드 (topic, callback) */
    const subscribe = (topic, callback) => {
        if (!stompClient || !stompClient.connected) {
            console.warn('STOMP가 아직 연결되지 않았습니다.');
            return;
        }

        if (subscriptions.has(topic)) {
            console.warn(`이미 구독 중인 topic: ${topic}`);
            return;
        }

        const subscription = stompClient.subscribe(topic, message => {
            try {
                callback(message);
            } catch (e) {
                console.error(`메시지 처리 중 오류 (${topic}):`, e);
            }
        });

        subscriptions.set(topic, subscription);
    };

    /** 🧹 구독 해제 */
    const unsubscribe = topic => {
        if (subscriptions.has(topic)) {
            const subscription = subscriptions.get(topic);
            subscription.unsubscribe();
            subscriptions.delete(topic);
        } else {
            console.warn(`해제할 구독이 없습니다: ${topic}`);
        }
    };

    /** 🔌 전체 연결 해제 */
    const disconnectWebSocket = () => {
        if (stompClient) {
            // 모든 구독 해제
            for (const [topic, subscription] of subscriptions.entries()) {
                subscription.unsubscribe();
            }
            subscriptions.clear();

            stompClient.deactivate();
        }
    };

    return {
        connectWebSocket,
        disconnectWebSocket,
        subscribe,
        unsubscribe
    };
}
