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
          当前巡检科室: {{currentDepartmentName}}
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index + 1}}</span>
            <span>
              {{item.itemName}}
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
    <van-dialog v-model="issueShow" title="是否反馈该问题到调度中心" show-cancel-button 
      confirm-button-text="不上报" cancel-button-text="上报问题"
      @confirm="noReportProblem"
      @cancel="reportProblem"
      >
    </van-dialog>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, Dictionary } from '@/common/js/utils'
  import {queryExamineItems,postCheckResult} from '@/api/worker.js'
  export default {
    name: 'DepartmentServiceBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        issueShow: false,
        currentDepartmentId: '',
        currentDepartmentName: '',
        consumableMsgList: []
      }
    },
    
    mounted () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'departmentWorkOrderDeatils'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工程详情')
        })
      };
      this.echoCurrentDepartmentId();
      // 查询检查项
      this.getExamineItems({
        proId: this.proId,
		    depId: '833'
      })
    },

    activated () {
      this.issueShow = false;
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'departmentWorkOrderDeatils'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工程详情')
        })
      };
      this.echoCurrentDepartmentNumber()
    },

    beforeRouteEnter (to, from, next){
      let catch_components = store.state.catchComponent.catch_components;
      let i = catch_components.indexOf('DepartmentServiceBill');
      i === -1 && catch_components.push('DepartmentServiceBill');
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'departmentServiceIssueReport'){
        let i = catch_components.indexOf('DepartmentServiceBill');
        i > -1 && this.changeCatchComponent([]);
      }
      next()
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'catch_components',
        'departmentServiceMsg',
        'userInfo',
        'isCurrentDepartmentServiceVerifySweepCode'
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
        'changeTitleTxt',
        'changeCatchComponent'
      ]),

      //返回上一页
      backTo () {
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工程详情')
      },

      // 回显当前检修科室名称
      echoCurrentDepartmentId () {
        // if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
        // let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
        // if (echoIndex == -1) { return };
        // this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
        // 获取科室名称
        this.currentDepartmentName = Dictionary(JSON.parse(getStore('departmentMessage')),'204')
      },
      
      // 查询检查项
      getExamineItems (data) {
        queryExamineItems(data).then((res) => {
          if (res && res.data.code == 200) {
            this.consumableMsgList = [];
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                this.consumableMsgList.push({
                  depId: item.depId,  //科室ID
                  depName: item.depName,   //科室名称
                  typeName: item.typeName,  //检测类型
                  itemName: item.itemName,  //检测项
                  itemId: item.itemId,    //检测项ID
                  right: false,
                  error: false
                })
              }
            } else {
              this.$dialog.alert({
                message: '没有查询到检查项',
                  closeOnPopstate: true
                }).then(() => {
              })
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
                closeOnPopstate: true
              }).then(() => {
            })
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
              closeOnPopstate: true
            }).then(() => {
          })
        })
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
          };
          this.issueShow = true
        };
        console.log(this.consumableMsgList);
      },

      // 上报问题
      reportProblem () {
        this.$router.push({path: 'departmentServiceIssueReport'});
        this.changeTitleTxt({tit:'巡检问题上报'});
        setStore('currentTitle','巡检问题上报')
      },

      // 不上报问题弹
      noReportProblem () {},

      // 确认
      sure () {
        let temporaryCheckItems = [];
        for (let item of this.consumableMsgList) {
          temporaryCheckItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            checkResult: ''
          })
        };
        let data = {
          depId: this.currentDepartmentId,
          checkItems: temporaryCheckItems
        };
        postCheckResult(data).then((res) => {
          if (res && res.data.code == 200) {
            this.$toast('上报成功');
            this.$router.push({path: 'departmentWorkOrderDeatils'});
            this.changeTitleTxt({tit:'工单详情'});
            setStore('currentTitle','工程详情')
          } else {
            this.$toast(`${res.data.msg}`);
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
            }).then(() => {
          })
        })
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
    /deep/ .van-dialog {
      .van-button--default {
        background-color: #2c65f7;
        color: #fff;
        border: none
      }
    };
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
                margin-top: 11px;
                color: #616060
              };
              .styleRight {
                color: #7fdc90
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
