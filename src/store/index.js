import Vue from 'vue';
import Vuex from 'vuex';
import dispatchTask from './dispatchTask.js'
import appointTask from './appointTask.js'
import circulationTask from './circulationTask.js'
import medicalTask from './medicalTask.js'
import login from './login.js'
import catchComponent from './catchComponent.js'
Vue.use(Vuex);
export default new Vuex.Store({
  modules:{
    dispatchTask,
    appointTask,
    circulationTask,
    medicalTask,
    login,
    catchComponent
  }
});