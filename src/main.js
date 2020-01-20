import Vue from 'vue'
import VueTouch from 'vue-touch'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'

Vue.use(ElementUI);
Vue.use(VueTouch);
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
