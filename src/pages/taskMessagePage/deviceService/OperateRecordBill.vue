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
          当前抄表设备: 科室一
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index + 1}}</span>
            <span>
              {{item.consumableName}}
            </span>
            <span>
              <van-field v-model="item.name" />
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
    name: 'OperateRecordBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        consumableMsgList: [
          {
            consumableName: '补水压力(Mpa)',
            name: ''
          },
          {
            consumableName: '出水设定温度(C)',
            name: ''
          },
          {
            consumableName: '出水温度(C)',
            name: ''
          },
          {
            consumableName: '保温、管道、阀门',
            name: ''
          }
        ]
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'operateRecordOrderDetails'});
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
        this.$router.push({path: 'OperateRecordOrderDetails'});
        this.changeTitleTxt({tit:'设备巡检详情'});
        setStore('currentTitle','设备巡检详情')
      },


      // 确认
      sure () {
        this.$router.push({path: 'OperateRecordOrderDetails'});
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
              width: 40%;
              position: absolute;
              top:0;
              right: 0;
              font-size: 28px;
              /deep/ .van-cell{
                color: #ababab;
                border: 1px solid #b2b1b1;
                padding: 4px;
                margin-top: 8px;
                width: 90%
              };
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
          bottom: 5px;
          background: #2c65f7;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      };
    }
  }
</style>
