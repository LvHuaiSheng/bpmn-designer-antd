import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
import Antd  from 'ant-design-vue'
import zhCn from 'ant-design-vue/es/locale/zh_CN'
import 'ant-design-vue/dist/antd.css';
app.use(Antd , { size: 'default', locale: zhCn })

import MyPD from './package/index.js';
app.use(MyPD);
import './package/theme/index.scss';

app.mount('#app')
