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
            <span class="message-tit">任务类型:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.taskTypeName}}</span>
          </P>
          <p>
            <span class="message-tit">优先级:</span>
            <span class="message-tit-real" style="color:red">{{priorityTransfer(dispatchTaskMessage.priority)}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper handle-message-line-wrapper-other">
          <P>
            <span class="message-tit">任务起点:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.setOutPlaceName}}</span>
          </P>
        </div>
        <div class="handle-message-line-wrapper handle-message-line-wrapper-other">
          <P>
            <span class="message-tit">任务终点:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.destinationName}}</span>
          </P>
        </div>
        <div class="handle-message-line-wrapper">
          <p>
            <span class="message-tit">任务状态:</span>
            <span class="message-tit-real">{{stateTransfer(dispatchTaskMessage.state)}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper handle-message-line-wrapper-other">
          <p>
            <span class="message-tit">任务时间:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.planStartTime}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper">
          <P>
            <span class="message-tit">病人姓名:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.patientName == "" ? '无' : dispatchTaskMessage.patientName}}</span>
          </P>
          <p>
            <span class="message-tit">床号:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.bedNumber == "" ? '无' : dispatchTaskMessage.bedNumber}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper">
          <p>
            <span class="message-tit">数量:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.actualCount == "" ? "无" : dispatchTaskMessage.actualCount}}</span>
          </p>
          <p>
            <span class="message-tit">转运工具:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.toolName == "" ? '无' : dispatchTaskMessage.toolName}}</span>
          </p>
        </div>
        <div class="handle-message-line-wrapper">
          <p class="describe-line-wrapper">
            <span class="message-tit">任务描述:</span>
            <span class="message-tit-real">{{dispatchTaskMessage.taskRemark ? dispatchTaskMessage.taskRemark : '无'}}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="office-list">
      <div class="basic-message-title">地点轨迹</div>
      <div class="office-list-inner-wrapper">
        <p class="track-name" v-if="dispatchTaskMessage.state !== 7">
          <span>{{dispatchTaskMessage.hasSanOut ? dispatchTaskMessage.hasSanOut.split(';')[0] : ''}}</span>
          <span v-show="dispatchTaskMessage.hasSanOut!=''" class="collect-parcel">(取件)</span>
          <span v-for="(item,index) in dispatchTaskMessage.distName" :key="`we${item}-${index}`">{{item}}
            <span class="send-parcel">(送件)</span>
          </span>
        </p>
        <p class="track-name" v-else>
          <span>{{dispatchTaskMessage.setOutPlaceName}}</span>
          <span class="collect-parcel">(取件)</span>
          <span v-for="(item,index) in dispatchTaskMessage.distName" :key="`we${item}-${index}`">{{item}}
            <span class="send-parcel">(送件)</span>
          </span>
          <span v-show="dispatchTaskMessage.isBack == 1">{{dispatchTaskMessage.setOutPlaceName}}</span>
          <span v-show="dispatchTaskMessage.isBack == 1" class="collect-parcel">(取件)</span>
        </p>
      </div>
    </div>
    <div class="circultion-task-btn">
      <p class="circultion-task-btn-top" v-show="dispatchTaskMessage.state != 7">
        <span @click="fetchPiece">取件</span>
        <span @click="sendPiece">送件</span>
      </p>
      <p class="circultion-task-btn-bottom" v-show="!isSingleDestination && dispatchTaskMessage.state != 7">
        <span @click="endTask">完成任务</span>
      </p>
      <p class="circultion-task-btn-bottom" v-show="dispatchTaskMessage.state == 7">
        <span @click="backTo">返回</span>
      </p>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import FooterBottom from '@/components/FooterBottom'
import {} from '@/api/medicalPort.js'
import {updateDispatchTask,getDispatchTaskMessageById} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, removeBlock, Dictionary, deepClone, repeArray} from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'dispatchDetails',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      trackList: []
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
      'completeDeparnmentInfo',
      'isCompleteSweepCodeDestinationList',
      'departmentInfoListNo',
      'dispatchTaskMessage',
      'isSingleDestination',
      'dispatchTaskState',
      'dispatchTaskDepartmentType',
      'isCompleteSweepCode',
      'isBack',
      'dispatchTaskId',
      'currentDepartmentNumber',
      'catch_components'
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
    },
    taskId () {
      return this.dispatchTaskMessage.id
    }
  },


  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        if (this.dispatchTaskMessage.state == 7) {
          this.changeIsFreshDispatchTaskPage(false)
        } else {
          this.changeIsFreshDispatchTaskPage(true)
        };
        this.$router.push({path:'/dispatchTask'});
        this.changeTitleTxt({tit:'调度任务'});
        setStore('currentTitle','调度任务')
      })
    };
    this.getTaskMessage()
  },

  methods: {
    ...mapMutations([
      'changeTitleTxt',
      'changeIsCompleteSweepCodeDestinationList',
      'changeisCompleteSweepCode',
      'changeIsFreshDispatchTaskPage',
      'changeDispatchTaskMessage',
      'changeIsCoerceTakePhoto',
      'changeDispatchTaskDepartmentType',
      'changeDispatchTaskState',
      'changeCurrentDepartmentNumber',
      'changeCatchComponent'
    ]),

    // 获取任务详情
    getTaskMessage () {
      getDispatchTaskMessageById(this.dispatchTaskId)
      .then((res) => {
        if (res && res.data.code == 200) {
          // 改变调度具体某一任务的信息状态
          this.changeDispatchTaskMessage({DtMsg: res.data.data})
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

    // 返回上一页
    backTo () {
      if (this.dispatchTaskMessage.state == 7) {
        this.changeIsFreshDispatchTaskPage(false)
      } else {
        this.changeIsFreshDispatchTaskPage(true)
      };
      this.$router.push({path:'/dispatchTask'});
      this.changeTitleTxt({tit:'调度任务'});
      setStore('currentTitle','调度任务')
    },

    // 结束任务
    endTask () {
      if (this.dispatchTaskMessage.distName.length == 0) {
        this.$toast('至少完成一个目的地时,才能结束任务');
        return
      };
      if (this.dispatchTaskMessage.state == 4) {
        this.$toast('请再次扫描出发地结束任务');
      } else {
        this.$dialog.alert({
          message: '确定结束任务?',
          showCancelButton: true
        })
        .then(() => {
          if (this.dispatchTaskMessage.state == 7) {
            this.changeIsFreshDispatchTaskPage(false)
          } else {
            this.changeIsFreshDispatchTaskPage(true)
          };
          this.judgeIsGoDeparture()
        })
        .catch((err) => {
        })
      }
    },

    // 判断是否需要要回到出发地 0不回 1回
    judgeIsGoDeparture () {
      if (this.isBack == 1) {
        // 需要回到出发地时更新任务状态为4未结束
        this.updateTaskState({
          proId: this.proId, //当前项目ID
          id: this.dispatchTaskMessage.id, //当前任务ID
          state: 4//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
        })
      } else {
        this.updateTaskState({
          proId: this.proId, //当前项目ID
          id: this.dispatchTaskMessage.id, //当前任务ID
          state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
        })
      }
    },

     // 更新任务状态
    updateTaskState (data) {
      updateDispatchTask(data).then((res) => {
        if (res && res.data.code == 200) {
          // 为单一类型目的地或第二次扫出发地时结束该任务
          if ((this.dispatchTaskDepartmentType == 1 && this.isSingleDestination && this.dispatchTaskState != 4) || (this.dispatchTaskState == 7)) {
            this.$toast('该条任务已完成');
            // 清空该完成任务存储的已扫过非单一目的地科室信息
            let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCodeDestinationList);
            temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
            this.changeIsCompleteSweepCodeDestinationList(temporarySweepCodeOficeList);
            setStore('completeDispatchSweepCodeDestinationInfo', {"sweepCodeInfo": temporarySweepCodeOficeList});

            // 清空该完成任务存储的已校验通过的当前科室编号
            let temporaryCurrentDepartmentNumber = deepClone(this.currentDepartmentNumber);
            temporaryCurrentDepartmentNumber = temporaryCurrentDepartmentNumber.filter((item) => { return item.taskId != this.taskId});
            this.changeCurrentDepartmentNumber(temporaryCurrentDepartmentNumber);
            setStore('completDepartmentNumber', {"number": temporaryCurrentDepartmentNumber})
          };
          // 清空完成该任务存储的已扫过出发地和单一目的地科室信息
          let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCode);
          temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
          this.changeisCompleteSweepCode(temporarySweepCodeOficeList);
          setStore('completeDispatchSweepCodeInfo', {"sweepCodeInfo": temporarySweepCodeOficeList});
          this.$router.push({path:'/dispatchTask'});
          this.changeTitleTxt({tit:'调度任务'});
          setStore('currentTitle','调度任务')
        } else {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: true
          }).then(() => {
          });
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

    // 根据科室id获取科室名称
    getDepartmentName () {
      let temporarySweepCodeDestinationList = [];
      let temporarySweepCodeOficeList = [];
      let echoIndex = this.isCompleteSweepCodeDestinationList.indexOf(this.isCompleteSweepCodeDestinationList.filter((item) => {return item.taskId == this.taskId})[0]);
      if (echoIndex == -1) {return};
      temporarySweepCodeOficeList = this.isCompleteSweepCodeDestinationList.filter((item) => { return item.taskId == this.taskId})[0]['officeList'];
      for (let item of temporarySweepCodeOficeList) {
        temporarySweepCodeDestinationList.push(Dictionary(this.departmentInfoListNo,item.toString()))
      };
      this.trackList = temporarySweepCodeDestinationList;
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

    // 任务优先级转换
      priorityTransfer (index) {
        switch(index) {
          case 1 :
            return '正常'
            break;
          case 2 :
            return '重要'
            break;
          case 3 :
            return '紧急'
            break;
          case 4 :
            return '紧急重要'
            break;
        }
      },

    // 取件
    fetchPiece () {
      if (this.dispatchTaskMessage.state == 3 || this.dispatchTaskMessage.state == 4) {
        this.$toast('取件已完成，请点击送件')
      } else {
        this.joinSweepCode()
      }
    },

    // 送件
    sendPiece () {
      if (this.dispatchTaskMessage.state == 2) {
        this.$toast('请先完成出发地取件');
      } else {
        this.joinSweepCode()
      }
    },

    // 进入扫码页
    joinSweepCode () {
      if (this.dispatchTaskMessage.state == 7) { 
        this.$dialog.alert({
          message: '该条调度任务已完成,不能进行扫码',
          closeOnPopstate: true
        }).then(() => {
        })
      } else {
      if (this.dispatchTaskMessage.state == 2) {
          // 判断出发地是否强制拍照
          this.changeIsCoerceTakePhoto(this.dispatchTaskMessage.startPhoto);
          this.changeDispatchTaskDepartmentType(0);
          this.changeDispatchTaskState(3)
        } else if (this.dispatchTaskMessage.state == 3) {
          // 判断目的地是否强制拍照
          this.changeIsCoerceTakePhoto(this.dispatchTaskMessage.endPhoto);
          this.changeDispatchTaskDepartmentType(1);
          // 判断是否回到出发地0不回1回
          if (this.dispatchTaskMessage.isBack == 0) {
            this.changeDispatchTaskState(7)
          } else {
            this.changeDispatchTaskState(4)
          }
        } else if (this.dispatchTaskMessage.state == 4) {
          this.changeIsCoerceTakePhoto(this.dispatchTaskMessage.startPhoto);
          this.changeDispatchTaskDepartmentType(0);
          this.changeDispatchTaskState(7)
        };
        this.$router.push({'path':'/DispatchTaskSweepCode'});
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
          margin: 0 5px;
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
          };
          .describe-line-wrapper {
            width: 100%
          }
        }
        .handle-message-line-wrapper-other {
          p {
            width: 100%;
          }
        }
      }
    }
    .office-list {
      flex:1;
      overflow: auto;
      width: 95%;
      margin: 0 auto;
      margin-top: 8px;
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
      .office-list-inner-wrapper {
        margin-top: 25px;
        box-sizing: border-box;
        width: 100%;
        height: 90%;
        padding: 10px;
        overflow: auto;
        .track-name {
          span {
            display: inline-block;
            line-height: 24px
          }
          .collect-parcel {
            position: relative;
            margin-right: 16px;
            &:after {
              content: "—";   
              position: absolute;
            }
          }
          .send-parcel {
            position: relative;
            margin-right: 20px;
            &:after {
              content: "—";   
              position: absolute;
            }
          }
        }
      }
    }
    .circultion-task-btn {
      width: 95%;
      margin: 0 auto;
      padding: 10px;
      height: auto;
      span {
        vertical-align: top;
        display: inline-block;
        line-height: 40px;
        height: 40px;
        background: #2895ea;
        color: #fff;
        text-align: center
      }
      .circultion-task-btn-top {
        position: relative;
        height: 40px;
        span {
          width: 47%;
          border-radius: 4px;
          &:first-child {
            position: absolute;
            top: 0;
            left: 0
          } 
          &:last-child {
            position: absolute;
            top: 0;
            right: 0
          } 
        }
      };
       .circultion-task-btn-bottom {
        position: relative;
        height: 40px;
        margin-top: 10px;
        span {
          width: 100%;
          border-radius: 4px
        }
      }
    }
  }
</style>