import Vue from 'vue'

// 防重复点击
Vue.directive('preventReClick', {
  inserted (el, binding) {
    let openDalay = false;
    el.addEventListener('click', () => {
      if(openDalay) return;
      openDalay = !openDalay;
      binding.value[0]();
      setTimeout(() => {
        openDalay = !openDalay
      }, binding.value[1] || 3000)
    })
  }
})