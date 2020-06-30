export default {
  state:{
    userInfo: null,
    routerFlag: true,
    token: null, //请求token
    // 是否扫码登录
    loginSweepCode: false,
    // 用户身份
    userType: '',
    // 过期方式
    overDueWay: false,
    departmentInfoList: {},
    departmentInfoListNo: {},
    newTaskName: '',
    taskDetailsMessage: {},
    taskType: '',
    globalTimer: null,
    isFreshHomePage: false,
  },
  getters:{
    userInfo : state => state.userInfo,
    routerFlag : state => state.routerFlag,
    loginSweepCode : state => state.loginSweepCode,
    token : state => state.token,
    userType: state => state.userType,
    overDueWay: state => state.overDueWay,
    departmentInfoList: state => state.departmentInfoList,
    departmentInfoListNo: state => state.departmentInfoListNo,
    newTaskName: state => state.newTaskName,
    taskDetailsMessage: state => state.taskDetailsMessage,
    taskType: state => state.taskType,
    globalTimer: state => state.globalTimer,
    isFreshHomePage: state => state.isFreshHomePage
  },
  mutations:{
    storeUserInfo (state, playLoad) {
      state.userInfo = playLoad
    },
    changeRouterFlag (state, playLoad) {
      state.routerFlag = playLoad
    },
    changeLoginMethod (state, playLoad) {
      state.loginSweepCode = playLoad
    },
    // 修改token状态
    changeToken (state, playLoad) {
      if (playLoad && playLoad != 'null') {
        state.token = playLoad
      }
    },
    // 修改用户状态
    changeUserType (state, playLoad) {
      state.userType = playLoad
    },
    // 修改过期方式
    changeOverDueWay (state, playLoad) {
      state.overDueWay = playLoad
    },
    // 改变科室信息状态id
    changeDepartmentInfoList (state, playLoad) {
      state.departmentInfoList = playLoad
    },
    // 改变科室信息状态编号
    changeDepartmentInfoListNo (state, playLoad) {
      state.departmentInfoListNo = playLoad
    },
    // 改变新任务列表状态
    changeNewTaskList (state, playLoad) {
      state.newTaskName = playLoad
    },
    // 改变历史任务详情
    changeTaskDetailsMessage (state, playLoad) {
      state.taskDetailsMessage = playLoad
    },
    // 改变任务类型状态
    changeTaskType (state, playLoad) {
      state.taskType = playLoad
    },
    // 改变全局定时器的状态
    changeGlobalTimer (state, playLoad) {
      state.globalTimer = playLoad
    },
    // 改变是否刷新首页的状态
    changeIsFreshHomePage (state, playLoad) {
      state.isFreshHomePage = playLoad
    }
  },
  actions:{}
}