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
          当前抄表科室: {{currentDepartmentName}}
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index + 1}}</span>
            <span>
              {{item.consumableName}}
            </span>
            <span>
              <van-field v-model="item.name"  placeholder="请输入数据" type="digit" :error="item.name < 0"/>
            </span>
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="quit-account" @click="sure">确认</p>
      </div>
      <van-dialog v-model="isAllRecordShow" title="提示" show-cancel-button confirm-button-text="返回"
        message="还有数据没有录入完毕,是否返回?" 
        cancel-button-text="不返回" @confirm="isBackSure" @cancel="isBackCancel"
      >
      </van-dialog>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, repeArray, deepClone, Dictionary } from '@/common/js/utils'
  import {getDeviceMessage, submitMeterReadingData} from '@/api/worker.js'
  export default {
    name: 'CopyRecordBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        isAllRecordShow: false,
        departmentNum: '',
        currentDepartmentId: '',
        currentDepartmentName: '',
        consumableMsgList: []
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          if (this.isAllRecordShow) {
            this.isAllRecordShow = true;
            return
          };
          this.backTo()
        })
      };
      this.echoCurrentDepartmentId();
      this.getDepartmentNumber();
      this.isRequestEnergyList()
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'energyRecordList',
        'deviceServiceMsg',
        'userInfo',
        'isCurrentDeviceCopyServiceVerifySweepCode',
        'completeDeviceEnergyRecordServiceOfficeInfo',
        'currentDeviceCopyVerifySweepCodeDepNumber'
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
        'changeEnergyRecordList',
        'changeCompleteDeviceEnergyRecordServiceOfficeInfo'
      ]),

      //返回上一页
      backTo () {
        this.storeEnergyRecord();
        this.$router.push({path: 'CopyDetails'});
        this.changeTitleTxt({tit:'抄录详情'});
        setStore('currentTitle','抄录详情')
      },

      // 回显当前检修科室名称
      echoCurrentDepartmentId () {
        try {
          if (this.isCurrentDeviceCopyServiceVerifySweepCode.length == 0) { return };
          let echoIndex = this.isCurrentDeviceCopyServiceVerifySweepCode.indexOf(this.isCurrentDeviceCopyServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
          if (echoIndex == -1) { return };
          this.currentDepartmentId = this.isCurrentDeviceCopyServiceVerifySweepCode[echoIndex]['number'];
          // 获取科室名称
          this.currentDepartmentName = Dictionary(JSON.parse(getStore('departmentMessage')),this.currentDepartmentId)
        } catch (err) {
          this.$toast(`${err}`)
        }
      },

      // 获取当前扫码通过科室的编号
      getDepartmentNumber () {
        this.departmentNum = this.currentDeviceCopyVerifySweepCodeDepNumber
      },

      // 是否请求能耗记录列表
      isRequestEnergyList () {
        if (this.energyRecordList.length > 0) {
          let temporaryIndex = this.energyRecordList.indexOf(this.energyRecordList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            let temporaryDepartmentIdList = this.energyRecordList[temporaryIndex]['officeList'];
            let temporaryOneRecordIndex = temporaryDepartmentIdList.indexOf(temporaryDepartmentIdList.filter((item) => {return item.officeId == this.departmentNum})[0]);
            if (temporaryOneRecordIndex != -1) {
              // 从缓存数据里读取该任务下的科室记录的设备数据
              this.consumableMsgList = temporaryDepartmentIdList[temporaryOneRecordIndex]['oneRecordList']
            } else {
              // 请求后台数据
              this.queryDeviceMessage()
            }
          } else {
            // 请求后台数据
            this.queryDeviceMessage()
          }
        } else {
          // 请求后台数据
          this.queryDeviceMessage()
        }
      },

      // 获取当前科室要抄录设备的信息
      queryDeviceMessage () {
        this.consumableMsgList = []
        getDeviceMessage({
          proId: this.proId, 
          taskId: this.taskId,
          depId: this.currentDepartmentId,
          depNo: this.departmentNum,
          deviceTypeId: this.deviceServiceMsg.deviceId,
        }).then((res) => {
          if (res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                this.consumableMsgList.push(
                  {
                    consumableName: item.deviceName,
                    deviceNumber: item.deviceNumber,
                    additional: item.additional,
                    name: ''
                  }
                )
              }
            } else {
              this.$toast('没有查询到要抄录的设备');
            }
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
      },

      // 存储科室记录过的能耗数据
      storeEnergyRecord () {
        let temporaryRecordList = [];
        let temporaryDepartmentIdList = [];
        temporaryRecordList = deepClone(this.energyRecordList);
        // 判断是否是存入的第一条任务数据
        if (this.energyRecordList.length > 0 ) {
          let temporaryIndex = this.energyRecordList.indexOf(this.energyRecordList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            // 判断当前任务有没有存入过数据
            temporaryDepartmentIdList = temporaryRecordList[temporaryIndex]['officeList'];
            let temporaryOneRecordIndex = temporaryDepartmentIdList.indexOf(temporaryDepartmentIdList.filter((item) => {return item.officeId == this.departmentNum})[0]);
            if (temporaryOneRecordIndex != -1) {
              // 判断当前科室有没有存入过数据
              temporaryDepartmentIdList[temporaryOneRecordIndex]['oneRecordList'] = this.consumableMsgList
            } else {
              temporaryDepartmentIdList.push({
                officeId: this.departmentNum,
                oneRecordList: this.consumableMsgList
              })
            }; 
            temporaryRecordList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentIdList)
          } else {
            temporaryDepartmentIdList.push({
              officeId: this.departmentNum,
              oneRecordList: this.consumableMsgList
            });
            temporaryRecordList.push(
              { 
                officeList: repeArray(temporaryDepartmentIdList),
                taskId: this.taskId
              }
            )
          }
        } else {
          temporaryDepartmentIdList.push({
            officeId: this.departmentNum,
            oneRecordList: this.consumableMsgList
          });
          temporaryRecordList.push(
            { 
              officeList: repeArray(temporaryDepartmentIdList),
              taskId: this.taskId
            }
          )
        };
        this.changeEnergyRecordList(temporaryRecordList);
        setStore('energyRecordList', {"energyRecord": temporaryRecordList})
      },

      // 存储完成能耗录入的科室编号
      storeCompleteDepartmentNumber () {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.completeDeviceEnergyRecordServiceOfficeInfo);
        if (this.completeDeviceEnergyRecordServiceOfficeInfo.length > 0 ) {
          let temporaryIndex = this.completeDeviceEnergyRecordServiceOfficeInfo.indexOf(this.completeDeviceEnergyRecordServiceOfficeInfo.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            temporaryDepartmentId.push(this.departmentNum);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
          } else {
            temporaryDepartmentId.push(this.departmentNum);
            temporaryOfficeList.push(
              { 
                officeList: repeArray(temporaryDepartmentId),
                taskId: this.taskId
              }
            )
          }
        } else {
          temporaryDepartmentId.push(this.departmentNum);
          temporaryOfficeList.push(
            { 
              officeList: repeArray(temporaryDepartmentId),
              taskId: this.taskId
            }
          )
        };
        this.changeCompleteDeviceEnergyRecordServiceOfficeInfo(temporaryOfficeList);
        setStore('isCompleteDeviceEnergyRecordServiceOfficeInfo', {"sweepCodeInfo": temporaryOfficeList})
      },

      // 是否返回弹窗确定返回事件
      isBackSure () {
        this.backTo()
      },

      // 是否返回弹窗取消返回事件
      isBackCancel () {},

      // 提交录入数据
      submitEnteringData () {
        let data = {
          proId: this.proId, 
          taskId: this.taskId,
          depId: this.currentDepartmentId,
          depNo: this.departmentNum,
          deviceId: this.deviceServiceMsg.deviceId,
          checkItems: []
        };
        for (let item of this.consumableMsgList) {
          data['checkItems'].push({
            deviceNumber: item.deviceNumber,  //设备编号
			      checkResult: item.name     //抄表数据
          })
        };
        submitMeterReadingData(data).then((res) => {
          if (res.data.code == 200) {
            this.$toast('提交成功');
            this.storeEnergyRecord();
            this.storeCompleteDepartmentNumber();
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
      },

      // 确认
      sure () {
        // 判断是否至少录入一项数据
        let isOneRecord = this.consumableMsgList.every((item) => {return item.name === '' });
        if (isOneRecord) {
           this.$dialog.alert({
            title: '提示',
            message: '请录入数据',
          }).then(() => {
          });
          return
        };
        // 判断录入数据是否合法
        let isLegal = this.consumableMsgList.some((item) => {return item.name < 0 });
        if (isLegal) {
          this.$dialog.alert({
            title: '提示',
            message: '数据录入不合法',
          }).then(() => {
          });
          return
        };
        // 判断是否全部录入完毕
        let isAllRecord = this.consumableMsgList.some((item) => {return item.name === '' });
        if (isAllRecord) {
          this.isAllRecordShow = true;
          return
        };
        this.submitEnteringData()
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
        display: flex;
        flex-direction: column;
        overflow: auto;
        .circulation-area {
            width:100%;
            flex:1;
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
                padding: 7px 0 7px 0;
                box-sizing: border-box;
                top:0;
                right: 0;
                font-size: 28px;
                /deep/ .van-cell{
                  color: #ababab;
                  border: 1px solid #b2b1b1;
                  padding: 0;
                  padding-left: 4px;
                  height: 36px;
                  line-height: 36px;
                  box-sizing: border-box;
                  width: 90%
                };
              }
            }
          }
        };
        .circulation-area-title {
          height: 40px;
          line-height: 40px;
          position: relative;
          padding-left: 4px;
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
