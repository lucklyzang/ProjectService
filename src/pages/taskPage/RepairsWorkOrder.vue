<template>
  <div class="content-wrapper">
    <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <div class="loading">
      <loading :isShow="showLoadingHint" textContent="加载中,请稍候····" textColor="#2895ea"></loading>
    </div>
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
    </HeaderTop>
   <!-- 右边下拉框菜单 -->
    <van-dialog v-model="toolShow" title="请选择退回原因" show-cancel-button width="92%"
          @confirm="toolSure" @cancel="toolCancel"
        >
          <div class="tool-name-list">
            <div class="tool-name-list-title-innner">退回原因:</div>
            <div class="tool-name-list-content">
              <span :class="{spanStyle:toolIndex === index}" v-for="(item,index) in vehicleOperationList" :key="`${item}-${index}`" @click="toolCheck(item,index)">
                {{item.text}}
              </span>
            </div>
          </div>
    </van-dialog>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import { mapGetters, mapMutations } from 'vuex'
  import store from '@/store'
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  export default {
    name: 'RepairsWorkOrder',
    data () {
      return {
      };
    },

    components: {
      HeaderTop,
      NoData,
      Loading,
      FooterBottom
    },

    computed: {
      ...mapGetters([
        'navTopTitle',
        'userInfo'
      ]),
      proId () {
        return this.userInfo.extendData.proId
      },
      workerId () {
        return JSON.parse(getStore('userInfo')).extendData.userId
      }
    },

    watch : {
    },

    mounted () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        let that = this;
        pushHistory();
        that.gotoURL(() => {
          pushHistory();
          this.$router.push({path: 'home'});
          this.changeTitleTxt({tit:'工程管理系统'});
          setStore('currentTitle','工程管理系统')
        })
      }
      
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt'
      ]),

      // 返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'工程管理系统'});
        setStore('currentTitle','工程管理系统')
      }
    }
}

</script>
<style lang='less' scoped>
  @import "~@/common/stylus/variable.less";
  @import "~@/common/stylus/mixin.less";
  @import "~@/common/stylus/modifyUi.less";
  .content-wrapper {
    /deep/ .van-dialog {
      .van-dialog__content {
        margin-bottom: 6px;
        height: 200px;
        margin: 10px 0;
        .tool-name-list {
          width: 94%;
          height: 100%;
          overflow: auto;
          margin: 0 auto;
          padding: 0;
          border: 1px solid #b2b2b2;
          .tool-name-list-title-innner {
            padding: 10px;
          }
          .tool-name-list-content {
            padding: 6px;
            .spanStyle {
              color: #fff;
              background: #2895ea
            }
            span {
              display: inline-block;
              width: 48%;
              height: 40px;
              text-align: center;
              margin-bottom: 8px;
              line-height: 40px;
              background: #f3f3f3;
              margin-right: 4%;
              &:nth-child(even) {
                margin-right: 0
              }
            }
          }
        }
      }
    };
    .content-wrapper();
    position: relative;
    font-size: 14px;
    .no-data {
      position: absolute;
      top: 200px;
      left: 0;
      width: 100%;
      text-align: center;
    }
    .loading {
      position: absolute;
      top: 260px;
      left: 0;
      width: 100%;
      height: 50px;
      text-align: center;
    };
  }
</style>