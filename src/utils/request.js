import axios from 'axios'
import store from '@/store'
import router from '../router'
import Vue from 'vue';
import { removeAllLocalStorage,getStore } from '@/common/js/utils'
import { Dialog, Toast } from 'vant';
// 全局注册
Vue.use(Dialog);
import { setStore } from '@/common/js/utils'
// http://blink.blinktech.cn/project 测试地址
// http://blinktech.cn/project 正式地址
const service = axios.create({
  baseURL: 'http://blink.blinktech.cn/project', //接口基础地址
  retry: 2, // 网络请求异常后，重试次数
  retryDelay: 1000, // 每次重试间隔时间
  shouldRetry: (err) => true // 重试条件
});

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = store.getters.token
    };
    return config
  },

  error => {
    console.log(error)
    return Promise.reject(error)
  }
);

// response interceptor
service.interceptors.response.use(
  response => {
    // 获取响应头token,并存储到vuex和localStorage中
    if (response.headers['token']) {
      store.commit('changeToken', response.headers['token']);
      setStore('questToken', response.headers['token']);
    };
    if (!response.headers.hasOwnProperty('token')) {
      if (response.data.msg == `当前用户[${getStore('userName')}]已登陆,不可重复登陆`) {
				return response
		  };
      if (!store.getters.overDueWay) {
        Toast('token已过期,请重新登录');
        if(store.getters.globalTimer) {window.clearInterval(store.getters.globalTimer)};
        removeAllLocalStorage();
        setTimeout(() => {
          router.push({path: '/'})
        },2000);
      }
    };
    return response
  },
  (err) => {
    var config = err.config;
    // 判断是否配置了重试
    if(!config || !config.retry) return Promise.reject(err);
    if(!config.shouldRetry || typeof config.shouldRetry != 'function') {
      if (err.message == 'Network Error') {
        return Promise.reject({message:'网络错误'});
      } else {
        return Promise.reject(err);
      }
    };
    //判断是否满足重试条件
    if(!config.shouldRetry(err)) {
      if (err.message == 'Network Error') {
        return Promise.reject({message:'网络错误'});
      } else {
        return Promise.reject(err);
      }
    };
    // 设置重置次数，默认为0
    config.__retryCount = config.__retryCount || 0;
    // 判断是否超过了重试次数
     if(config.__retryCount > config.retry) {
       if (err.message == 'Network Error') {
         return Promise.reject({message:'网络错误'});
       } else {
         return Promise.reject(err);
       }
     };
    //重试次数自增
    config.__retryCount += 1;
    //延时处理
    var backoff = new Promise(function(resolve) {
      setTimeout(function() {
        resolve();
      }, config.retryDelay || 1);
    });
    //重新发起axios请求
    return backoff.then(function() {
      return service(config);
    })
  }
);

export default service
