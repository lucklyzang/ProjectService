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
              <van-field v-model="item.name" type="digit" :error="item.name < 0"/>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, repeArray, deepClone  } from '@/common/js/utils'
  export default {
    name: 'OperateRecordBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        isAllRecordShow: false,
        departmentNum: '',
        consumableMsgList: [
          {
            consumableName: '儿科电表一',
            name: ''
          },
          {
            consumableName: '儿科电表二',
            name: ''
          },
          {
            consumableName: '儿科电表三',
            name: ''
          },
          {
            consumableName: '儿科电表四',
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
          if (this.isAllRecordShow) {
            this.isAllRecordShow = true;
            return
          };
          this.$router.push({path: 'operateRecordOrderDetails'});
          this.changeTitleTxt({tit:'设备巡检详情'});
          setStore('currentTitle','设备巡检详情')
        })
      };
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
        'isCurrentDeviceCopyServiceVerifySweepCode',
        'completeDeviceEnergyRecordServiceOfficeInfo'
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
        this.$router.push({path: 'CopyDetails'});
        this.changeTitleTxt({tit:'抄录详情'});
        setStore('currentTitle','抄录详情')
      },

      // 获取当前扫码通过科室的编号
      getDepartmentNumber () {
        let temporaryIndex = this.isCurrentDeviceCopyServiceVerifySweepCode.indexOf(this.isCurrentDeviceCopyServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
        if (temporaryIndex != -1) {
          this.departmentNum = this.isCurrentDeviceCopyServiceVerifySweepCode[temporaryIndex]['number']
        }
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
            }
          } else {
            // 请求后台数据
          }
        } else {
          // 请求后台数据
        }
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
      isBackCancel () {

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
        this.storeEnergyRecord()
        this.backTo()
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
