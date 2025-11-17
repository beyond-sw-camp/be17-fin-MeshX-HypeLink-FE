import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useMessageStore = defineStore('messages', () => {
  // 실제로는 DB에서 가져올 대화 데이터
  const conversations = ref({
    // 키는 'userId1-userId2' 형식 (작은 숫자가 앞에 오도록)
    '1-3': [
      { from: 1, to: 3, text: '강남점, POS 기기 재고 1개 급하게 필요한데 지원 가능할까요?', timestamp: '10:30' },
      { from: 3, to: 1, text: '네, 총괄 관리자님. 어떤 모델 말씀이신가요?', timestamp: '10:31' },
    ],
    '2-3': [
      { from: 2, to: 3, text: '강남점, Hype-Tee 재고 남는거 있으시면 저희쪽으로 20개만 넘겨주세요.', timestamp: '11:00' },
    ]
  });

  const getConversation = (userId1, userId2) => {
    const key = [userId1, userId2].sort().join('-');
    return conversations.value[key] || [];
  };

  const sendMessage = (message) => {
    const key = [message.from, message.to].sort().join('-');
    if (!conversations.value[key]) {
      conversations.value[key] = [];
    }
    conversations.value[key].push(message);
  };

  return { conversations, getConversation, sendMessage };
});
