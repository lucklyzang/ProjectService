export default {
  state:{
    isFreshDepartmentServicePage: true,
    departmentServiceMsg: '',
    isDepartmentServiceVerifySweepCode: [],
    isCurrentDepartmentServiceVerifySweepCode: []
  },
  getters:{
    isFreshDepartmentServicePage: state => state.isFreshDepartmentServicePage,
    departmentServiceMsg: state => state.departmentServiceMsg,
    isDepartmentServiceVerifySweepCode: state => state.isDepartmentServiceVerifySweepCode,
    isCurrentDepartmentServiceVerifySweepCode: state => state.isCurrentDepartmentServiceVerifySweepCode
  },
  mutations:{
    // 改变是否刷新巡检任务首页的状态
    changeIsFreshDepartmentServicePage (state, playLoad) {
      state.isFreshDepartmentServicePage = playLoad
    },
    // 改变巡检任务信信的状态
    changeDepartmentServiceMsg (state, playLoad) {
      state.departmentServiceMsg = playLoad
    },
    // 改变巡检任务扫码校验通过的科室编号
    changeIsDepartmentServiceVerifySweepCode (state, playLoad) {
      state.isDepartmentServiceVerifySweepCode = playLoad
    },
    // 改变当前巡检任务扫码校验通过的科室编号
    changeIsCurrentDepartmentServiceVerifySweepCode (state, playLoad) {
      state.isCurrentDepartmentServiceVerifySweepCode = playLoad
    }
  },
  actions:{}
}