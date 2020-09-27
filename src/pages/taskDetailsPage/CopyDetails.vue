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
           {{oneEnergyMsg.taskNumber}}
          </span>
        </p>
        <p class="content-top-other">
          <span>巡检名称</span>
          <span>
             {{oneEnergyMsg.taskName}}
          </span>
        </p>
        <p class="content-top-other">
          <span>当前次数</span>
          <span>
            {{oneEnergyMsg.currentTimes}}
          </span>
        </p>
        <p class="content-top-other">
          <span>时间</span>
          <span>
            {{oneEnergyMsg.startTime}}
          </span>
        </p>
      </div>
      <div class="content-middle">
        <p>巡检科室</p>
        <ul v-show="oneEnergyMsg.spaces ? oneEnergyMsg.spaces.length > 0 : false">
          <li v-for="(item,index) in oneEnergyMsg.spaces" :key="`${item}-${index}`" :class="{listStyle: item.checked}">{{item.depName}}</li>
        </ul>
      </div>
      <div class="content-bottom">
        <p class="back-home"  v-show="deviceServiceMsg.state != 4" @click="fillConsumable">扫一扫</p>
        <p class="quit-account" v-show="deviceServiceMsg.state != 4" @click="completeTask">完成抄录</p>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, deepClone } from '@/common/js/utils'
  import {queryOneEnergyTask,verifyEnergyTaskDepartment,completeEnergyRecodeTask} from '@/api/worker.js'
  export default {
    name: 'CopyDetails',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        oneEnergyMsg: '',
        departmentId: '',
        departmentNo: ''
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          if (this.deviceServiceMsg.state == 4) {
            this.changeIsFreshDeviceServicePage(false)
          } else {
            this.changeIsFreshDeviceServicePage(true)
          };
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
      this.getqueryOneEnergyTask()
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'deviceServiceMsg',
        'userInfo',
        'isCurrentDeviceCopyServiceVerifySweepCode',
        'completeDeviceEnergyRecordServiceOfficeInfo',
        'energyRecordList'
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
        return this.deviceServiceMsg.taskId
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeIsFreshDeviceServicePage',
        'changeIsCurrentDeviceCopyServiceVerifySweepCode',
        'changeCurrentDeviceCopyVerifySweepCodeDepNumber',
        'changeEnergyRecordList',
        'changeCompleteDeviceEnergyRecordServiceOfficeInfo'
      ]),

      // 查询单条科室巡检任务信息
      getqueryOneEnergyTask () {
        queryOneEnergyTask(this.taskId).then((res) => {
          if(res && res.data.code == 200) {
            let temporaryOneRepairsMsg = res.data.data;
            temporaryOneRepairsMsg.spaces = JSON.parse(res.data.data.spaces);
            for (let item of temporaryOneRepairsMsg.spaces) {
              item.checked = false
            };
            this.oneEnergyMsg = temporaryOneRepairsMsg;
            // // 为完成巡检的科室增加标记
            if (this.completeDeviceEnergyRecordServiceOfficeInfo.length > 0) {
              for (let w = 0, wLen = this.completeDeviceEnergyRecordServiceOfficeInfo.length; w < wLen; w++) {
                if (this.oneEnergyMsg['id'] == this.completeDeviceEnergyRecordServiceOfficeInfo[w]['taskId']) {
                  if (this.completeDeviceEnergyRecordServiceOfficeInfo[w]['officeList'].length > 0) {
                    for (let i = 0, len1 = this.completeDeviceEnergyRecordServiceOfficeInfo[w]['officeList'].length; i < len1; i++) {
                      if (this.oneEnergyMsg['spaces'].length > 0) {
                        for (let j = 0, len2 = this.oneEnergyMsg['spaces'].length; j < len2; j++) {
                          if (this.oneEnergyMsg['spaces'][j]['depNo'] == this.completeDeviceEnergyRecordServiceOfficeInfo[w]['officeList'][i]) {
                            this.oneEnergyMsg['spaces'][j]['checked'] = true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
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

       // 校验当前科室二维码
      juddgeCurrentDepartment(data) {
        verifyEnergyTaskDepartment(data).then((res) => {
          if (res && res.data.code == 200) {
            // 存储当前扫码校验通过的科室id
            this.storeCurrentDepartmentNumber(data.depId);
            // 存储当前扫码校验通过的科室编号
            this.changeCurrentDeviceCopyVerifySweepCodeDepNumber(data.depNo);
            setStore('energyDepartmentService',data.depNo);
            this.$router.push({path: 'copyRecordBill'});
            this.changeTitleTxt({tit:'设备参数单'});
            setStore('currentTitle','设备参数单')
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
          try {
            let codeData = code.split('|');
            if (codeData.length > 0) {
              this.departmentId = codeData[0];
              this.departmentNo = codeData[1];
              this.juddgeCurrentDepartment({
                proId: this.proId,
                id: this.taskId,  //任务ID 
                depNo: this.departmentNo, //科室编号
                depId: this.departmentId,  //科室ID 
                workerId: this.workerId // 用户id
              })
            }
          } catch (err) {
            this.$dialog.alert({
              message: `${err}`
            }).then(() => {
              this.fillConsumable()
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

      // 存储当前扫码校验通过的科室id
      storeCurrentDepartmentNumber (departmentNumber) {
        let temporaryDepartmentNumber = [];
        temporaryDepartmentNumber = deepClone(this.isCurrentDeviceCopyServiceVerifySweepCode);
        if (temporaryDepartmentNumber.length > 0 ) {
          let temporaryIndex = this.isCurrentDeviceCopyServiceVerifySweepCode.indexOf(this.isCurrentDeviceCopyServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
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
        this.changeIsCurrentDeviceCopyServiceVerifySweepCode(temporaryDepartmentNumber);
        setStore('isCurrentDeviceCopyServiceVerifySweepCode', {"number": temporaryDepartmentNumber})
      },

      //返回上一页
      backTo () {
        if (this.deviceServiceMsg.state == 4) {
          this.changeIsFreshDeviceServicePage(false)
        } else {
          this.changeIsFreshDeviceServicePage(true)
        };
        this.$router.push({path: 'deviceService'});
        this.changeTitleTxt({tit:'设备巡检'});
        setStore('currentTitle','设备巡检')
      },

      // 扫一扫
      fillConsumable () {
        window.android.scanQRcode()
      },

      // 清除当前任务存储的所有科室设备录入数据
      clearEnergyData () {
        let temporaryInfo = this.energyRecordList.filter((item) => { return item.taskId !== this.taskId});
        this.changeEnergyRecordList(temporaryInfo);
        setStore('energyRecordList', {"energyRecord": temporaryInfo})
      },

      // 清除当前任务存储的完成能耗录入的科室编号
      clearCompleteEnergyRecordDepartmentInfo () {
        let temporaryInfo = this.completeDeviceEnergyRecordServiceOfficeInfo.filter((item) => { return item.taskId !== this.taskId});
        this.changeCompleteDeviceEnergyRecordServiceOfficeInfo(temporaryInfo);
        setStore('isCompleteDeviceEnergyRecordServiceOfficeInfo', {"sweepCodeInfo": temporaryInfo})
      },

      // 清除当前扫码校验通过的科室id
      clearCurrentDepartmentNumber () {
        let temporaryInfo = this.isCurrentDeviceCopyServiceVerifySweepCode.filter((item) => { return item.taskId !== this.taskId});
        this.changeIsCurrentDeviceCopyServiceVerifySweepCode(temporaryInfo);
        setStore('isCurrentDeviceCopyServiceVerifySweepCode', {"number": temporaryInfo})
      },

      // 完成巡检
      completeTask () {
        let flag = this.oneEnergyMsg.spaces.some((item) => { return item.checked == false});
        if (flag) {
          this.$toast('请完成所有房间的巡检');
          return
        };
        completeEnergyRecodeTask(this.proId,this.taskId).then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            this.clearEnergyData();
            this.clearCompleteEnergyRecordDepartmentInfo();
            this.clearCurrentDepartmentNumber();
            this.backTo()
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
              color: @color-theme;
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
              color: @color-theme;
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
          };
          .listStyle {
            background: @color-theme
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
          bottom: 20px;
          background: @color-theme;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      }
    }
  }
</style>
