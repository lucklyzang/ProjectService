export default {
  state:{
    isFreshDeviceServicePage: true,
    deviceServiceMsg: '',
    energyRecordList: [],
    isCurrentDeviceCopyServiceVerifySweepCode: [],
    completeDeviceEnergyRecordServiceOfficeInfo: []
  },
  getters:{
    isFreshDeviceServicePage: state => state.isFreshDeviceServicePage,
    deviceServiceMsg: state => state.deviceServiceMsg,
    energyRecordList: state => state.energyRecordList,
    isCurrentDeviceCopyServiceVerifySweepCode: state => state.isCurrentDeviceCopyServiceVerifySweepCode,
    completeDeviceEnergyRecordServiceOfficeInfo: state => state.completeDeviceEnergyRecordServiceOfficeInfo
  },
  mutations:{
    changeIsFreshDeviceServicePage (state, playLoad) {
      state.isFreshDeviceServicePage = playLoad
    },
    // 改变每条任务下各个科室能耗录入数据状态
    changeEnergyRecordList (state, playLoad) {
      state.energyRecordList = playLoad
    },
    // 改变设备巡检任务详细信息的状态
    changeDeviceServiceMsg (state, playLoad) {
      state.deviceServiceMsg = playLoad
    },
    // 改变设备巡检中能耗录入扫码校验通过的当前科室编号的状态
    changeIsCurrentDeviceCopyServiceVerifySweepCode (state, playLoad) {
      state.isCurrentDeviceCopyServiceVerifySweepCode = playLoad
    },
    // 改变设备巡检中完成能耗录入的当前科室编号的状态
    changeCompleteDeviceEnergyRecordServiceOfficeInfo (state, playLoad) {
      state.completeDeviceEnergyRecordServiceOfficeInfo = playLoad
    }
  },
  actions:{}
}