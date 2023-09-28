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
    originalSignature: null,
    timeMessage: {}, //阿里云签名过期时间信息
    ossMessage: {}, //阿里云签名信息
    currentElectronicSignature: null,
    newTaskName: [],
    taskType: '',
    navTopTitle: '',
    globalTimer: null,
  },
  getters:{
    userInfo : state => state.userInfo,
    routerFlag : state => state.routerFlag,
    loginSweepCode : state => state.loginSweepCode,
    token : state => state.token,
    userType: state => state.userType,
    overDueWay: state => state.overDueWay,
    newTaskName: state => state.newTaskName,
    taskType: state => state.taskType,
    globalTimer: state => state.globalTimer,
    timeMessage: state => state.timeMessage,
    ossMessage: state => state.ossMessage,
    navTopTitle: state => state.navTopTitle,
    originalSignature: state => state.originalSignature,
    currentElectronicSignature: state => state.currentElectronicSignature,
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
    // 改变原始签名状态
    changeOriginalSignature (state, playLoad) {
      state.originalSignature = playLoad
    },
    // 改变当前签名状态
    changeCurrentElectronicSignature (state, playLoad) {
      state.currentElectronicSignature = playLoad.DtMsg
    },
    // 修改用户状态
    changeUserType (state, playLoad) {
      state.userType = playLoad
    },
    // 修改过期方式
    changeOverDueWay (state, playLoad) {
      state.overDueWay = playLoad
    },
    //保存阿里云签名过期日期
    changeTimeMessage (state, playLoad) {
      state.timeMessage = playLoad
    },

    //保存阿里云签名信息
    changeOssMessage (state, playLoad) {
      state.ossMessage = playLoad
    },
    // 改变新任务列表状态
    changeNewTaskList (state, playLoad) {
      state.newTaskName = playLoad
    },
    // 改变任务类型状态
    changeTaskType (state, playLoad) {
      state.taskType = playLoad
    },
    // 改变全局定时器的状态
    changeGlobalTimer (state, playLoad) {
      state.globalTimer = playLoad
    },
    // 改变路由标题状态
    changeTitleTxt (state, playLoad) {
      state.navTopTitle = playLoad.tit
    }
  },
  actions:{}
}