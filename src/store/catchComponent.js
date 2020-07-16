export default {
  state:{
    catch_components: [
    ]
  },
  getters:{
    catch_components: state => state.catch_components,
  },
  mutations:{
    changeCatchComponent (state, playLoad) {
      state.catch_components = playLoad
    }
  },
  actions:{}
}