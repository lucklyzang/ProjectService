export default {
  state:{
    isFreshDepartmentServicePage: true,
    departmentServiceMsg: ''
  },
  getters:{
    isFreshDepartmentServicePage: state => state.isFreshDepartmentServicePage,
    departmentServiceMsg: state => state.departmentServiceMsg
  },
  mutations:{
    changeIsFreshDepartmentServicePage (state, playLoad) {
      state.isFreshDepartmentServicePage = playLoad
    },
    changeDepartmentServiceMsg (state, playLoad) {
      state.departmentServiceMsg = playLoad
    }
  },
  actions:{}
}