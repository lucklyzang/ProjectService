<template>
  <div>
    <div class="progress-wrapper">
      <div class="inner-content" v-for="(item,index) in progressTitleList" :key="index">
        <div class="inner-circle" :class="{'inner-circle-style': currentItem >= index}">{{index + 1}}</div>
        <div class="inner-line" :class="{'inner-line-style': currentItem >= index}" v-if="index == 0 || index == 1 || index == 2"></div>
      </div>
    </div>
    <div class="text-wrapper">
      <div v-for="item in progressTitleList" :key="item"><span>{{item}}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressStyle',
  data () {
    return {
      progressTitleList: ['扫描科室','扫描医护','扫描医废','医废称重'],
      currentItem: -1
    };
  },

  watch:{
    percentage: {
  　　handler(value) {
        switch (value) {
          case '0' :
            this.currentItem = -1
            break;
          case '13' :
            this.currentItem = 0
            break;
          case '43' :
            this.currentItem = 1
            break;
          case '68' :
            this.currentItem = 2
            break;
          case '100' :
            this.currentItem = 3
            break;
        }
  　　},
  　　deep: true
    }

  },

  computed: {
    
  },

  props: {
    percentage: {
      type: String,
      default: '0'
    }
  },

  components: {},

  mounted () {},

  methods: {}
}

</script>
<style lang='less' scoped>
@import "../common/stylus/modifyUi.less";
  .progress-wrapper {
    position: relative;
    width: 100%;
    .inner-content {
      width: 25%;
      display: inline-block;
      position: relative;
      // margin-right: 1%;
      transform: translateX(50%);
      height: 2vh;
      .inner-circle {
        transform: scale(.5);
        transform-origin: 0% top;
        background: #fff;
        width: 40px;
        height: 40px;
        display: inline-block;
        position: absolute;
        top: 4px;
        left: -10px;
        border-radius: 50%;
        font-size: 20px;
        color: #303135;
        text-align: center;
        line-height: 40px;
        text-align: center;
        border: 1px solid #b2b3b5;
        z-index: 100;
      }
      .inner-line {
        width: 100%;
        position: absolute;
        height: 5px;
        border-radius: 1px;
        background: @color-theme;
        top: 12px;
        right: 0;
        font-weight: bold
      }
    }
    .inner-circle-style {
      border: none !important;
      color: #fff !important;
      background: @color-theme !important;
      border: none
    }
    .inner-line-style {
      background: @color-theme !important
    }
  }
  .text-wrapper {
    width: 100%;
    margin-top: 26px;
    font-size: 13px;
    div {
      display: inline-block;
      width: 25%;
      height: auto;
      text-align: center;
    }
  }
</style>