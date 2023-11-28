import { createApp } from 'vue';
import APP from './App.vue';
import './global.less';
import './config';

const app = createApp(APP);
app.mount('#app');
