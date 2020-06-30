<template>
  <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon>
    </HeaderTop>
    <div class="basic-message">
      <p class="basic-message-title">基本信息</p>
       <div class="wait-handle-message">
        <div class="handle-message-line-wrapper">
          <P>
            <span class="message-tit">任务名称:</span>
            <span class="message-tit-real message-tit-real-style">{{circulationDetails.taskTypeName}}</span>
          </P>
          <p>
            <span class="message-tit">任务状态:</span>
            <span class="message-tit-real" style="color:red">{{stateTransfer(circulationDetails.state)}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper">
          <p>
            <span class="message-tit">预计开始时间:</span>
            <span class="message-tit-real">{{circulationDetails.startTime}}</span>
          </p>
          <P>
            <span class="message-tit">实际开始时间:</span>
            <span class="message-tit-real message-tit-real-style">{{circulationDetails.startUpTime}}</span>
          </P>
        </div>
      </div>
    </div>
    <div class="office-list">
      <p class="office-list-inner-wrapper">
        <span :class="{officeCheckStyle: drawCompleteTaskIdList.indexOf(circulationDetails.id) != -1 && item.check == true}" v-for="(item,index) in circulationDetails.spaces" :key="`${item}-${index}`">
          {{item.text}}
        </span>
      </p>
    </div>
    <div class="circultion-task-btn">
      <span v-show="circulationDetails.state != 7">
        <img :src="taskSweepCodePng" alt="" @click="joinSweepCode">
      </span>
      <span v-show="circulationDetails.state != 7">
        <img :src="taskArrivedPng" alt="" @click="circulationTaskArrived">
      </span>
      <p class="circultion-task-btn-bottom" v-show="circulationDetails.state == 7">
        <span @click="backTo">返回</span>
      </p>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import FooterBottom from '@/components/FooterBottom'
import {} from '@/api/medicalPort.js'
import {getCirculationTaskMessageById} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, removeBlock } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'circulationDetails',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      circulationTaskList: [],
      drawCompleteTaskIdList: [],
      taskArrivedPng: require('@/components/images/task-arrived.png'),
      taskSweepCodePng: require('@/components/images/task-sweep-code.png')
    }
  },

  components: {
    HeaderTop,
    NoData,
    FooterBottom
  },

  computed: {
    ...mapGetters([
      'navTopTitle',
      'userInfo',
      'circulationDetails',
      'completeDeparnmentInfo',
      'circulationTaskId'
    ]),

    proId () {
      return this.userInfo.extendData.proId
    },
    userName () {
      return this.userInfo.userName
    },
    proName () {
      return this.userInfo.extendData.proName
    },
    workerId () {
      return this.userInfo.extendData.userId
    }
  },

  mounted () {
    console.log('详细信息',this.circulationDetails);
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        if (this.circulationDetails.state == 7) {
          this.changeIsFreshCirculationTaskPage(false)
        } else {
          this.changeIsFreshCirculationTaskPage(true)
        };
        this.$router.push({path:'/circulationTask'});
        this.changeTitleTxt({tit:'循环任务'});
        setStore('currentTitle','循环任务')
      })
    };
    this.getTaskMessage();
    this.drawTaskId()
  },

  methods: {
    ...mapMutations([
      'changeTitleTxt',
      'changeArriveDepartmentId',
      'changeIsCollectEnterSweepCodePage',
      'changeIsFreshCirculationTaskPage',
      'changeCirculationDetails'
    ]),

    // 返回上一页
    backTo () {
      if (this.circulationDetails.state == 7) {
        this.changeIsFreshCirculationTaskPage(false)
      } else {
        this.changeIsFreshCirculationTaskPage(true)
      };
      this.$router.push({path:'/circulationTask'});
      this.changeTitleTxt({tit:'循环任务'});
      setStore('currentTitle','循环任务')
    },

    // 任务状态转换
    stateTransfer (index) {
      switch(index) {
        case 0 :
          return '未分配'
          break;
        case 1 :
          return '未查阅'
          break;
        case 2 :
          return '未开始'
          break;
        case 3 :
          return '进行中'
          break;
        case 4 :
          return '未结束'
          break;
        case 5 :
          return '已延迟'
          break;
        case 6 :
          return '已取消'
          break;
        case 7 :
          return '已完成'
          break;
      }
    },

    // 获取任务详情
    getTaskMessage () {
      getCirculationTaskMessageById(this.circulationTaskId)
      .then((res) => {
        this.circulationTaskList = [];
        let temporaryTaskListFirst = [];
        if (res && res.data.code == 200) {
          if (JSON.stringify(res.data.data) !== "{}") {
            temporaryTaskListFirst.push(
              {
                createTime: res.data.data.createTime,
                startTime: res.data.data.startTime,
                proName: res.data.data.proName,
                officeName: res.data.data.proName,
                taskTypeName: res.data.data.taskTypeName,
                workerName: res.data.data.workerName,
                state: res.data.data.state,
                priority: res.data.data.priority,
                taskNumber: res.data.data.taskNumber,
                finishTime: res.data.data.finishTime,
                spaces: res.data.data.spaces,
                id: res.data.data.id,
                show: false,
                check: false,
                startUpTime: res.data.data.startUpTime
              }
            );
            this.circulationTaskList = temporaryTaskListFirst;
            // 改变科室列表数据结构
            for (let item = 0, len = this.circulationTaskList.length; item < len; item++) {
              let temporaryArrayTwo = [];
              for (let innerItem in this.circulationTaskList[item]) {
                if (innerItem == 'spaces') {
                  let temporaryArrayTwo = [];
                  let temporaryItem = removeBlock(this.circulationTaskList[item][innerItem]).split(",");
                  let temporaryArrayOne = [];
                  for (let kip of temporaryItem) {
                    temporaryArrayOne = [];
                    temporaryArrayOne = kip.replace(/\"/g, "").split(':');
                    temporaryArrayTwo.push({text: temporaryArrayOne[1], value: temporaryArrayOne[0]});
                  }
                  this.circulationTaskList[item]['spaces'] = temporaryArrayTwo;
                };
              }
            };
            // 科室列表增加字段
            for (let item of this.circulationTaskList) {
              for (let innerItem in item) {
                if (innerItem == 'spaces') {
                  for (let medicalItem of item[innerItem]) {
                    medicalItem['check'] = false
                  }
                }
              }
            };
            // 为完成采集的科室增加标记
            if (this.completeDeparnmentInfo.length > 0) {
              for (let w = 0, wLen = this.completeDeparnmentInfo.length; w < wLen; w++) {
                if (this.circulationTaskList.length > 0) {
                    for (let n = 0, nLen = this.circulationTaskList.length; n < nLen; n++) {
                    if (this.circulationTaskList[n]['id'] == this.completeDeparnmentInfo[w]['taskId']) {
                      if (this.completeDeparnmentInfo[w]['departmentIdList'].length > 0) {
                        for (let i = 0, len1 = this.completeDeparnmentInfo[w]['departmentIdList'].length; i < len1; i++) {
                          if (this.circulationTaskList[n]['spaces'].length > 0) {
                            for (let j = 0, len2 = this.circulationTaskList[n]['spaces'].length; j < len2; j++) {
                              if (this.circulationTaskList[n]['spaces'][j]['value'] == this.completeDeparnmentInfo[w]['departmentIdList'][i]) {
                                this.circulationTaskList[n]['spaces'][j]['check'] = true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            };
            // 改变调度具体某一任务的信息状态
            this.changeCirculationDetails(this.circulationTaskList[0])
          }
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
      })
    },

    // 提取存储已完成采集任务科室所属任务id
    drawTaskId () {
      this.drawCompleteTaskIdList = [];
      if (this.completeDeparnmentInfo.length > 0) {
        for (let item of this.completeDeparnmentInfo) { 
          for (let innerItem in item) {
            if (innerItem == 'taskId') {
              this.drawCompleteTaskIdList.push(item[innerItem])
            }
          }
        }
      }
    },

    // 循环任务送达
    circulationTaskArrived () {
      if (this.circulationDetails.state == 7) { 
        this.$dialog.alert({
          message: '该条循环任务已完成,不能进行送达',
          closeOnPopstate: true
        }).then(() => {
        });
      } else {
        this.changeArriveDepartmentId(true);
        if (this.circulationDetails['spaces'].filter((item) => item.check == true).length >= 1) {
          this.changeIsCollectEnterSweepCodePage(false);
          this.$router.push({path: 'circulationTaskSweepCode'});
          this.changeTitleTxt({tit:'扫码'});
          setStore('currentTitle','扫码')
        } else {
          this.$dialog.alert({
            message: '请至少采集完一个科室,才能进行送达',
            closeOnPopstate: true
          }).then(() => {
          });
        }
      }
    },

    // 进入扫码页
    joinSweepCode () {
      if (this.circulationDetails.state == 7) { 
        this.$dialog.alert({
          message: '该条循环任务已完成,不能进行扫码',
          closeOnPopstate: true
        }).then(() => {
        })
      } else {
        this.changeArriveDepartmentId(false);
        this.changeIsCollectEnterSweepCodePage(true);
        this.$router.push({'path':'/circulationTaskSweepCode'});
        this.changeTitleTxt({tit:'扫码'});
        setStore('currentTitle','扫码')
      }
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
      font-size: 16px;
    .basic-message {
      width: 95%;
      margin: 0 auto;
      margin-top: 6px;
      height: auto;
      background: #f3f3f3;
      position: relative;
      border: 1px solid #d6d6d6;
      .basic-message-title {
        position: absolute;
        top: 0;
        left: 0;
        padding: 4px 6px;
        box-sizing: border-box;
        border-right: 1px solid #d6d6d6;
        border-bottom: 1px solid #d6d6d6;
      }
      .wait-handle-message {
        margin-top: 35px;
        .handle-message-line-wrapper {
          margin-left: 5px;
          p {
            margin-bottom: 12px;
            width: 49%;
            display: inline-block;
            vertical-align: top;
            span:first-child {
              color: black
            };
            .message-tit-real-style {
              color: #2895ea;
            }
            span:last-child {
              line-height: 18px
            }
          }
        }
      }
    }
    .office-list {
      flex:1;
      overflow: auto;
      width: 95%;
      margin: 0 auto;
      .office-list-inner-wrapper {
        padding-top: 10px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        font-size: 0;
        span {
          font-size: 16px;
          display: inline-block;
          width: 48%;
          line-height: 50px;
          text-align: center;
          margin-right: 4%;
          margin-bottom: 12px;
          background: #f5f5f5;
          &:nth-child(even) {
            margin-right: 0
          }
        }
        .officeCheckStyle {
          background: #2895ea;
          color: #fff
        }
      }
    }
    .circultion-task-btn {
      height: 80px;
      text-align: center;
      line-height: 80px;
      >span {
        .bottomButton;
        display: inline-block;
        margin-top: 15px;
        img {
          width: 100%;
          height: 100%
        }
      }
      .circultion-task-btn-bottom {
        position: relative;
        height: 40px;
        width: 96%;
        margin: 0 auto;
        margin-top: 30px;
        span {
          width: 100%;
          border-radius: 4px;
          vertical-align: top;
          display: inline-block;
          line-height: 40px;
          height: 40px;
          background: #2895ea;
          color: #fff;
          text-align: center
        }
      }
    }
  }
</style>