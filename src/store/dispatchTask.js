import { setStore, getStore, removeStore } from '@/common/js/utils'

export default {
  state:{
    navTitle: '中央运送',
    dispatchTaskMessage: null,
    dispatchTaskTransferIdList: [],
    dispatchTaskCancelIdList: [],
    dispatchTaskState: '',
    dispatchTaskId: '',
    dispatchTaskDepartmentType: '',
    isCoerceTakePhoto: false,
    isCompleteSweepCode: [],
    isCompleteSweepCodeDestinationList: [],
    isDispatchTaskFirstSweepCode: true,
    isCompletePhotoList: [],
    isBack: '',
    isSign: '',
    isSingleDestination: '',
    showEndTaskBtn: false,
    isFreshDispatchTaskPage: true,
    currentDepartmentNumber: []
  },
  getters:{
    navTopTitle: state => state.navTitle,
    dispatchTaskMessage: state => state.dispatchTaskMessage,
    dispatchTaskTransferIdList: state => state.dispatchTaskTransferIdList,
    dispatchTaskCancelIdList: state => state.dispatchTaskCancelIdList,
    dispatchTaskState: state => state.dispatchTaskState,
    dispatchTaskDepartmentType: state => state.dispatchTaskDepartmentType,
    isCoerceTakePhoto: state => state.isCoerceTakePhoto,
    isCompleteSweepCode: state => state.isCompleteSweepCode,
    isDispatchTaskFirstSweepCode: state => state.isDispatchTaskFirstSweepCode,
    isCompletePhotoList: state => state.isCompletePhotoList,
    isBack: state => state.isBack,
    isSign: state => state.isSign,
    dispatchTaskId: state => state.dispatchTaskId,
    isSingleDestination:  state => state.isSingleDestination,
    showEndTaskBtn: state => state.showEndTaskBtn,
    isCompleteSweepCodeDestinationList: state => state.isCompleteSweepCodeDestinationList,
    isFreshDispatchTaskPage: state => state.isFreshDispatchTaskPage,
    currentDepartmentNumber: state => state.currentDepartmentNumber
  },
  mutations:{
    // 改变页面标题
    changeTitleTxt (state,payLoad) {
      state.navTitle = payLoad.tit
    },

    // 改变调度任务信息状态
    changeDispatchTaskMessage (state,payLoad) {
      state.dispatchTaskMessage = payLoad.DtMsg
    },

    // 改变调度任务id状态
    changeDispatchTaskId (state,payLoad) {
      state.dispatchTaskId = payLoad
    },

    // 改变转移人员列表状态
    changedispatchTaskTransferIdList (state,payLoad) {
      state.dispatchTaskTransferIdList = payLoad.DtMsg
    },
    // 改变取消原因列表状态
    changedispatchTaskCancelIdList (state,payLoad) {
      state.dispatchTaskCancelIdList = payLoad.DtMsg
    },
    // 改变调度任务状态的状态
    changeDispatchTaskState (state,payLoad) {
      state.dispatchTaskState = payLoad
    },
    // 改变调度任务科室类型的状态
    changeDispatchTaskDepartmentType (state,payLoad) {
      state.dispatchTaskDepartmentType = payLoad
    },
    //改变是否强制拍照的状态
    changeIsCoerceTakePhoto (state,payLoad) {
      state.isCoerceTakePhoto = payLoad
    },
    //改变是否完成扫码的状态(出发地和单一目的地的id)
    changeisCompleteSweepCode (state,payLoad) {
      state.isCompleteSweepCode = payLoad
    },
    //改变是否完成非单一目的地扫码的状态
    changeIsCompleteSweepCodeDestinationList (state,payLoad) {
      state.isCompleteSweepCodeDestinationList = payLoad
    },
    //改变是否首次扫码的状态
    changeIsDispatchTaskFirstSweepCode (state,payLoad) {
      state.isDispatchTaskFirstSweepCode = payLoad
    },
    //改变完成上传的照片
     changeIsCompletePhotoList (state,payLoad) {
      state.isCompletePhotoList = payLoad
    },
    //改变是否返回出发地的状态
    changeIsBack (state,payLoad) {
      state.isBack = payLoad
    },
    //改变是否签字的状态
    changeIsSign (state,payLoad) {
      state.isSign = payLoad
    },
    //改变是否是单一目的地状态
    changeIsSingleDestination (state,payLoad) {
      state.isSingleDestination = payLoad
    },
    // 改变是否显示结束任务按钮状态
    changeShowEndTaskBtn (state,payLoad) {
      state.showEndTaskBtn = payLoad
    },
    // 改变是否刷新任务页的状态
    changeIsFreshDispatchTaskPage (state,payLoad) {
      state.isFreshDispatchTaskPage = payLoad
    },
    // 改变当前科室标号状态
    changeCurrentDepartmentNumber (state,payLoad) {
      state.currentDepartmentNumber = payLoad
    },
  },
  actions:{}
}