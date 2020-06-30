import Vue from 'vue'
import Router from 'vue-router'
import {setStore, getStore} from '@/common/js/utils.js'
import store from '@/store'
const Home = () => import('@/pages/Home')
const Login = () => import('@/pages/Login')
const MyInfo = () => import('@/pages/MyInfo')
const RepairsWorkOrder = () => import('@/pages/taskPage/RepairsWorkOrder')
const DeviceService = () => import('@/pages/taskPage/DeviceService')
const DepartmentService = () => import('@/pages/taskPage/DepartmentService')
Vue.use(Router)

let baseRoute  = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/myInfo',
    name: 'myInfo',
    component: MyInfo
  },
  {
    path: '/repairsWorkOrder',
    name: 'repairsWorkOrder',
    component: RepairsWorkOrder
  },
  {
    path: '/deviceService',
    name: 'deviceService',
    component: DeviceService
  },
  {
    path: '/departmentService',
    name: 'departmentService',
    component: DepartmentService
  }
];
let router = new Router({
  routes: baseRoute,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
});
// router.beforeEach((to, from, next) => {
//   if (getStore('isLogin')) {
//     if (to.name === 'login') {
//       // 判断登录方式(用户名密码登录或扫码登录)PadDispatchTaskCancelForm
//       if (getStore('userName') && getStore('userPassword')) {
//         next({path: '/home'})
//       } else {
//         next()
//       }
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// });
export default router

