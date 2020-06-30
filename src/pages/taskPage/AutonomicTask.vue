<template>
  <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon> 
    </HeaderTop>
    <div>自主任务</div>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  //  import {getAlltTaskNumber} from '@/api/workerPort.js'
  import NoData from '@/components/NoData'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  export default {
    data () {
      return {
      };
    },

    components: {
      HeaderTop,
      NoData,
      FooterBottom
    },

    computed: {
      ...mapGetters([
        'navTopTitle'
      ])
    },

    mounted () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.changeTitleTxt({tit:'中央运送'});
          setStore('currentTitle','中央运送') 
        })
      }
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt'
      ]),
      // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

      // 返回上一页
      backTo () {
        this.$router.go(-1);
        this.changeTitleTxt({tit:'中央运送'});
        setStore('currentTitle','中央运送')
      }
    }
}

</script>
<style lang='less' scoped>
  @import "~@/common/stylus/variable.less";
  @import "~@/common/stylus/mixin.less";
  @import "~@/common/stylus/modifyUi.less";
  .content-wrapper {
    .content-wrapper();
  }
</style>