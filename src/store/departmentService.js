export default {
  state:{
    isFreshDepartmentServicePage: true,
    departmentServiceMsg: '',
    isDepartmentServiceVerifySweepCode: [],
    isCurrentDepartmentServiceVerifySweepCode: [],
    departmentServiceOfficeId: '',
    completeDepartmentServiceOfficeInfo: [],
    currentDepartmentServiceCheckedItemId: null,
    completeDepartmentServiceCheckedItemList: []
  },
  getters:{
    isFreshDepartmentServicePage: state => state.isFreshDepartmentServicePage,
    departmentServiceMsg: state => state.departmentServiceMsg,
    isDepartmentServiceVerifySweepCode: state => state.isDepartmentServiceVerifySweepCode,
    isCurrentDepartmentServiceVerifySweepCode: state => state.isCurrentDepartmentServiceVerifySweepCode,
    departmentServiceOfficeId: state => state.departmentServiceOfficeId,
    completeDepartmentServiceOfficeInfo: state => state.completeDepartmentServiceOfficeInfo,
    currentDepartmentServiceCheckedItemId: state => state.currentDepartmentServiceCheckedItemId,
    completeDepartmentServiceCheckedItemList: state => state.completeDepartmentServiceCheckedItemList
  },
  mutations:{
    // 改变是否刷新巡检任务首页的状态
    changeIsFreshDepartmentServicePage (state, playLoad) {
      state.isFreshDepartmentServicePage = playLoad
    },
    // 改变巡检任务信息的状态
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
    },
    // 改变当前巡检任务扫码校验通过的科室编号
     changeDepartmentServiceOfficeId (state, playLoad) {
      state.departmentServiceOfficeId = playLoad
    },
    // 改变完成巡检任务的科室信息
    changeCompleteDepartmentServiceOfficeInfo (state, playLoad) {
      state.completeDepartmentServiceOfficeInfo = playLoad
    },
    // 改变当前点击过的检查项id
    changeCurrentDepartmentServiceCheckedItemId (state, playLoad) {
      state.currentDepartmentServiceCheckedItemId = playLoad
    },
    // 改变当前完成问题上报的检查项id
    changeCompleteDepartmentServiceCheckedItemList (state, playLoad) {
      state.completeDepartmentServiceCheckedItemList = playLoad
    }
  },
  actions:{}
}