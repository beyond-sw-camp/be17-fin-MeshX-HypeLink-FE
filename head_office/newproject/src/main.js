import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Bootstrap CSS 및 JS import
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// 전역 스타일 import
import './assets/main.scss';

const app = createApp(App);

// Vue DevTools 활성화 (개발 환경에서 기본적으로 활성화되지만, 명시적으로 설정)
if (import.meta.env.DEV) {
  app.config.devtools = true;
}

app.use(createPinia()); // 1. Pinia를 먼저 등록
app.use(router);      // 2. 그 다음 Router를 등록

// --- 최종 네비게이션 가드 ---
// 이 함수는 페이지 이동이 발생할 때마다 실행됩니다.
router.beforeEach(async (to, from, next) => {
  // 이 안에서 스토어를 import하면, Pinia가 준비된 후에만 코드가 실행됩니다.
  const { useAuthStore } = await import('./stores/auth.js');
  const { usePermissionStore } = await import('./stores/permissions.js');
  const { useModalStore } = await import('./stores/modal.js');
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  const modalStore = useModalStore();

  const requiredRoles = to.meta.roles || [];

  // 로그인이 필요한 페이지인데, 로그인이 안된 경우
  if (requiredRoles.length > 0 && !authStore.isLoggedIn) {
    modalStore.show({ title: '로그인 필요', message: '로그인이 필요한 페이지입니다.' });
    return next({ name: 'dashboard' }); // 대시보드로 리디렉션
  }

  // 페이지에 특정 역할이 필요한데, 사용자의 역할이 맞지 않는 경우
  if (requiredRoles.length > 0 && !permissionStore.canAccess(authStore.user.role, to.name)) {
    modalStore.show({ title: '권한 없음', message: '이 페이지에 접근할 권한이 없습니다.' });
    return next(false); // 이동 취소
  }

  // 모든 검사를 통과하면, 요청된 페이지로 이동
  next();
});

app.mount('#app');