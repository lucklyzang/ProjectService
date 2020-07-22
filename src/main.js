
import Vue from 'vue'
import router from './router'
import store from './store'
import Vant from 'vant';
// import 'vant/lib/index.css';
import moment from 'moment'
import {setStore, getStore, IsPC} from '@/common/js/utils.js'
import echarts from 'echarts'

Vue.prototype.$echarts = echarts
Vue.prototype.Base64 = require('js-base64').Base64;
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
    };
    // 重新存入当前报修工单信息
    if (getStore('repairsWorkOrderMsg')) {
      store.commit('changeRepairsWorkOrderMsg', JSON.parse(getStore('repairsWorkOrderMsg')));
    };
    // 重新存入当前报修工单上传的图片
    if (getStore('completPhotoInfo')) {
      store.commit('changeIsCompletePhotoList', JSON.parse(getStore('completPhotoInfo'))['photoInfo']);
    };
    // 重新存入科室巡检信息
    if (getStore('departmentServiceMsg')) {
      store.commit('changeDepartmentServiceMsg', JSON.parse(getStore('departmentServiceMsg')));
    };
    // 重新存入科室巡检扫码校验通过的科室编号
    if (getStore('isDepartmentServiceVerifySweepCode')) {
      store.commit('changeIsDepartmentServiceVerifySweepCode', JSON.parse(getStore('isDepartmentServiceVerifySweepCode'))['sweepCodeInfo']);
    };
    // 重新存入当前科室巡检扫码校验通过的科室编号
    if (getStore('isCurrentDepartmentServiceVerifySweepCode')) {
      this.$store.commit('changeIsCurrentDepartmentServiceVerifySweepCode', JSON.parse(getStore('isCurrentDepartmentServiceVerifySweepCode'))['number']);
    };
    // 重新存入当前进行巡检的科室id
    if (getStore('departmentServiceId')) {
      store.commit('changeDepartmentServiceOfficeId',getStore('departmentServiceId'))
    };
    // 重新存入完成巡检任务的科室编号
    if (getStore('isCompleteDepartmentServiceOfficeInfo')) {
      store.commit('changeCompleteDepartmentServiceOfficeInfo',JSON.parse(getStore('isCompleteDepartmentServiceOfficeInfo'))['sweepCodeInfo'])
    };
    // 重新存入科室巡检当前点击的检查项id
    if (getStore('checkedItemId')) {
      this.$store.commit('changeCurrentDepartmentServiceCheckedItemId', JSON.parse(getStore('checkedItemId')));
    };
    // 重新存入完成巡检任务中检查项上报的id
    if (getStore('isCompleteDepartmentServiceCheckedItemList')) {
      store.commit('changeCompleteDepartmentServiceCheckedItemList',JSON.parse(getStore('isCompleteDepartmentServiceCheckedItemList'))['sweepCodeInfo'])
    };
  },
  template: '<App/>'
})
