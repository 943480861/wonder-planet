import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { unlockAudio } from './audio'
import './styles/global.css'

/** 第一次点屏幕之后才允许出声，方便微信里打开 */
window.addEventListener('pointerdown', () => unlockAudio(), { once: true })

createApp(App).use(router).mount('#app')
