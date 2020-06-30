import { deepClone } from '@/common/js/utils'

export default {
  state:{
    arriveDepartmentId: false,
    storeArriveDeparnmentId: '',
    circulationTaskMessage: null,
    currentElectronicSignature: null,
    circulationCollectMessageList: [],
    isCollectEnterSweepCodePage: false,
    circulationConnectMessageList: [],
    isrefreshCirculationConnectPage: false,
    completeDeparnmentInfo: [],
    stipulateOfficeList: [],
    storeAlreadyConnectSample: [],
    storeNoConnectSample: [],
    isDeleteEcho: false,
    isDeleteCancel: false,
    isClickSure: false,
    circulationDetails: null,
    verifyCirculationOfficeId: '',
    isFreshCirculationTaskPage: true,
    circulationTaskId: ''
  },
  getters:{
    arriveCirculationTaskId: state => state.arriveCirculationTaskId,
    circulationTaskMessage: state => state.circulationTaskMessage,
    currentElectronicSignature: state => state.currentElectronicSignature,
    circulationCollectMessageList: state => state.circulationCollectMessageList,
    isCollectEnterSweepCodePage: state => state.isCollectEnterSweepCodePage,
    circulationConnectMessageList: state => state.circulationConnectMessageList,
    isrefreshCirculationConnectPage: state => state.isrefreshCirculationConnectPage,
    completeDeparnmentInfo: state => state.completeDeparnmentInfo,
    stipulateOfficeList: state => state.stipulateOfficeList,
    arriveDepartmentId: state => state.arriveDepartmentId,
    storeArriveDeparnmentId: state => state.storeArriveDeparnmentId,
    storeAlreadyConnectSample: state => state.storeAlreadyConnectSample,
    storeNoConnectSample: state => state.storeNoConnectSample,
    isDeleteEcho: state => state.isDeleteEcho,
    isDeleteCancel: state => state.isDeleteCancel,
    isClickSure: state => state.isClickSure,
    circulationDetails: state => state.circulationDetails,
    verifyCirculationOfficeId: state => state.verifyCirculationOfficeId,
    isFreshCirculationTaskPage: state => state.isFreshCirculationTaskPage,
    circulationTaskId: state => state.circulationTaskId
  },
  mutations:{
    // 改变电子签名状态
    changeCurrentElectronicSignature (state,payLoad) {
      state.currentElectronicSignature = payLoad.DtMsg
    },
    // 改变循环采集信息状态
     changeCirculationCollectMessageList (state,payLoad) {
      state.circulationCollectMessageList = deepClone(payLoad.DtMsg)
    },
    // 改变是否是采集环节进入扫码页面
    changeIsCollectEnterSweepCodePage (state,payLoad) {
      state.isCollectEnterSweepCodePage = payLoad
    },
    // 改变循环信息交接状态
    changeCirculationConnectMessageList (state,payLoad) {
      state.circulationConnectMessageList = deepClone(payLoad.DtMsg)
    },
    // 改变是否刷新交接页面状态
    changeIsrefreshCirculationConnectPage (state,payLoad) {
      state.isrefreshCirculationConnectPage = payLoad
    },
    // 改变采集完成科室信息的状态
    changeCompleteDeparnmentInfo (state,payLoad) {
      state.completeDeparnmentInfo = deepClone(payLoad.DtMsg)
    },
    // 改变要扫码的科室列表状态
    changeStipulateOfficeList (state,payLoad) {
      state.stipulateOfficeList = payLoad
    },
    // 改变送达科室是否扫码状态
    changeArriveDepartmentId (state,payLoad) {
      state.arriveDepartmentId = payLoad
    },
    // 改变送达科室id状态
    changeStoreArriveDeparnmentId (state,payLoad) {
      state.storeArriveDeparnmentId = payLoad
    },
    // 改变已经交接的标本状态
    changeIsstoreAlreadyConnectSample (state,payLoad) {
      state.storeAlreadyConnectSample = deepClone(payLoad)
    },
    // 改变没有交接的标本状态
    changeIsStoreNoConnectSample (state,payLoad) {
      state.storeNoConnectSample = deepClone(payLoad)
    },
    // 改变采集页面是否按钮回显生效状态
    changeIsDeleteCancel(state,payLoad) {
      state.isDeleteCancel = payLoad
    },
    // 改变采集页面是否mounted周期回显生效状态
     changeIsDeleteEcho(state,payLoad) {
      state.isDeleteEcho = payLoad
    },
    // 改变采集页面是否点击弹框确定按钮状态
     changeIsClickSure(state,payLoad) {
      state.isClickSure = payLoad
    },
    // 改变循环任务详细信息
    changeCirculationDetails (state,payLoad) {
      state.circulationDetails = payLoad
    },
    // 改变校验通过的科室id状态
    changeVerifyCirculationOfficeId (state,payLoad) {
      state.verifyCirculationOfficeId = payLoad
    },
    // 改变是否刷新任务页的状态
    changeIsFreshCirculationTaskPage (state,payLoad) {
      state.isFreshCirculationTaskPage = payLoad
    },
    // 改变循环任务id状态
    changeCirculationTaskId (state,payLoad) {
      state.circulationTaskId = payLoad
    }
  },
  actions:{}
}