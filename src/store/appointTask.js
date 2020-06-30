import { setStore, getStore, removeStore } from '@/common/js/utils'

export default {
  state:{
    appointTaskMessage: null,
    appointTaskTransferIdList: [],
    appointTaskState: '',
    appointTaskDepartmentType: '',
    appointSweepCodeNumber: false,
    appointSweepCodeIntoPage: false,
    cancelTaskIdList: [],
    originalSignature: null,
    isCompleteSweepCodeList: [],
    isAppointTaskFirstSweepCode: true,
    completeSweepcodeDestinationInfo: [],
    surplusDestinationList: []
  },
  getters:{
    appointTaskMessage: state => state.appointTaskMessage,
    appointTaskTransferIdList: state => state.appointTaskTransferIdList,
    appointTaskState: state => state.appointTaskState,
    appointTaskDepartmentType: state => state.appointTaskDepartmentType,
    appointSweepCodeNumber: state => state.appointSweepCodeNumber,
    appointSweepCodeIntoPage: state => state.appointSweepCodeIntoPage,
    cancelTaskIdList: state => state.cancelTaskIdList,
    originalSignature: state => state.originalSignature,
    isCompleteSweepCodeList: state => state.isCompleteSweepCodeList,
    isAppointTaskFirstSweepCode: state => state.isAppointTaskFirstSweepCode,
    completeSweepcodeDestinationInfo: state => state.completeSweepcodeDestinationInfo,
    surplusDestinationList: state => state.surplusDestinationList
  },
  mutations:{
    // 改变预约任务信息状态
    changeAppointTaskMessage (state,payLoad) {
      state.appointTaskMessage = payLoad.DtMsg
    },
    // 改变转移人员列表状态
    changeAppointTaskTransferIdList (state,payLoad) {
      state.appointTaskTransferIdList = payLoad.DtMsg
    },
    // 改变预约任务状态的状态
    changeAppointTaskState (state,payLoad) {
      state.appointTaskState = payLoad
    },
    // 改变预约任务科室类型的状态
    changeAppointTaskDepartmentType (state,payLoad) {
      state.appointTaskDepartmentType = payLoad
    },
    // 改变预约任务的扫码次数状态
    changeAppointSweepCodeNumber (state,payLoad) {
      state.appointSweepCodeNumber = payLoad
    },
    // 改变预约任务扫码后进入页面的状态
    changeAppointSweepCodeIntoPage (state,payLoad) {
      state.appointSweepCodeIntoPage = payLoad
    },
    // 改变取消原因列表状态
    changeAppoinTaskCancelIdList (state,payLoad) {
      state.cancelTaskIdList = payLoad.DtMsg
    },
    // 改变原始签名状态
    changeOriginalSignature (state,payLoad) {
      state.originalSignature = payLoad
    },
    // 改变科室是否完成扫码状态
    changeIsCompleteSweepCodeList (state,payLoad) {
      state.isCompleteSweepCodeList = payLoad
    },
    //改变是否首次扫码的状态
    changeIsAppointTaskFirstSweepCode (state,payLoad) {
      state.isAppointTaskFirstSweepCode = payLoad
    },
    //改变完成扫码目的地信息的状态
    changeCompleteSweepcodeDestinationInfo (state,payLoad) {
      state.completeSweepcodeDestinationInfo = payLoad
    },
    //改变没有扫码目的地状态
    changeSurplusDestinationList (state,payLoad) {
      state.surplusDestinationList = payLoad
    }
  },
  actions:{}
}