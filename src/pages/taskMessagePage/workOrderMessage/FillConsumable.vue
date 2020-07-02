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
          <span></span>
          <span>耗材名称</span>
          <span>单位</span>
          <span>数量</span>
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index}}</span>
            <span>
              <van-field v-model="item.consumableName" placeholder="请输入耗材名称"/>
            </span>
            <span>
              <van-field v-model="item.consumableUnit" placeholder="单位"/>
            </span>
            <span>
              <van-stepper theme="round" @change="stepperEvent" v-model="item.consumableNumber" min="0"/>
            </span>
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="addConsumable">添加物质</p>
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
    name: 'FillConsumable',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        consumableMsgList: [
          {
            consumableNumber: 0,
            consumableName: '耗材一',
            consumableUnit: '只',
          },
          {
            consumableNumber: 0,
            consumableName: '耗材二',
            consumableUnit: '根',
          },
          {
            consumableNumber: 0,
            consumableName: '耗材三',
            consumableUnit: '根',
          }
        ]
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'workOrderDetails'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工单详情')
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
        this.$router.push({path: 'workOrderDetails'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
      },

      // 计数器变化回调
      stepperEvent (value) {

      },

      // 添加物质
      addConsumable () {
        this.consumableMsgList.push(
           {
            consumableNumber: 0,
            consumableName: '',
            consumableUnit: '',
          }
        )
      },

      // 确认
      sure () {}
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
            width: 40%;
            font-size: 16px;
            display: inline-block;
            text-align: center;
            &:first-child {
              width: 10%
            };
            &:nth-child(2) {
              text-align: center;
              /deep/ .van-cell {
                .van-cell__value--alone {
                  .van-field__control {
                    text-align: center
                  }
                }
              }
            };
            &:nth-child(3) {
              width: 10%;
              /deep/ .van-cell {
                padding: 0
              }
            }
            &:last-child {
              position: absolute;
              top:0;
              right: 0;
              /deep/ .van-stepper--round {
                .van-stepper__minus {
                  color: #fff;
                  background-color: #2c65f7;
                  border: 1px solid #2c65f7;
                };
                .van-stepper__plus {
                  color: #fff;
                  background-color: #2c65f7;
                  border: 1px solid #2c65f7;
                }
              }
            }
          }
        }
      };
      .circulation-area-title {
        height: 10%;
        position: relative;
        font-size: 0;
          span {
            display: inline-block;
            text-align: left;
            width: 40%;
            font-size: 16px;
            line-height: 56px;
            &:first-child {
              width: 10%;
              text-align: center
            };
            &:nth-child(2) {
              text-align: center
            };
            &:nth-child(3) {
              width: 10%
            };
            &:last-child {
              text-align: center
            }
          }
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
