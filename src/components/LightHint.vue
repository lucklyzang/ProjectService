<template>
    <div class="light-hint" v-if="isShow">
        <img :src="type == 'success' ? passedPng : exclamationPointPng" alt="">
        <span>{{message}}</span>
    </div>
</template>
 
<script>
export default {
  name: 'LightHint',
  props: {
    type: {
      type: String,
      default: "success"
    },
    message: {
      type: String,
      default: ""
    },
    duration: {
      type: Number,
      default: 3000 //默认3000毫秒消失
    }
  },
  data() {
    return {
      exclamationPointPng: require("@/common/images/home/exclamation-point.png"),
      passedPng: require("@/common/images/home/passed.png"),
      isShow: false //是否显示标识
    };
  },
  methods: {
    show() {
      this.isShow = true;
      setTimeout(this.hide, this.duration);//设置时间自动消失
    },
    hide() {
      this.isShow = false;
      this.remove();//移除
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
 .light-hint {
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 216px;
    height: 48px;
    position: fixed;
    z-index: 1000;
    bottom: 200px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    color: #101010;
    font-size: 14px;
    span {
      vertical-align: middle;
      margin-left: 10px
    };
    img {
      vertical-align: middle;
      width: 24px;
      height: 24px
    }
  }
</style>