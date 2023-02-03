<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
     <!-- 分配弹框   -->
    <div class="allocation-box allocation-box-one">
      <van-dialog v-model="allocationShow" width="80%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseAllocationDialogEvent"
        @confirm="allocationDialogSure"
        @cancel="allocationDialogCancel"
        confirm-button-text="确定"
        cancel-button-text="取消"
      >
        <div class="dialog-top">
          请选择分配至
        </div>
        <div class="dialog-center">
          <SelectSearch :itemData="allocationOption" ref="allocationOption" :curData="allocationValue" @change="allocationOptionChange" />
        </div>
      </van-dialog>
    </div>
    <!-- 延迟原因弹框 -->
    <div class="allocation-box">
      <van-dialog v-model="delayReasonShow" width="80%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseDelayReasonDialogEvent"
        @confirm="delayReasonDialogSure"
        @cancel="delayReasonDialogCancel"
        confirm-button-text="确定"
        cancel-button-text="取消"
      >
        <div class="dialog-top">
          请选择延迟原因
        </div>
        <div class="dialog-center">
          <SelectSearch :itemData="delayReasonOption" ref="delayOption" :isNeedSearch="false" :curData="delayReasonValue" @change="delayReasonOptionChange" />
        </div>
      </van-dialog>
    </div>
     <!-- 取消原因弹框 -->
    <div class="allocation-box">
      <van-dialog v-model="cancelReasonShow" width="80%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseCancelReasonDialogEvent"
        @confirm="cancelReasonDialogSure"
        @cancel="cancelReasonDialogCancel"
        confirm-button-text="确定"
        cancel-button-text="取消"
      >
        <div class="dialog-top">
          请选择取消原因
        </div>
        <div class="dialog-center">
          <SelectSearch :itemData="cancelReasonOption" ref="cancelOption" :isNeedSearch="false" :curData="cancelReasonValue" @change="cancelReasonOptionChange" />
        </div>
      </van-dialog>
    </div>
     <!-- 图片放大弹框  -->
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>
    <!-- 右侧菜单 -->
    <van-popup v-model="rightMenuShow" position="right" ref="vanPopup" :style="{ width: '60%', height: '100%' }">
        <div class="top-icon">
            <img :src="switchHiddenPng" alt="切换隐藏" @click="switchHiddenEvent">
        </div>
        <div class="center-content">
            <div class="function-list" :class="{'functionListStyle': functionListIndex == index}" v-for="(item, index) in taskList" :key="index" @click="taskRouterSkip(item.tit,index)">
                {{ item.tit }}
            </div>
        </div>
        <div class="signout-box" @click="signOutEvent">
            下班签退
        </div>
    </van-popup>
    <div class="nav">
       <van-nav-bar
        title="任务详情"
        left-text=""
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
    >
        <template #right>
            <img :src="switchShowPng" alt="切换显示" @click="onClickRight">
        </template>
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
            <div class="message-box">
                <div class="message-one">
                    <div class="message-one-left">
                        <span>编号:</span>
                        <span>{{ schedulingTaskDetails.taskNumber }}</span>
                    </div>
                    <div class="message-one-right" :class="{'noLookupStyle':schedulingTaskDetails.state == 1,'underwayStyle':schedulingTaskDetails.state == 3}">
                        {{ taskStatusTransition(schedulingTaskDetails.state) }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>创建时间</span>
                    </div>
                    <div class="message-two-right">
                        {{ schedulingTaskDetails.createTime }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>已经历时间</span>
                    </div>
                    <div class="message-two-right">
                        {{ elapsedTime(schedulingTaskDetails.planStartTime) }}
                    </div>
                </div>
                 <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>响应时间</span>
                    </div>
                    <div class="message-two-right">
                        {{ schedulingTaskDetails.responseTime }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>开始时间</span>
                    </div>
                    <div class="message-two-right">
                        {{ schedulingTaskDetails.planStartTime }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>位置</span>
                    </div>
                    <div class="message-two-right">
                        {{ schedulingTaskDetails.depName }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>房间</span>
                    </div>
                    <div class="message-two-right">
                       {{ disposeCheckType(schedulingTaskDetails.spaces) }}
                    </div>
                </div>
                <div class="message-one message-two message-six">
                    <div class="message-two-left">
                        <span>优先级</span>
                    </div>
                    <div class="message-two-right" 
                    :class="{
                        'priorityNormalStyle' : schedulingTaskDetails.priority == 1,
                        'priorityUrgencyStyle' : schedulingTaskDetails.priority == 2,
                        'priorityImportanceStyle' : schedulingTaskDetails.priority == 3,
                        'priorityUrgentImportanceStyle' : schedulingTaskDetails.priority == 4,
                     
                     }">
                        {{ taskPriotityTransition(schedulingTaskDetails.priority) }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>维修员</span>
                    </div>
                    <div class="message-two-right">
                        {{ schedulingTaskDetails.workerName }}
                    </div>
                </div>
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>参与人</span>
                    </div>
                    <div class="message-two-right">
                        {{ disposeTaskPresent(schedulingTaskDetails.present) }}
                    </div>
                </div>
                <div class="issue-image">
                    <div class="issue-image-left">
                        <span>问题图片</span>
                    </div>
                    <div class="issue-image-list" v-if="schedulingTaskDetails.images && schedulingTaskDetails.images.length > 0">
                        <span v-for="(innerItem,innerIndex) in schedulingTaskDetails.images" :key="innerIndex" >
                            <img alt="" :src="innerItem.path" @click="enlareEvent(innerItem.path)"
                            >
                        </span>
                    </div>
                </div>   
                <div class="message-one message-two">
                    <div class="message-two-left">
                        <span>问题描述</span>
                    </div>
                    <div class="message-two-right task-remark">
                        {{ schedulingTaskDetails.taskDesc }}
                    </div>
                </div>
            </div>
            <div class="btn-box">
                <span class="operate-one" @click="allocationEvent" v-if="schedulingTaskDetails.state == 0">分配</span>
                <span class="operate-two" @click="editEvent">编辑</span>
                <span class="operate-three" @click="delayReasonEvent" v-if="schedulingTaskDetails.hasDelay == 0">延迟</span>
                <span class="operate-four" @click="cancelReasonEvent">取消</span>
            </div>
        </div>
    </div> 
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {userSignOut} from '@/api/login.js'
import { assignRepairsTask, delayRepairsTask, cancelRepairsTask } from '@/api/taskScheduling.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { setStore,removeAllLocalStorage } from '@/common/js/utils'
import SelectSearch from "@/components/SelectSearch";
export default {
  name: "SchedulingRepairsTaskDetails",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      loadingText: '加载中',
      moveInfo: {
        startX: ''
      },
      allocationShow: false,
      delayReasonShow: false,
      cancelReasonShow: false,
      functionListIndex: 0,
      currentImgUrl: '',
      imgBoxShow: false,
      overlayShow: false,
      rightMenuShow: false,
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      switchShowPng: require("@/common/images/home/switch-show.png"),
      switchHiddenPng: require("@/common/images/home/switch-hidden.png"),
      anxiousSignPng: require("@/common/images/home/anxious-sign.png"),
      taskList: [
        {tit:'调度管理'},
        {tit:'调度任务'},
        {tit:'预约任务'},
        {tit:'循环任务'}
      ],
      transporterValue: null,
      transporterOption: [],
      selectAllocation: {},
      allocationValue: null,
      allocationOption:  [],
      selectDelayReason: {},
      delayReasonValue: null,
      delayReasonOption: [],
      repairsDelayReasonOption: [],
      selectCancelReason: {},
      cancelReasonValue: null,
      cancelReasonOption: [],
      repairsCancelReasonOption: [],
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/engineeringTaskManagement');
    this.registerSlideEvent();
    // 回显运送员列表、取消原因列表、延迟原因列表
    this.allocationOption = this.schedulingTaskAboutMessage['allocationOption'];
    this.repairsCancelReasonOption = this.schedulingTaskAboutMessage['repairsCancelReasonOption'];
    this.repairsDelayReasonOption = this.schedulingTaskAboutMessage['repairsDelayReasonOption']
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","schedulingTaskDetails","schedulingTaskAboutMessage","operateBtnClickRecord"]),
    proId () {
      return this.userInfo.extendData.proId
    }
  },

  methods: {
    ...mapMutations(["changeTitleTxt","changeCatchComponent","changeOverDueWay","changeOperateBtnClickRecord"]),

     onClickLeft() {
      this.$router.push({ path: "/engineeringTaskManagement"})
    },

    // 处理维修任务空间信息
    disposeCheckType (item) {
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.name)
      };
      return temporaryArray.join('、')
    },

    // 处理维修任务参与者
    disposeTaskPresent (item) {
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.name)
      };
      return temporaryArray.join('、')
    },

    // 注册滑动事件  
    registerSlideEvent () {
      this.$refs.wrapper.addEventListener('touchstart',this.touchstartHandle,false);
      this.$refs.wrapper.addEventListener('touchmove',this.touchmoveHandle,false)
    },

    // 滑动开始
    touchstartHandle() {
        //判断是否在滑动区域内滑动
        let e = e || window.event;
        if (e.targetTouches.length == 1) {
            this.isSlideArea = true;
            this.moveInfo.startX = parseInt(e.targetTouches[0].clientX)
        }    
    },

    // 滑动中
    touchmoveHandle() {
        let e = e || window.event;
        if (e.targetTouches.length == 1) {
        // 滑动距离
        let moveX = parseInt((e.targetTouches[0].clientX - this.moveInfo.startX));
        //左滑(根据左右滑动来控制右侧菜单的显示与隐藏)
        if (moveX < -50) {
            this.rightMenuShow = true
        } else {
            this.rightMenuShow = false
        };
        e.preventDefault();
        }        
    },

    // 计算已经历时间
    elapsedTime (planStartTme) {
      let currentTime = new Date().getTime();
      let transferPlanStartTme = new Date(planStartTme).getTime();
      if (transferPlanStartTme > currentTime) {
        return ''
      } else {
        return `${this.$moment(currentTime).diff(transferPlanStartTme, 'minutes')}分钟`
      }
    },

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 优先级转换
    taskPriotityTransition (state) {
      switch(state) {
        case 1 :
          return '正常'
          break;
        case 2 :
          return '紧急'
          break;
        case 3 :
          return '重要'
          break;
        case 4 :
          return '紧急重要'
          break
      }
    },

    // 分配弹框运送员下拉框选值变化事件
    allocationOptionChange (item) {
      this.selectAllocation = item
    },

    // 分配弹框关闭前事件
    beforeCloseAllocationDialogEvent (action, done) {
      if (action == 'confirm') {
        if (this.selectAllocation.value == null) {
          this.$toast('请选择运送员');
          done(false)
        } else {
          done()
        }
      } else {
        done()
      }
    },

    // 分配弹框确定事件
    allocationDialogSure () {
      if (this.selectAllocation.value == null) { return };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadingText = '分配中...';
      assignRepairsTask({
          id: this.schedulingTaskDetails['id'], //任务id
          proId: this.proId, //项目id
          isMe: this.schedulingTaskDetails['isMe'], // 是否我方
          taskNumber: this.schedulingTaskDetails['taskNumber'], // 任务编号
          present: this.schedulingTaskDetails['present'], //参与者
          workerId: this.selectAllocation['value'], //运送员id
          workerName: this.selectAllocation['text'] //运送员姓名
        })
        .then((res) => {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$refs['allocationOption'].clearSelectValue();
          if (res && res.data.code == 200) {
            this.$toast('分配成功');
            // 返回任务调度页
            this.onClickLeft()
          } else {
            this.loadingText = '';
            this.$toast({
              type: 'fail',
              message: res.data.msg
            })
          }
        })
        .catch((err) => {
          this.$refs['allocationOption'].clearSelectValue();
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'fail',
            message: err
          })
      })
    },

    // 分配弹框取消事件
    allocationDialogCancel () {
      this.$refs['allocationOption'].clearSelectValue()
    },

    // 延迟原因弹框下拉框选值变化事件
    delayReasonOptionChange (item) {
      this.selectDelayReason = item
    },

    // 延迟原因弹框关闭前事件
    beforeCloseDelayReasonDialogEvent (action, done) {
      if (action == 'confirm') {
        if (this.selectDelayReason.value == null) {
          this.$toast('请选择延迟原因');
          done(false)
        } else {
          done()
        }
      } else {
        done()
      }
    },

    // 延迟原因弹框确定事件
    delayReasonDialogSure () {
      if (this.selectDelayReason.value == null) { return };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadingText = '延迟中...';
      // 维修任务延迟
        delayRepairsTask({
          taskId: this.schedulingTaskDetails['id'], //任务id
          proId: this.proId, // 医院id
          reason: this.selectDelayReason['text'], //延迟原因
          state: 7
        })
        .then((res) => {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$refs['delayOption'].clearSelectValue();
          if (res && res.data.code == 200) {
            this.$toast('延迟成功');
            // 返回任务调度页
            this.onClickLeft()
          } else {
            this.loadingText = '';
            this.$toast({
              type: 'fail',
              message: res.data.msg
            })
          }
        })
        .catch((err) => {
          this.$refs['delayOption'].clearSelectValue();
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'fail',
            message: err
          })
      })
    },

    // 延迟原因弹框取消事件
    delayReasonDialogCancel () {
      this.$refs['delayOption'].clearSelectValue()
    },

    // 取消点击事件
    cancelReasonEvent(item,index,text) {
      this.cancelReasonShow = true;
      this.taskId = item.id;
      if (this.activeName == 'repairsTask') {
        this.cancelReasonOption = this.repairsCancelReasonOption
      }
    },

    // 取消原因弹框下拉框选值变化事件
    cancelReasonOptionChange (item) {
      this.selectCancelReason = item
    },

    // 取消原因弹框关闭前事件
    beforeCloseCancelReasonDialogEvent (action, done) {
      if (action == 'confirm') {
        if (this.selectCancelReason.value == null) {
          this.$toast('请选择取消原因');
          done(false)
        } else {
          done()
        }
      } else {
        done()
      }
    },

    // 取消原因弹框确定事件
    cancelReasonDialogSure () {
      if (this.selectCancelReason.value == null) { return };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadingText = '取消中...';
      // 维修任务取消
        cancelRepairsTask({
          taskId: this.schedulingTaskDetails['id'], //任务id
          state: 6,
          proId: this.proId, // 医院id
          reason: this.selectCancelReason['text'] //取消原因
        })
        .then((res) => {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$refs['cancelOption'].clearSelectValue();
          if (res && res.data.code == 200) {
            this.$toast('取消成功');
            // 返回任务调度页
            this.onClickLeft()
          } else {
            this.loadingText = '';
            this.$toast({
              type: 'fail',
              message: res.data.msg
            })
          }
        })
        .catch((err) => {
          this.$refs['cancelOption'].clearSelectValue();
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'fail',
            message: err
          })
      })
    },

    // 取消原因弹框取消事件
    cancelReasonDialogCancel () {
      this.$refs['cancelOption'].clearSelectValue()
    },


    // 切换显示右侧菜单事件
    onClickRight () {
      this.rightMenuShow = true
    },

    // 切换隐藏右侧菜单事件
    switchHiddenEvent () {
      this.rightMenuShow = false
    },

    // 右侧菜单任务列表点击事件
    taskRouterSkip (name, index) {
        this.functionListIndex = index;
        if (name === '调度任务') {
          this.$router.push({path:'/dispatchTask'});
          this.changeTitleTxt({tit:'调度任务'});
          setStore('currentTitle','调度任务')
        } else if (name === '循环任务') {
          this.$router.push({path:'/circulationTask'})
          this.changeTitleTxt({tit:'循环任务'});
          setStore('currentTitle','循环任务')
        } else if (name === '预约任务') {
          this.$router.push({path:'/appointTask'});
          this.changeTitleTxt({tit:'预约任务'});
          setStore('currentTitle','预约任务')
        } else if (name === '调度管理') {
          this.$router.push({path:'/taskScheduling'});
          this.changeTitleTxt({tit:'中央运送任务管理'});
          setStore('currentTitle','中央运送任务管理')
        }
      },

      // 下班签退事件
      signOutEvent () {
          this.$dialog.alert({
            message: '确定签退?',
            closeOnPopstate: true,
            showCancelButton: true
          }).then(() => {
            this.userLoginOut(this.proId, this.userInfo.userName)
          })
          .catch(() => {
          })
      },

      // 用户签退
      userLoginOut (proId,workerId) {
        this.changeOverDueWay(true);
        setStore('storeOverDueWay',true);
        userSignOut(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            removeAllLocalStorage();
            this.changeCatchComponent([]);
            this.$router.push({path:'/'})
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
            this.changeOverDueWay(false);
            setStore('storeOverDueWay',false);
          }
        }).
        catch((err) => {
          this.changeOverDueWay(false);
          setStore('storeOverDueWay',false);
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      },


    // 任务状态转换
    taskStatusTransition (state) {
        switch(state) {
            case 0 :
                return '未分配'
                break;
            case 1 :
                return '未开始'
                break;
            case 2 :
                return '进行中'
                break
        }
    },

    // 分配点击事件
    allocationEvent () {
        // let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
        // temporaryOperateBtnClickRecord['allocationBtnClick'] = true;
        // this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
        // this.$router.push({path:'/taskScheduling'})
        this.allocationShow = true
    },

    // 编辑点击事件
    editEvent () {
        this.$router.push({path: '/editAppintTask'})
    },

    // 延迟点击事件
    delayReasonEvent () {
        // let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
        // temporaryOperateBtnClickRecord['delayBtnClick'] = true;
        // this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
        // this.$router.push({path:'/taskScheduling'})
        this.delayReasonShow = true;
        this.delayReasonOption = this.repairsDelayReasonOption
    },

    // 取消点击事件
    cancelReasonEvent () {
        // let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
        // temporaryOperateBtnClickRecord['cancelBtnClick'] = true;
        // this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
        // this.$router.push({path:'/taskScheduling'})
        this.cancelReasonShow = true;
        this.cancelReasonOption = this.repairsCancelReasonOption
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  .img-dislog-box {
    .van-dialog {
        .van-dialog__content {
            >img {
                width: 100%
            }
        }
    }
  };
  /deep/ .van-popup--right {
    padding: 20px 0 80px 0;
    box-sizing: border-box;
    .top-icon {
        padding-left: 10px;
        box-sizing: border-box
    };
    .center-content {
        margin-top: 20px;
        .function-list {
            width: 153px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            margin: 0 auto;
            border: 1px solid #3B9DF9;
            box-sizing: border-box;
            font-size: 16px;
            color: #3B9DF9;
            border-radius: 8px;
            margin-bottom: 20px
        };
        .functionListStyle {
            color: #fff !important;
            border: none !important;
            background: #3B9DF9 !important
        }
    };
    .signout-box {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 153px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #E86F50;
        font-size: 16px;
        color: #fff;
        border-radius: 8px
    }
  };
  .allocation-box {
    /deep/ .van-dialog {
      border-radius: 10px !important;
      overflow: inherit !important;
      .van-dialog__content {
          padding: 0 !important;
          box-sizing: border-box;
          .dialog-top {
            border-top-left-radius: 10px !important;
            border-top-right-radius: 10px !important;
            height: 40px;
            padding-left: 10px;
            position: relative;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #fff;
            background: #3B9DF9;
            text-align: left
          };
          .dialog-center {
            width: 80%;
            height: 20vh;
            margin: 0 auto;
            margin-top: 20px
          }
      };
      .van-dialog__footer {
          padding: 20px !important;
          box-sizing: border-box;
          justify-content: center;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            color: #3B9DF9;
            width: 40%;
            height: 40px;
            line-height: 40px;
            background: #fff;
            flex: none !important;
            border-radius: 10px;
            border: 1px solid #3B9DF9;
            margin-right: 30px
        };
        .van-dialog__confirm {
            color: #fff !important;
            height: 40px;
            line-height: 40px;
            flex: none !important;
            width: 40%;
            background: #3B9DF9;
            border-radius: 10px;
        }
      };
      .van-hairline--top::after {
        border-top-width: 0 !important
      }
    }  
  };
  .allocation-box-one {
    /deep/ .dialog-center {
      .list-module {
        max-height: 400px !important
      }
    }
  };
  .nav {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 10;
    left: 0;
    /deep/ .van-nav-bar {
        background: transparent;
        .van-nav-bar__left {
            .van-nav-bar__text {
                color: #fff !important;
                margin-left: 8px !important;
            }
        };
        .van-nav-bar__right {
            .van-nav-bar__text {
                font-weight: bold !important
            }
        }
        .van-icon {
            color: #fff !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
            color: #fff !important;
            font-size: 16px !important;
        }
    }
  };
  /deep/ .van-loading {
    z-index: 1000000
  };  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 0;
    .content-top-area {
      width: 100%;
      margin: 0 auto;
      height: 189px;
      position: absolute;
      top: 0;
      left: 0;
      > img {
        width: 100%;
        height: 100%
      }
    };
    .content-box {
        flex: 1;
        margin-top: 50px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        background: #f7f7f7;
        z-index: 10;
        .message-box {
            flex: 1;
            width: 100%;
            overflow: auto;
            .message-one {
                width: 100%;
                padding: 4px 6px;
                box-sizing: border-box;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                margin-top: 6px;
                .message-one-left {
                    color: #289E8E
                };
                .message-one-right {
                    width: 61px;
                    height: 27px;
                    text-align: center;
                    line-height: 27px;
                    color: #fff;
                    background: #289E8E;
                    border-radius: 4px
                };
                .noLookupStyle {
                    background: #E8CB51 !important
                };
                .underwayStyle {
                    background: #289E8E !important
                }
            };
            .message-two {
                align-items: flex-start !important;
                padding: 11px 6px;
                .message-two-left {
                    color: #9E9E9A
                };
                .message-two-right {
                    flex: 1;
                    color: #101010;
                    line-height: 20px;
                    word-break: break-all;
                    padding-left: 10px;
                    box-align: border-box;
                    text-align: right
                };
                .task-remark {
                    text-align: left !important
                }
            };
            .message-six {
                align-items: flex-start !important;
                .priorityNormalStyle { 
                    color: #289E8E !important
                };
                .priorityUrgencyStyle { 
                    color: #E8CB51 !important
                };
                .priorityImportanceStyle { 
                    color: #F2A15F !important
                };
                .priorityUrgentImportanceStyle { 
                    color: #E86F50 !important
                }
            };
            .issue-image {
                width: 100%;
                padding: 4px 6px;
                box-sizing: border-box;
                background: #fff;
                display: flex;
                align-items: center;
                font-size: 14px;
                margin-top: 6px;
                align-items: center;
                .issue-image-left {
                    color: #9E9E9A
                };
                .issue-image-list {
                    flex: 1;
                    display: flex;
                    margin-left: 6px;
                    flex-flow: row wrap;
                    > span {
                    display: inline-block;
                    width: 22%;
                    margin-right: 4%;
                    margin-bottom: 10px;
                    &:nth-child(4n) {
                        margin-right: 0
                    }
                    >img {
                        width: 100%;
                    }
                    }
                }
            }
        };
        .btn-box {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            >span {
                font-weight: bold;
                display: inline-block;
                color: #fff;
                border-radius: 10px;
                font-size: 14px;
                width: 76px;
                height: 29px;
                text-align: center;
                line-height: 29px;
                box-sizing: border-box;
                border-radius: 4px;
                margin-right: 8px;
                color: #fff
            };
            .operate-one {
                background: #F2A15F
            };
            .operate-two {
                background: #174E97
            };
            .operate-three {
                background: #254550
            };
            .operate-four {
                background: #E86F50;
                margin-right: 0
            }                   
        }
    }
  }
}
</style>