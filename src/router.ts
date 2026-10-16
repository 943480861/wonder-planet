import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import LevelSelectView from './views/LevelSelectView.vue'
import PlayView from './views/PlayView.vue'
import SettingsView from './views/SettingsView.vue'

/** 用 hash，这样静态网页和微信里打开都不用服务器做跳转 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/settings', component: SettingsView },
    { path: '/game/:gameId', component: LevelSelectView },
    { path: '/play/:gameId/:level', component: PlayView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
