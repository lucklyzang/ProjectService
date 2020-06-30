
import Vue from 'vue'
import router from './router'
import store from './store'
import Vant from 'vant';
// import 'vant/lib/index.css';
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
    };
    // 页面刷新重新存入调度任务具体信息
    if (getStore('currentDispatchTaskMessage')) {
      store.commit('changeDispatchTaskMessage', {DtMsg: getStore('currentDispatchTaskMessage')});
    };
    // 页面刷新重新存入预约任务具体信息
    if (getStore('currentAppointTaskMessage')) {
      store.commit('changeAppointTaskMessage', {DtMsg: getStore('currentAppointTaskMessage')});
    };
    // 页面刷新重新存入循环任务科室采集信息
    if (getStore('currentCirculationCollectMessage')) {
      store.commit('changeCirculationCollectMessageList', {DtMsg: (JSON.parse(getStore('currentCirculationCollectMessage'))['innerMessage'])})
    };
    // 页面刷新重新存入循环任务科室交接信息
    if (getStore('currentCirculationConnectMessage')) {
      store.commit('changeCirculationConnectMessageList', {DtMsg: (JSON.parse(getStore('currentCirculationConnectMessage'))['innerMessage'])})
    };
    // 页面刷新重新存入医护人员生成运送类型信息
    if (getStore('currentTransportTypeMessage')) {
      store.commit('changetransportTypeMessage', {DtMsg: getStore('currentTransportTypeMessage')});
    };
    // 页面刷新重新存入循环任务完成采集科室信息
    if (getStore('completeDepartmentMessage')) {
      store.commit('changeCompleteDeparnmentInfo', {DtMsg: JSON.parse(getStore('completeDepartmentMessage'))['sureInfo']});
    };
    // 页面刷新重新存入送达的科室id
    if (getStore('currentDepartmentId')) {
      store.commit('changeStoreArriveDeparnmentId',getStore('currentDepartmentId'));
    };
    // 页面刷新重新存入过期方式
    if (getStore('storeOverDueWay')) {
      store.commit('changeOverDueWay',JSON.parse(getStore('storeOverDueWay')));
    };
    // 页面刷新重新存入是否循环采集页面取消按钮回显生效
    if (getStore('isDeleteCancel')) {
      store.commit('changeIsDeleteCancel',JSON.parse(getStore('isDeleteCancel')));
    };
    // 页面刷新重新存入是否循环采集页面生命周期回显生效
    if (getStore('isDeleteEcho')) {
      store.commit('changeIsDeleteEcho',JSON.parse(getStore('isDeleteEcho')));
    };
    // 页面刷新重新存入是否循环采集页面弹框确定按钮确定按钮点击状态
    if (getStore('isClickSure')) {
      store.commit('changeIsClickSure',JSON.parse(getStore('isClickSure')));
    };
    // 页面刷新重新存入调度任务完成扫码的出发地和单一目的地科室信息（id）
    if (getStore('completeDispatchSweepCodeInfo')) {
      store.commit('changeisCompleteSweepCode', JSON.parse(getStore('completeDispatchSweepCodeInfo'))['sweepCodeInfo']);
    };
    // 页面刷新重新存入调度任务完成扫码的非单一目的地科室信息
    if (getStore('completeDispatchSweepCodeDestinationInfo')) {
      store.commit('changeIsCompleteSweepCodeDestinationList', JSON.parse(getStore('completeDispatchSweepCodeDestinationInfo'))['sweepCodeInfo']);
    };
    // 页面刷新重新存入调度任务是否第一次扫码
     if (getStore('isDispatchFirstSweepCode')) {
      store.commit('changeIsDispatchTaskFirstSweepCode', JSON.parse(getStore('isDispatchFirstSweepCode')));
    };
    // 页面刷新重新存入预约任务完成扫码的出发地科室信息
    if (getStore('completAppointTaskSweepCodeInfo')) {
      store.commit('changeIsCompleteSweepCodeList', JSON.parse(getStore('completAppointTaskSweepCodeInfo'))['sweepCodeInfo']);
    };
    // 页面刷新重新存入预约任务完成扫码的目的地科室信息
    if (getStore('completAppointTaskSweepCodeDestinationInfo')) {
      store.commit('changeCompleteSweepcodeDestinationInfo', JSON.parse(getStore('completAppointTaskSweepCodeDestinationInfo'))['sweepCodeInfo']);
    };
    // 重新存入调度任务完成上传的照片
    if (getStore('completPhotoInfo')) {
      store.commit('changeIsCompletePhotoList', JSON.parse(getStore('completPhotoInfo'))['photoInfo']);
    };
    // 重新存入调度任务当前扫码校验通过的科室编号
    if (getStore('completDepartmentNumber')) {
      store.commit('changeCurrentDepartmentNumber', JSON.parse(getStore('completDepartmentNumber'))['number']);
    };
    // 页面刷新重新存入预约任务是否第一次扫码
    if (getStore('isAppointFirstSweepCode')) {
      store.commit('changeIsAppointTaskFirstSweepCode', JSON.parse(getStore('isAppointFirstSweepCode')));
    };
    // 页面刷新重新存入科室信息
    if (getStore('departmentInfo')) {
      store.commit('changeDepartmentInfoList', JSON.parse(getStore('departmentInfo')));
    };
    // 页面刷新重新存入科室信息编号
    if (getStore('departmentInfoNo')) {
      store.commit('changeDepartmentInfoListNo', JSON.parse(getStore('departmentInfoNo')));
    }
  },
  template: '<App/>'
})
