<template>
  <header class="header">
    <slot name="left" class="left"></slot>
    <span class="header_title">
      <span class="header_title_text ellipsis">{{title}}</span>
    </span>
    <slot name="right" class="right"></slot>
  </header>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Loading from '../components/Loading'
import { formatTime, setStore, IsPC} from '@/common/js/utils'
export default {
  name: 'HeaderTop',
  props:{
    title:String
  }
}
</script>

<style lang='less' scoped>
  @import "../common/stylus/mixin.less";
  @import "../common/stylus/variable.less";
  .header {
    background: @color-theme;
    background-position: center center;
    background-size: 100% 100%;
    width: 100%;
    height: @header-title-height;
    line-height: @header-title-height;
    .header_title {
      position: absolute;
      height: @header-title-height;
      line-height: @header-title-height;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      color: #fff;
      text-align: center;
      .header_title_text {
        font-size: 18px;
        color: #fff;
        display: block
      }
    }
  }
</style>
