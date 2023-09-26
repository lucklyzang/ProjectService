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
const WorkOrderDetails = () => import('@/pages/taskDetailsPage/WorkOrderDetails')
const FillConsumable = () => import('@/pages/taskMessagePage/workOrderMessage/FillConsumable')
const WorkOrderSignature = () => import('@/pages/taskMessagePage/workOrderMessage/WorkOrderSignature')
const DepartmentWorkOrderDeatils = () => import('@/pages/taskDetailsPage/DepartmentWorkOrderDeatils')
const DepartmentServiceSignature = () => import('@/pages/taskMessagePage/departmentService/DepartmentServiceSignature')
const DepartmentServiceBill = () => import('@/pages/taskMessagePage/departmentService/DepartmentServiceBill')
const DepartmentServiceIssueReport = () => import('@/pages/taskMessagePage/departmentService/DepartmentServiceIssueReport')
const DeviceServiceDetails = () => import('@/pages/taskDetailsPage/DeviceServiceDetails')
const OperateRecordOrderDetails = () => import('@/pages/taskDetailsPage/OperateRecordOrderDetails')
const CopyDetails = () => import('@/pages/taskDetailsPage/CopyDetails')
const DeviceServiceBill = () => import('@/pages/taskMessagePage/deviceService/DeviceServiceBill')
const OperateRecordBill = () => import('@/pages/taskMessagePage/deviceService/OperateRecordBill')
const CopyRecordBill = () => import('@/pages/taskMessagePage/deviceService/CopyRecordBill')
const DepartmentServiceFillConsumable = () => import('@/pages/taskMessagePage/departmentService/DepartmentServiceFillConsumable')
const EngineeringTaskManagement = () => import('@/pages/engineeringTaskManagementPage/EngineeringTaskManagement')
const SchedulingRepairsTaskDetails = () => import('@/pages/engineeringTaskManagementPage/SchedulingRepairsTaskDetails')
const CreateRepairsTask = () => import('@/pages/engineeringTaskManagementPage/createRepairsTask')
const EditRepairsTask = () => import('@/pages/engineeringTaskManagementPage/EditRepairsTask')
const AutoRepairList = () => import('@/pages/autoRepair/AutoRepairList')
const AutoRepairHistoryRecord = () => import('@/pages/AutoRepair/autoRepairHistoryRecord')
const AutoRepairCreate = () => import('@/pages/autoRepair/AutoRepairCreate')
const AutoRepairTaskSignature = () => import('@/pages/autoRepair/AutoRepairTaskSignature')
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
  },
  {
    path: '/workOrderDetails',
    name: 'workOrderDetails',
    component:  WorkOrderDetails
  },
  {
    path: '/fillConsumable',
    name: 'fillConsumable',
    component:  FillConsumable
  },
  {
    path: '/workOrderSignature',
    name: 'workOrderSignature',
    component:  WorkOrderSignature
  },
  {
    path: '/departmentWorkOrderDeatils',
    name: 'departmentWorkOrderDeatils',
    component:  DepartmentWorkOrderDeatils
  },
  {
    path: '/departmentServiceSignature',
    name: 'departmentServiceSignature',
    component:  DepartmentServiceSignature
  },
  {
    path: '/departmentServiceBill',
    name: 'departmentServiceBill',
    component:  DepartmentServiceBill
  },
  {
    path: '/departmentServiceIssueReport',
    name: 'departmentServiceIssueReport',
    component:  DepartmentServiceIssueReport
  },
  {
    path: '/deviceServiceDetails',
    name: 'deviceServiceDetails',
    component: DeviceServiceDetails
  },
  {
    path: '/deviceServiceBill',
    name: 'deviceServiceBill',
    component: DeviceServiceBill
  },
  {
    path: '/operateRecordBill',
    name: 'operateRecordBill',
    component: OperateRecordBill
  },
  {
    path: '/copyRecordBill',
    name: 'copyRecordBill',
    component: CopyRecordBill
  },
  {
    path: '/operateRecordOrderDetails',
    name: 'operateRecordOrderDetails',
    component: OperateRecordOrderDetails
  },
  {
    path: '/copyDetails',
    name: 'copyDetails',
    component: CopyDetails
  },
  {
    path: '/departmentServiceFillConsumable',
    name: 'departmentServiceFillConsumable',
    component: DepartmentServiceFillConsumable
  },
  {
    path: '/engineeringTaskManagement',
    name: 'engineeringTaskManagement',
    component: EngineeringTaskManagement
  },
  {
    path: '/schedulingRepairsTaskDetails',
    name: 'schedulingRepairsTaskDetails',
    component: SchedulingRepairsTaskDetails
  },
  {
    path: '/createRepairsTask',
    name: 'createRepairsTask',
    component: CreateRepairsTask
  },
  {
    path: '/editRepairsTask',
    name: 'editRepairsTask',
    component: EditRepairsTask
  },
  {
    path: '/autoRepairList',
    name: 'autoRepairList',
    component: AutoRepairList
  },
  {
    path: '/autoRepairHistoryRecord',
    name: 'autoRepairHistoryRecord',
    component: AutoRepairHistoryRecord
  },
  { 
    path: '/autoRepairCreate',
    name: 'autoRepairCreate',
    component: AutoRepairCreate
  },
  {
    path: '/autoRepairTaskSignature',
    name: 'autoRepairTaskSignature',
    component: AutoRepairTaskSignature
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

router.beforeEach((to, from, next) => {
  let login = getStore('isLogin');
  let name = to.name;
  if (name === 'login') {
    if (login) {
      next({path: '/home'})
    } else {
      next()
    }
  } else {
    if (login) {
      next()
    } else {
      next({path: '/'})
    }
  }
});
export default router

