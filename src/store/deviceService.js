export default {
  state:{
    isFreshDeviceServicePage: true
  },
  getters:{
    isFreshDeviceServicePage: state => state.isFreshDeviceServicePage,
  },
  mutations:{
    changeIsFreshDeviceServicePage (state, playLoad) {
      state.isFreshDeviceServicePage = playLoad
    }
  },
  actions:{}
}