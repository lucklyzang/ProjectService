import { setStore, getStore, removeStore } from '@/common/js/utils'

export default {
  state:{
    // 任务调度类型
    schedulingTaskType: {},
    // 任务调度详情
    schedulingTaskDetails: {},
    // 任务调度相关信息
    schedulingTaskAboutMessage: {},
    //操作按钮点击记录
    operateBtnClickRecord: {
      allocationBtnClick: false,
      delayBtnClick: false,
      cancelBtnClick: false
    },
    // 暂存创建维修任务的信息
    temporaryStorageCreateRepairsTaskMessage: {}
  },

  getters:{
    schedulingTaskType: (state) => {
      return state.schedulingTaskType
    },
    schedulingTaskDetails: (state) => {
      return state.schedulingTaskDetails
    },
    operateBtnClickRecord: (state) => {
      return state.operateBtnClickRecord
    },
    schedulingTaskAboutMessage: (state) => {
      return state.schedulingTaskAboutMessage
    },
    temporaryStorageCreateRepairsTaskMessage: (state) => {
      return state.temporaryStorageCreateRepairsTaskMessage
    }
  },

  mutations:{

    // 保存任务调度切换类型
    changeSchedulingTaskType (state, payLoad) {
      state.schedulingTaskType = payLoad
    },

    // 保存任务调度详情
    changeSchedulingTaskDetails (state, payLoad) {
      state.schedulingTaskDetails = payLoad
    },

     // 保存任务调度相关信息
     changeSchedulingTaskAboutMessage (state, payLoad) {
      state.schedulingTaskAboutMessage = payLoad
    },

    // 保存操作按钮点击记录
    changeOperateBtnClickRecord (state, payLoad) {
      state.operateBtnClickRecord = payLoad
    },

    // 保存暂存创建维修任务的信息
    changeTemporaryStorageCreateRepairsTaskMessage (state, payLoad) {
      state.temporaryStorageCreateRepairsTaskMessage = payLoad
    }
  },
  
  actions:{}
}
