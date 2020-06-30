
import Vue from 'vue'
import router from './router'
import store from './store'
import Vant from 'vant';
import moment from 'moment'
import {setStore, getStore, IsPC} from '@/common/js/utils.js'
import echarts from 'echarts'

Vue.prototype.$echarts = echarts
// 全局挂载时间格式化方法
Vue.filter('dateformat', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
});
Vue.prototype.$moment = moment;
// 全局挂载监听设备物理返回按键的方法
function gotoURL(callback){
  window.onpopstate = null;
  window.onpopstate = function(){
    callback()
  }
}
Vue.prototype.gotoURL = gotoURL;
//初始化样式
import './common/stylus/index.less'
//移动端适配
import 'lib-flexible/flexible.js'
import App from './App'
let options = {
  fullscreenEl: false
};

Vue.use(Vant);
Vue.config.productionTip = false;
if (IsPC()) {
  // Vue.use(new VueSocketIO({
  //    debug: true,
  //    connection: 'http://localhost:10001'
  // }))
};

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  created () {
    // 页面刷新时重新存入用户信息
    if (getStore('userInfo')) {
      store.commit('storeUserInfo',JSON.parse(getStore('userInfo')));
    };
    if (getStore('userType')) {
      store.commit('changeUserType',getStore('userType'));
    };
    // 页面刷新后重新存入当前标题
    if (getStore('currentTitle')) {
      store.commit('changeTitleTxt', {tit: getStore('currentTitle')});
    };
    // 页面刷新重新存入请求token
    if (getStore('questToken')) {
      store.commit('changeToken', getStore('questToken'));
    }
  },
  template: '<App/>'
})
