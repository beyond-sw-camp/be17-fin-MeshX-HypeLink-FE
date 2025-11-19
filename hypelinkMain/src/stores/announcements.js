import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAnnouncementStore = defineStore('announcements', () => {
  // const allAnnouncements = ref([
  //   { id: 1, title: '시스템 점검 안내', content: '더 나은 서비스를 위해 시스템 점검이 예정되어 있습니다.', author: '관리자', date: '2025-09-30' },
  //   { id: 2, title: '새로운 기능 업데이트', content: '고객 분석 기능이 더욱 강화되었습니다. 많은 이용 바랍니다.', author: '관리자', date: '2025-09-28' },
  //   { id: 3, title: '추석 연휴 고객센터 휴무 안내', content: '추석 연휴 기간 동안 고객센터 운영이 중단됩니다.', author: '관리자', date: '2025-09-20' },
  // ]);

  const allAnnouncements = ref([]);

  const addAnnouncement = (announcement) => {
    const newId = allAnnouncements.value.length > 0 ? Math.max(...allAnnouncements.value.map(a => a.id)) + 1 : 1;
    allAnnouncements.value.unshift({ id: newId, ...announcement, author: '관리자', date: new Date().toISOString().slice(0, 10) });
  };

  const updateAnnouncement = (updatedAnnouncement) => {
    const index = allAnnouncements.value.findIndex(a => a.id === updatedAnnouncement.id);
    if (index !== -1) {
      allAnnouncements.value[index] = { ...allAnnouncements.value[index], ...updatedAnnouncement };
    }
  };

  const deleteAnnouncement = (id) => {
    allAnnouncements.value = allAnnouncements.value.filter(a => a.id !== id);
  };

  return { allAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement };
});
