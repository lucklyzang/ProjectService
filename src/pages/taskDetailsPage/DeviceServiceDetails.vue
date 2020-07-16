<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <p class="content-top-other">
          <span>巡检编号</span>
          <span>
            2121212121
          </span>
        </p>
        <p class="content-top-other">
          <span>巡检名称</span>
          <span>
            {{name}}
          </span>
        </p>
        <p class="content-top-other">
          <span>当前次数</span>
          <span>
            {{phoneNumber}}
          </span>
        </p>
        <p class="content-top-other">
          <span>时间</span>
          <span>
            {{departmentName}}
          </span>
        </p>
      </div>
      <div class="content-middle">
        <p>巡检设备</p>
        <ul>
          <li v-for="(item,index) in viewPointList" :key="`${item}-${index}`">{{item}}</li>
        </ul>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="fillConsumable">扫一扫</p>
        <p class="quit-account" @click="completeTask">完成巡检</p>
      </div>
    </div>
  </div>
</template>
<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage } from '@/common/js/utils'
  export default {
    name: 'DeviceServiceDetails',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        name: '撒飒飒',
        phoneNumber: '132212121',
        personPosition: '维修员',
        viewPointList: ['科室一飒飒','科室一查询查询从','科室一想','科室一下载','科室一没那么','科室一婆婆','科室一的','科室一传','科室一辅导费','科室一']
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'deviceService'});
          this.changeTitleTxt({tit:'设备巡检'});
          setStore('currentTitle','设备巡检')
        })
      };
      // 二维码回调方法绑定到window下面,提供给外部调用
      let me = this;
      window['scanQRcodeCallback'] = (code) => {
        me.scanQRcodeCallback(code);
      };
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
      ]),
      userName () {
       return this.userInfo.userName
      },
      userTypeId () {
        return this.userInfo.extendData.user_type_id
      },
      proId () {
        return this.userInfo.extendData.proId
      },
      proName () {
        return this.userInfo.extendData.proName
      },
      workerId () {
        return this.userInfo.extendData.userId
      },
      name () {
        return this.userInfo.name
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt'
      ]),

      // 摄像头扫码后的回调
      scanQRcodeCallback(code) {
        if (code) {}
      },

      //返回上一页
      backTo () {
        this.$router.push({path: 'deviceService'});
        this.changeTitleTxt({tit:'设备巡检'});
        setStore('currentTitle','设备巡检')
      },

      // 扫一扫
      fillConsumable () {
        this.$router.push({path: 'deviceServiceBill'});
        this.changeTitleTxt({tit:'设备巡检单'});
        setStore('currentTitle','设备巡检单')
        // window.android.scanQRcode()
      },

      // 完成巡检
      completeTask () {
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
    position: relative;
     .no-data {
      position: absolute;
      top: 245px;
      left: 13%;
      width: 100%;
      text-align: center;
      z-index: 100
    }
    .loading {
      position: absolute;
      top: 280px;
      left: 13%;
      width: 100%;
      height: 100px;
      text-align: center;
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-top {
        font-size: 14px;
        background: #fff;
        .content-top-name {
          height: 90px;
          padding: 10px;
          box-sizing: border-box;
          position: relative;
          .bottom-border-1px(#dadada);
          > span {
            position: absolute;
            display: inline-block;
            &:first-child {
              left: 0;
              top: 16px;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #2c65f7;
              font-weight: bold;
              right: 10px;
              top: 16px;
              width: 300px;
              padding-left: 50px;
              box-sizing: border-box;
              line-height: 18px;
              height: 65px;
              overflow: auto
            }
          }
        };
        .content-top-other {
          height: 45px;
          line-height: 45px;
          box-sizing: border-box;
          position: relative;
          .bottom-border-1px(#dadada);
          &:last-child {
            .bottom-border-1px(#fff)
          }
          > span {
            position: absolute;
            display: inline-block;
            &:first-child {
              left: 0;
              top: 0;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #2c65f7;
              font-weight: bold;
              right: 10px;
              top: 0
            }
          }
        }
      };
      .content-middle {
        flex: 1;
        margin: 0 auto;
        border-top: 4px solid #f7f7f7;
        width: 100%;
        overflow: auto;
        font-size: 13px;
        background: #fff;
        padding: 10px;
        position: relative;
        > p {
          color: #bbbaba;
          height: 5%;
        };
        ul {
          width: 100%;
          height: 92%;
          overflow: auto;
          margin-top: 10px;
          li {
            float: left;
            padding: 8px;
            margin-right: 4px;
            margin-bottom: 4px;
            background: #8e9397;
            color: #fff;
            border-radius: 2px
          }
        }
      };
      .content-bottom {
        height: 140px;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        background: #f7f7f7;
        position: relative;
        .back-home {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          top: 20px;
          background: #fff;
          color: #2c65f7;
          font-weight: bold;
          text-align: center;
          border: 1px solid #2c65f7
        };
        .quit-account {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          bottom: 20px;
          background: #2c65f7;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      }
    }
  }
</style>
