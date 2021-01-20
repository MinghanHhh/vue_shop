import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import '../src/assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置拦截器
axios.interceptors.request.use(config => {
  console.log(config)
  //为每一次的请求挂载了一个Authorization的请求头,这样有权限的api就可以正常的调用成功了
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config 固定写法
  return config
})
//这样的话每一个vue组件都可以通过this直接访问访问http发起Ajax的请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
