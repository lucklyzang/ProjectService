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
            {{oneRepairsMsg.taskNumber}}
          </span>
        </p>
        <p class="content-top-other">
          <span>巡检名称</span>
          <span>
            {{oneRepairsMsg.taskName}}
          </span>
        </p>
        <p class="content-top-other">
          <span>当前次数</span>
          <span>
            {{oneRepairsMsg.currentTimes}}
          </span>
        </p>
        <p class="content-top-other">
          <span>时间</span>
          <span>
            {{oneRepairsMsg.startTime}}
          </span>
        </p>
      </div>
      <div class="content-middle">
        <p>巡检地点</p>
        <ul v-show="oneRepairsMsg.spaces ? oneRepairsMsg.spaces.length > 0 : false">
          <li v-for="(item,index) in oneRepairsMsg.spaces" :key="`${item}-${index}`">{{item.depName}}</li>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, repeArray } from '@/common/js/utils'
  import {queryOneDepartmentService, verifyDepartment, updateDepartmentServiceTaskBeSigned} from '@/api/worker.js'
  export default {
    name: 'DepartmentWorkOrderDeatils',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        oneRepairsMsg: '',
        departmentId: '',
        departmentNo: ''
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
        if (this.departmentServiceMsg.state == 4) {
          this.changeIsFreshDepartmentServicePage(false)
        } else {
          this.changeIsFreshDepartmentServicePage(true)
        };
        this.$router.push({path: 'departmentService'});
        this.changeTitleTxt({tit:'科室巡检'});
        setStore('currentTitle','科室巡检')
        })
      };
      // 二维码回调方法绑定到window下面,提供给外部调用
      let me = this;
      window['scanQRcodeCallback'] = (code) => {
        me.scanQRcodeCallback(code);
      };
      this.getOneDepartmentService()
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
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
      },
      taskId () {
        return this.departmentServiceMsg.id
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeIsFreshDepartmentServicePage',
        'changeIsDepartmentServiceVerifySweepCode',
        'changeIsCurrentDepartmentServiceVerifySweepCode'
      ]),

      //返回上一页
      backTo () {
        if (this.departmentServiceMsg.state == 4) {
          this.changeIsFreshDepartmentServicePage(false)
        } else {
          this.changeIsFreshDepartmentServicePage(true)
        };
        this.$router.push({path: 'departmentService'});
        this.changeTitleTxt({tit:'科室巡检'});
        setStore('currentTitle','科室巡检')
      },

      // 查询单条科室巡检任务信息
      getOneDepartmentService () {
        queryOneDepartmentService(this.taskId).then((res) => {
          if(res && res.data.code == 200) {
            let temporaryOneRepairsMsg = res.data.data;
            temporaryOneRepairsMsg.spaces = JSON.parse(res.data.data.spaces);
            for (let item of temporaryOneRepairsMsg.spaces) {
              item.checked = false
            };
            this.oneRepairsMsg = temporaryOneRepairsMsg
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

      // 扫一扫
      fillConsumable () {
           this.$router.push({path: 'departmentServiceBill'});
            this.changeTitleTxt({tit:'科室巡检单'});
            setStore('currentTitle','科室巡检单')
        // window.android.scanQRcode()
      },

      // 校验当前科室二维码
      juddgeCurrentDepartment(data) {
        verifyDepartment(data).then((res) => {
          if (res && res.data.code == 200) {
            // 存储扫码校验通过的科室编号
            this.storeDepartmentNumber(data.depNo);
            // 存储当前扫码校验通过的科室id
            this.storeCurrentDepartmentNumber(data.depId);
            this.$router.push({path: 'departmentServiceBill'});
            this.changeTitleTxt({tit:'科室巡检单'});
            setStore('currentTitle','科室巡检单')
          } else {
            this.$toast(`${res.data.msg}`)
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

      // 摄像头扫码后的回调
      scanQRcodeCallback(code) {
        if (code) {
          let codeData = code.split('|');
          if (codeData.length > 0) {
            this.departmentId = codeData[0];
            this.departmentNo = codeData[1];
            this.juddgeCurrentDepartment({
              id: this.taskId,  //任务ID
              depNo: this.departmentNo, //项目编号
              depId: this.departmentId,  //科室ID
              workerId: this.workerId // 用户id
            })
          }
        } else {
          this.$dialog.alert({
            message: '当前没有扫描到任何信息,请重新扫描'
          }).then(() => {
            this.fillConsumable()
          });
        }
      },

      // 存储扫码校验通过的科室编号
      storeDepartmentNumber (departmentNumber) {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.isDepartmentServiceVerifySweepCode);
        if (this.isDepartmentServiceVerifySweepCode.length > 0 ) {
          let temporaryIndex = this.isDepartmentServiceVerifySweepCode.indexOf(this.isDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            temporaryDepartmentId.push(departmentNumber);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
          } else {
            temporaryDepartmentId.push(departmentNumber);
            temporaryOfficeList.push(
              { 
                officeList: repeArray(temporaryDepartmentId),
                taskId: this.taskId
              }
            )
          }
        } else {
          temporaryDepartmentId.push(departmentNumber);
          temporaryOfficeList.push(
            { 
              officeList: repeArray(temporaryDepartmentId),
              taskId: this.taskId
            }
          )
        };
        this.changeIsDepartmentServiceVerifySweepCode(temporaryOfficeList);
        setStore('isDepartmentServiceVerifySweepCode', {"sweepCodeInfo": temporaryOfficeList})
      },

      // 存储当前扫码校验通过的科室编号
      storeCurrentDepartmentNumber (departmentNumber) {
        let temporaryDepartmentNumber = [];
        temporaryDepartmentNumber = deepClone(this.isCurrentDepartmentServiceVerifySweepCode);
        if (temporaryDepartmentNumber.length > 0 ) {
          let temporaryIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentNumber[temporaryIndex]['number'] = departmentNumber
          } else {
            temporaryDepartmentNumber.push(
              { 
                number: departmentNumber,
                taskId: this.taskId
              }
            )
          };
        } else {
          temporaryDepartmentNumber.push(
            { 
              number:departmentNumber,
              taskId: this.taskId
            }
          )
        };
        this.changeCurrentDepartmentNumber(temporaryDepartmentNumber);
        setStore('changeIsCurrentDepartmentServiceVerifySweepCode', {"number": temporaryDepartmentNumber});
      },

      // 完成巡检
      completeTask () {
        updateDepartmentServiceTaskBeSigned(this.proId, this.taskId).then((res) => {
          if (res && res.data.code == 200) {
            this.$router.push({path: 'departmentService'});
            this.changeTitleTxt({tit:'科室巡检'});
            setStore('currentTitle','科室巡检')
          } else {
            this.$toast(`${res.data.msg}`)
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`
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
        font-size: 14px;
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
