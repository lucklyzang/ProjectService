import { setStore, getStore, removeStore } from '@/common/js/utils'

export default {
  state:{
    transportantTaskMessage: null,
    taskTranceMsg: ''
  },
  getters:{
    transportantTaskMessage: state => state.transportantTaskMessage,
    taskTranceMsg: state => state.taskTranceMsg
  },
  mutations:{
    // 改变运送任务信息状态
    changetransportTypeMessage (state,payLoad) {
      state.transportantTaskMessage = payLoad.DtMsg
    },
    // 改变任务跟踪信息的状态
    changeTaskTranceMsg (state,payLoad) {
      state.taskTranceMsg = payLoad
    }
  },
  actions:{}
}