<template>
   <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      <!-- <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon>  -->
    </HeaderTop>
     <!-- 右边下拉框菜单 -->
    <ul class="left-dropDown" v-show="leftDownShow">
      <li v-for="(item, index) in leftDropdownDataList" :key="index" :class="{liStyle:liIndex == index}" @click="leftLiCLick(index)">{{item}}</li>
    </ul>
    <div class="sweep-code-title">
      <h3>科室信息采集确认</h3>
    </div>
    <div class="bed-number-list-outer">
      <div class="bed-number-list" v-for="(outerItem,index) in allcirculationCollectMessageList" :key="`${outerItem}-${index}`">
        <div class="form-two">
          <van-field v-model="outerItem.bedNumber" disabled label="床号"/>
          <van-field v-model="outerItem.patientName" disabled type="tel" label="姓名"/>
          <van-field v-model="outerItem.sampleAmount" disabled type="number" label="标本总数"/>
        </div>
        <div class="sweep-code-area">
          <div class="circulation-area-title">
            <span>标本名称</span>
            <span>数量</span>
          </div>
          <div class="circulation-area">
            <p v-for="(innerItem,innerIndex) in outerItem.sampleMessageList" :key="`${innerItem}-${innerIndex}`">
              <span>{{innerItem.text}}</span>
              <span>
                <van-stepper v-model="innerItem.sampleNumber" min="0" disabled />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="electronic-signature" v-if="showSignature">
      <ElectronicSignature></ElectronicSignature>
    </div>
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="collectMessageSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="collectMessageCancel">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import ElectronicSignature from '@/components/ElectronicSignature'
import FooterBottom from '@/components/FooterBottom'
 import {collectSampleInfo, updateCirculationTask} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, querySampleName, deepClone } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'circulationTaskCollectMessageSure',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      showSignatureBox: false,
      isClickCancelBtn: false,
      liIndex: null,
      isDialogShow: false,
      showSignature: false,
      allcirculationCollectMessageList: [],
      bedNumber: '',
      patientName: '',
      sampleAmount: '',
      sampleMessageList: [
        {
          sampleType: '',
          innerSampleAmount: '',
          sampleTypeList: [],
          entryList: [],
          checkEntryList: []
        }
      ],
      temporaryCollectInfo: [],
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png')
    };
  },

  components:{
    VanFieldSelectPicker,
    HeaderTop,
    NoData,
    FooterBottom,
    ElectronicSignature
  },

  mounted () {
    console.log('id',this.circulationTaskId);
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      pushHistory();
      this.gotoURL(() => {
        pushHistory();
        if (!this.isDialogShow) {
          this.loseDataInfo();
          return
        };
      })
    };
    this.echoCollectMessage()
  },

  computed:{
    ...mapGetters([
      'navTopTitle',
      'currentElectronicSignature',
      'circulationCollectMessageList',
      'circulationTaskMessage',
      'completeDeparnmentInfo',
      'verifyCirculationOfficeId',
      'circulationDetails'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    circulationTaskId () {
      return this.circulationDetails.id
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeCirculationCollectMessageList',
      'changeCompleteDeparnmentInfo',
      'changeCurrentElectronicSignature'
    ]),

    // 我的页面
    skipMyInfo () {
    },
    
    // 丢失数据提示
    loseDataInfo () {
      this.isDialogShow = false;
      this.showSignatureBox = true;
      this.$dialog.alert({
        message: '返回上级后,将丢失本页及本科室的数据',
        closeOnPopstate: false,
        showCancelButton: true   
        }).then(() => {
          this.temporaryCollectInfo = deepClone(this.circulationCollectMessageList.filter((item) => {return item['taskId'] != this.circulationTaskId}));
          // 清空本次签名信息
          this.changeCurrentElectronicSignature({DtMsg: null});
          this.changeCirculationCollectMessageList({DtMsg: this.temporaryCollectInfo});
          setStore('currentCirculationCollectMessage',{innerMessage: this.temporaryCollectInfo});
          this.$router.push({path:'/circulationTaskCollectMessage'});
          this.changeTitleTxt({tit:'循环信息采集'});
          setStore('currentTitle','循环信息采集');
          this.isDialogShow = true;
          this.showSignatureBox = true;
        })
        .catch(() => {
          this.isDialogShow = false;
          this.showSignatureBox = true
        })
    },


    // 更新循环任务状态
    updateCirculationtaskState (data) {
      updateCirculationTask(data).then((res) => {
        if (res && res.data.code == 200) {

        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
        });
      })
    },


    // 回显已经采集信息
    echoCollectMessage () {
      this.allcirculationCollectMessageList = [];
      let temporaryIndex = this.circulationCollectMessageList.indexOf(this.circulationCollectMessageList.filter((item) => {return item.taskId == this.circulationTaskId})[0]);
      this.allcirculationCollectMessageList = deepClone(this.circulationCollectMessageList[temporaryIndex]['collectDepartmentList']);
      console.log('wq',this.allcirculationCollectMessageList);
    },

     // 收集标本信息
    getSampleMessage (data) {
      collectSampleInfo(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: true
          }).then(() => {
          });
          // 清空当前页面回显数据
          this.allcirculationCollectMessageList = [];
          this.temporaryCollectInfo = deepClone(this.circulationCollectMessageList.filter((item) => {return item['taskId'] != this.circulationTaskId}));
          // 清空本次签名信息
          this.changeCurrentElectronicSignature({DtMsg: null});
          // 清空上一页面store科室采集数据
          this.changeCirculationCollectMessageList({DtMsg: this.temporaryCollectInfo});
          // 清空上一页面Localstorage的科室采集数据
          setStore('currentCirculationCollectMessage',{innerMessage: this.temporaryCollectInfo});
          // 存储完成采集任务的科室信息
          let temporaryDepartmentId = [];
          let temporaryCompleteInfo = [];
          temporaryCompleteInfo = deepClone(this.completeDeparnmentInfo);
          let temporaryIndex = this.completeDeparnmentInfo.indexOf(this.completeDeparnmentInfo.filter((item) => { return item.taskId == this.circulationTaskId})[0]);
          if (this.completeDeparnmentInfo.length > 0) {
            if (temporaryIndex != -1) {
              temporaryDepartmentId = temporaryCompleteInfo[temporaryIndex]['departmentIdList'];
              temporaryDepartmentId.push(this.verifyCirculationOfficeId);
              temporaryCompleteInfo[temporaryIndex]['departmentIdList'] = temporaryDepartmentId
            } else {
              temporaryDepartmentId.push(this.verifyCirculationOfficeId);
              temporaryCompleteInfo.push(
                { 
                  departmentIdList: temporaryDepartmentId,
                  taskId: this.circulationTaskId
                }
              )
            }
          } else {
            temporaryDepartmentId.push(this.verifyCirculationOfficeId);
            temporaryCompleteInfo.push(
              { 
                departmentIdList: temporaryDepartmentId,
                taskId: this.circulationTaskId
              }
            )
          };
          this.changeCompleteDeparnmentInfo({DtMsg: temporaryCompleteInfo});
          setStore('completeDepartmentMessage',{"sureInfo": temporaryCompleteInfo});
          this.$router.push({'path':'/circulationDetails'});
          this.changeTitleTxt({tit:'任务详情'});
          setStore('currentTitle','任务详情');
        } else {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: false
          }).then(() => {
          });
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
        });
      })
    },

    // 返回上一页
    backTo () {
      this.loseDataInfo()
    },

    // 采集信息确认事件
    collectMessageSure () {
      // if (!this.showSignature) {
      //   this.showSignature = true;
      //   return
      // };
      // if (!this.currentElectronicSignature) {
      //   this.$dialog.alert({
      //     message: '签名不能为空，请确认签名!',
      //     closeOnPopstate: false
      //   }).then(() => {
      //   });
      //   return;
      // };
      let submitCollectMsg = {
        proId: this.proId,   //项目ID
        taskId: this.circulationTaskId,   //任务ID
        departmentId: this.verifyCirculationOfficeId,  //科室ID
        singImg: '', //签名照片this.currentElectronicSignature
        specList: []
      };
      let currentTemporaryIndex = this.circulationCollectMessageList.indexOf(this.circulationCollectMessageList.filter((item) => {return item.taskId == this.circulationTaskId})[0]);
      let temporaryCollectInfoList = deepClone(this.circulationCollectMessageList[currentTemporaryIndex]['collectDepartmentList']);
      if (temporaryCollectInfoList.length > 0) {
        for (let i = 0, len = temporaryCollectInfoList.length; i < len; i++) {
          submitCollectMsg['specList'].push(
            {
              patientName: temporaryCollectInfoList[i].patientName,  //病人姓名
              bedNumber: temporaryCollectInfoList[i].bedNumber,  //病人床号
              totalNum: temporaryCollectInfoList[i].sampleAmount, //总数量
              specimen: [] //标本list
            }
          );
          if (temporaryCollectInfoList[i].sampleMessageList.length > 0) {
            for (let j = 0, len = temporaryCollectInfoList[i].sampleMessageList.length; j < len; j++) {
              submitCollectMsg['specList'][i]['specimen'].push(
                {
                  specimenId: temporaryCollectInfoList[i].sampleMessageList[j].value,    //标本ID
                  specimenName: temporaryCollectInfoList[i].sampleMessageList[j].text, //标本名称
                  quantity: temporaryCollectInfoList[i].sampleMessageList[j].sampleNumber,  //标本数量
                  checkItems: {} //检查项
                }
              )
            }
          }
        };
        console.log('最终标本信息',submitCollectMsg);
      }
      this.getSampleMessage(submitCollectMsg)
    },

    // 采集信息确认取消事件
    collectMessageCancel () {
      this.$dialog.alert({
        message: '取消确认后,将丢失本页及本科室的采集数据',
        closeOnPopstate: false,
        showCancelButton: true   
        })
        .then(() => {
          // 当前页面回显数据
          this.allcirculationCollectMessageList = [];
          this.temporaryCollectInfo = deepClone(this.circulationCollectMessageList.filter((item) => {return item['taskId'] != this.circulationTaskId}));
          this.changeCurrentElectronicSignature({DtMsg: null});
          // 上一页面store采集数据
          this.changeCirculationCollectMessageList({DtMsg: this.temporaryCollectInfo});
          // 上一页面Localstorage采集数据
          setStore('currentCirculationCollectMessage',{innerMessage: this.temporaryCollectInfo});
          this.$router.push({path:'/circulationTaskCollectMessage'});
          this.changeTitleTxt({tit:'信息采集'});
          setStore('currentTitle','信息采集')})
      .catch(() => {})
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
    font-size: 14px;
      .left-dropDown {
      .rightDropDown
    }
    .sweep-code-title {
      height: 30px;
      padding-left: 10px;
      position: relative;
      h3 {
        width: auto;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #1699e8;
        position: absolute;
        top: 0;
        left: 8px      
        };
      .control-signature {
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        color: #1699e8;
        display: inline-block;
        position: absolute;
        top: 0;
        right: 8px
      }
    };
    .bed-number-list-outer {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      margin: 10px 0;
      .bed-number-list {
        border-bottom: 2px solid #f2f2f2;
        .form-two {
          padding: 2px;
          box-sizing: border-box;
        };
        .sweep-code-area {
          flex:1;
          overflow: auto;
          margin: 0 auto;
          margin: 10px 0 0 0;
          width: 100%;
          .circulation-area {
            max-height: 90%;
            width: 96%;
            margin: 0 auto;
            overflow: auto;
            font-size: 16px;
            > p {
              position: relative;
              height: 30px;
              border:1px solid #d6d6d6;
              margin-bottom:4px;
              &:last-child {
                margin-bottom:0
              }
              span {
                height: 30px;
                line-height: 30px;
                position: absolute;
                display: inline-block;
                text-align: center;
                width: 50%;
                &:first-child {
                  top: 0;
                  left:0;
                  background: #f7f7f7;
                  text-align: left;
                  padding-left: 12px
                }
                &:last-child {
                  top: 0;
                  right:0;
                  text-align: right
                }
              }
            }
          };
          .circulation-area-title {
            height: 40px;
            line-height: 40px;
            font-size: 18px;
            position: relative;
            span {
              display: inline-block;
              width: 50%;
              position: absolute;
              text-align: center;
              &:first-child {
                top: 0;
                left:0;
                text-align: left;
                padding-left: 16px
              }
              &:last-child {
                top: 0;
                right:0;
                text-align: right;
                padding-right: 20px
              }
            }
          }
        };
      }
    }
    .electronic-signature {
      height: 250px
    }
    .btn-area {
      height: 80px;
      text-align: center;
      line-height: 80px;
      span {
        .bottomButton;
        display: inline-block;
        margin-top: 15px;
        img {
          width: 100%;
          height: 100%
        }
      }
    }
  }
</style>