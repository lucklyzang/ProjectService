<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <div class="circulation-area-title">
          当前巡检设备: 科室一
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index + 1}}</span>
            <span>
              {{item.consumableName}}
            </span>
            <span>
              <van-icon name="checked" :class="{styleRight: item.right}" @click="rightClick(item,index,'right')" />
              <van-icon name="clear" :class="{styleError: item.error}" @click="rightClick(item,index,'error')" />
            </span>
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="quit-account" @click="sure">确认</p>
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
    name: 'DeviceServiceBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        consumableMsgList: [
          {
            consumableName: '窗户是否完好窗户是否完好窗户是否完好窗户是否完好',
            right: false,
            error: false
          },
          {
            consumableName: '消防设备是否完好',
            right: false,
            error: false
          },
          {
            consumableName: '检查项',
            right: false,
            error: false
          },
          {
            consumableName: '检查项',
            right: false,
            error: false
          }
        ]
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'deviceServiceDetails'});
          this.changeTitleTxt({tit:'设备巡检详情'});
          setStore('currentTitle','设备巡检详情')
        })
      }
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

      //返回上一页
      backTo () {
        this.$router.push({path: 'deviceServiceDetails'});
        this.changeTitleTxt({tit:'设备巡检详情'});
        setStore('currentTitle','设备巡检详情')
      },

      //对号图标点击
      rightClick(item,index,type) {
        if (type == 'right') {
          this.consumableMsgList[index].right = !this.consumableMsgList[index].right;
          if (this.consumableMsgList[index].error == true) {
            this.consumableMsgList[index].error = false
          }
        } else {
          this.consumableMsgList[index].error = !this.consumableMsgList[index].error;
          if (this.consumableMsgList[index].right == true) {
            this.consumableMsgList[index].right = false
          }
        }
        console.log(this.consumableMsgList);
      },

      // 确认
      sure () {
        this.$router.push({path: 'deviceServiceDetails'});
        this.changeTitleTxt({tit:'设备巡检详情'});
        setStore('currentTitle','设备巡检详情')
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
        height: auto;
        font-size: 14px;
        background: #f7f7f7;
        flex: 1;
        overflow: auto;
        .circulation-area {
          max-height: 90%;
          margin: 0 auto;
          overflow: auto;
          font-size: 0;
        > p {
          position: relative;
          height: 50px;
          background: #fff;
          margin-bottom: 6px;
          &:last-child {
            margin-bottom:0
          }
          span {
            height: 50px;
            line-height: 50px;
            width: 30%;
            font-size: 16px;
            display: inline-block;
            text-align: center;
            overflow: auto;
            &:first-child {
              width: 10%
            };
            &:nth-child(2) {
              width: 50%;
              text-align: center;
            };
            &:last-child {
              position: absolute;
              top:0;
              right: 0;
              font-size: 28px;
              /deep/ .van-icon {
                margin-top: 10px;
                color: #ababab
              };
              .styleRight {
                color: green
              };
              .styleError {
                color: red
              }
            }
          }
        }
      };
      .circulation-area-title {
        height: 10%;
        position: relative;
        padding-left: 4px;
        padding-top: 6%;
        box-sizing: border-box;
        font-size: 16px
        }
      };
      .content-bottom {
        height: 100px;
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
          top: 5px;
          background: #fff;
          color: @color-theme;
          font-weight: bold;
          text-align: center;
          border: 1px solid @color-theme
        };
        .quit-account {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          bottom: 5px;
          background: @color-theme;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      };
    }
  }
</style>
