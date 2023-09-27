import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import catchComponent from './catchComponent.js'
import repairsWorkOrder from './repairsWorkOrder'
import taskScheduling from './taskScheduling.js'
import deviceService from './deviceService'
import departmentService from './departmentService'
import autoRepairTask from './autoRepairTask'
Vue.use(Vuex);
export default new Vuex.Store({
  modules:{
    login,
    catchComponent,
    repairsWorkOrder,
    taskScheduling,
    deviceService,
    departmentService,
    autoRepairTask
  }
});