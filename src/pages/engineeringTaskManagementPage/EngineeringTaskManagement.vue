<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadingText }}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <!-- 筛选弹窗 -->
    <div class="screen-box">
      <van-dialog v-model="screenDialogShow" width="100%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseDialogEvent"
        @confirm="screenDialogSure"
        @cancel="screenDialogCancel"
        confirm-button-text="确认"
        cancel-button-text="重置"
      >
        <div class="dialog-top">
          <div class="select-title">全部筛选</div>
          <van-icon name="cross" size="24" @click="closeScreenDialogEvent" />
        </div>
        <div class="dialog-center">
          <div class="dialog-center-one-line">
            <span>目的区域选择</span>
            <SelectSearch ref="departmentOption" :isNeedSearch="false" :itemData="startPointDepartmentOption" :curData="startPointDepartmentValue" @change="startPointDepartmentOptionChange" />
            <span @click="startPointDepartmentClear">清除</span>
          </div>
          <div class="dialog-center-one-line">
            <span>维修员</span>
            <SelectSearch ref="transporterOption" :isNeedSearch="false" :itemData="transporterOption" :curData="transporterValue" @change="transporterOptionChange" />
            <span  @click="transporterValueClear">清除</span>
          </div>
          <div class="priority-box">
            <div class="priority-title">
              优先级
            </div>
            <van-checkbox-group v-model="priorityResult" direction="horizontal">
              <van-checkbox name="1" shape="square">正常</van-checkbox>
              <van-checkbox name="2" shape="square">重要</van-checkbox>
              <van-checkbox name="3" shape="square">紧急</van-checkbox>
              <van-checkbox name="4" shape="square">紧急重要</van-checkbox>
            </van-checkbox-group>
          </div>
        </div>
      </van-dialog>
    </div>
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
        title="工程维保任务管理"
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
            <van-tabs v-model="activeName" type="card" color="#fff" title-inactive-color="#9E9E9A" title-active-color="#174E97" @change="vanTabsChangeEvent">
                <van-tab title="报修任务" name="repairsTask">
                    <div class="task-message-top">
                      <div class="message-left">
                        <span>当前任务数:</span>
                        <span>{{ repairsTaskList.length }}</span>
                      </div>
                      <div class="message-right">
                        <span @click="createTask('报修任务')">创建任务</span>
                        <span @click="screenEvent">筛选</span>
                      </div>
                    </div>
                    <van-empty description="暂无数据" v-show="repairsTaskEmptyShow" />
                    <div class="backlog-task-list-box" ref="scrollRepairsTask" v-show="!repairsTaskEmptyShow">
                      <div class="backlog-task-list" v-for="(item,index) in repairsTaskList" :key="index" @click="enterRepairsTaskEvent(item,index,'维修任务')">
                          <div class="list-top appoint-list-top">
                            <div class="list-top-left">
                              <img :src="anxiousSignPng" alt="急" v-show="item.priority == 2 || item.priority == 3 || item.priority == 4">
                              <span>{{ item.depName == '/' ? '' : item.depName }}</span>
                            </div>
                            <div class="list-top-right" :class="{'noLookupStyle':item.state == 1,'underwayStyle':item.state == 2}">
                              {{ taskStatusTransition(item.state) }}
                            </div>
                          </div>
                          <div class="list-center appoint-list-center">
                            <div class="center-one-line">
                              <div class="center-one-line-left">
                                <span>创建时间:</span>
                                <span>{{ item.createTime }}</span>
                              </div>
                               <div class="center-one-line-right">
                                <span>已经历时间:</span>
                                <span>{{ elapsedTime(item.planStartTime) }}</span>
                              </div>
                            </div>
                            <div class="center-one-line">
                              <div class="center-one-line-left">
                                <span>响应时间:</span>
                                <span>{{ item.responseTime }}</span>
                              </div>
                               <div class="center-one-line-right">
                                <span>开始时间:</span>
                                <span>{{ item.startTime }}</span>
                              </div>
                            </div>
                            <div class="center-one-line">
                              <div class="center-one-line-left">
                                <span>房间:</span>
                                <span>{{ disposeCheckType(item.spaces) }}</span>
                              </div>
                               <div class="center-one-line-right">
                                <span>运送员:</span>
                                <span>{{ item.workerName }}</span>
                              </div>
                            </div>
                            <div class="issue-image">
                              <div class="issue-image-left">
                                <span>问题图片:</span>
                              </div>
                             <div class="issue-image-list" v-if="item.images && item.images.length > 0">
                                <span v-for="(innerItem,innerIndex) in item.images" :key="innerIndex" >
                                    <img alt="" :src="innerItem.path ? innerItem.path : ''" @click.stop="enlareEvent(innerItem.path)">
                                </span>
                             </div>
                            </div>
                            <div class="issue-describe">
                              <span>问题描述:</span>
                              <span>{{ item.taskDesc }}</span>
                            </div>
                          </div>
                          <div class="list-bottom appoint-list-bottom">
                            <div class="list-bottom-left">
                              <span @click.stop="() => { return }" class="delay-btn" v-if="item.hasDelay == 1">已延迟</span>
                              <span @click.stop="() => { return }" class="allocation-btn" v-if="item.state != 0">已分配</span>
                            </div>
                            <div class="list-bottom-right">
                              <span  v-if="item.state == 0" class="operate-one" @click.stop="allocationEvent(item,index,'维修任务')">分配</span>
                              <span class="operate-two" @click.stop="editEvent(item,index,'维修任务')">编辑</span>
                              <span v-if="item.hasDelay == 0" class="operate-three" @click.stop="delayReasonEvent(item,index,'维修任务')">延迟</span>
                              <span class="operate-four" @click.stop="cancelReasonEvent(item,index,'维修任务')">取消</span>
                            </div>
                          </div>
                        </div>
                      <div class="no-more-data" v-show="isShowAppointTaskNoMoreData">没有更多数据了</div>
                    </div>    
                </van-tab>
            </van-tabs>
        </div>
    </div>
    <!-- 图片放大弹框  -->
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {userSignOut} from '@/api/login.js'
import { repairsList, assignRepairsTask,queryDepartment,delayRepairsTask, cancelRepairsTask, getTransporter, queryRepairsTaskCancelReason,queryRepairsTaskDelayReason} from '@/api/taskScheduling.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { IsPC,setStore,removeAllLocalStorage } from '@/common/js/utils'
import SelectSearch from "@/components/SelectSearch";
export default {
  name: "EngineeringTaskManagement",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      loadingText: '加载中...',
      screenDialogShow: false,
      allocationShow: false,
      curentTaskInfo: '',
      delayReasonShow: false,
      cancelReasonShow: false,
      moveInfo: {
        startX: ''
      },
      functionListIndex: 0,
      taskId: '',
      imgBoxShow: false,
      currentImgUrl: '',
      overlayShow: false,
      rightMenuShow: false,
      repairsTaskEmptyShow: false,
      isShowDispatchTaskNoMoreData: false,
      isShowAppointTaskNoMoreData: false,
      activeName: 'repairsTask',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      switchShowPng: require("@/common/images/home/switch-show.png"),
      switchHiddenPng: require("@/common/images/home/switch-hidden.png"),
      anxiousSignPng: require("@/common/images/home/anxious-sign.png"),
      taskList: [
        {tit:'调度管理'},
        {tit:'报修任务'},
        {tit:'区域巡检'}
      ],
      priorityResult: ['1'],
      startPointDepartmentValue: null,
      startPointDepartmentOption: [],
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
      echoRepairsTaskList: [],
      repairsTaskList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        that.resetBtnClickStatus();
        that.$router.push({path: '/home'})
      })
    };
    this.$nextTick(()=> {
      try {
          this.initScrollChange();
          this.registerSlideEvent()
      } catch (error) {
          this.$toast({
              type: 'fail',
              message: error
          })
      }
    });
    this.parallelFunction()
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path == '/home') {
        vm.getRepairsList()
      } else {
        // 回显调度页面点击的任务类型
        if (vm.schedulingTaskType.taskTypeName) {
          vm.activeName = vm.schedulingTaskType.taskTypeName;
          vm.taskId = vm.schedulingTaskDetails.id
        };
        if (vm.schedulingTaskType.taskTypeName) {
          if (vm.schedulingTaskType.taskTypeName == 'repairsTask') {
            vm.getRepairsList()
          }
        }
      }
	});
    next() 
  },

   beforeRouteLeave(to, from, next) {
   if (to.path == '/home') {
      this.resetBtnClickStatus()
   };
   next() 
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","schedulingTaskType","schedulingTaskAboutMessage","operateBtnClickRecord","templateType","schedulingTaskDetails"]),
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

  methods: {
    ...mapMutations(["changeSchedulingTaskType","changeSchedulingTaskAboutMessage","changeTitleTxt","changeCatchComponent","changeOverDueWay","changeSchedulingTaskDetails","changeOperateBtnClickRecord"]),

     onClickLeft() {
      this.$router.push({ path: "/home"})
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

    // 维修任务列表
    getRepairsList () {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadingText = '加载中...';
      this.repairsTaskEmptyShow = false;
      repairsList(-3,this.proId,1)
      .then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.repairsTaskList = res.data.data;
          // 只显示未分配、未开始时、进行中三种任务的状态(0-未分配，1-未开始，2-进行中，3-待签字，5-已完成，6-已取消)
          this.repairsTaskList = this.repairsTaskList.filter(( item ) => { return item.state == 0 || item.state == 1 || item.state == 2 });
          this.echoRepairsTaskList = this.repairsTaskList;
          if (this.repairsTaskList.length == 0) {
            this.repairsTaskEmptyShow = true
          }
        } else {
          this.loadingText = '';
          this.$toast({
            type: 'fail',
            message: res.data.msg
          })
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$toast({
          type: 'fail',
          message: err
        })
      })
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

    // 并行查询目的地、运送员、任务取消原因、任务延迟原因
    parallelFunction () {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.overlayShow = true;
        Promise.all([this.getAllDestination(),this.queryTransporter(),this.getCancelReason(),this.getDelayReason()])
        .then((res) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          if (res && res.length > 0) {
            this.startPointDepartmentOption = [{
              text: '请选择',
              value: null
            }];
            this.transporterOption = [{
              text: '请选择',
              value: null
            }];
            this.allocationOption = [{
              text: '请选择',
              value: null
            }];
            this.repairsCancelReasonOption = [{
              text: '请选择取消原因',
              value: null
            }];
            this.repairsDelayReasonOption = [{
              text: '请选择延迟原因',
              value: null
            }];
            let [item1,item2,item3,item4] = res;
            if (item1) {
              item1.forEach((item,index) => {
                // 起点科室
                this.startPointDepartmentOption.push({
                  text: item['departmentName'],
                  value: item['id']
                })
              })
            };
            if (item2) {
              for (let i = 0, len = item2.length; i < len; i++) {
                this.transporterOption.push({
                  text: item2[i].workerName,
                  value: item2[i]['id'],
                  id: i
                });
                this.allocationOption.push({
                  text: item2[i].workerName,
                  value: item2[i]['id'],
                  id: i
                })
              };
              // 保存运送员列表信息
              let temporaryMessage = this.schedulingTaskAboutMessage;
              temporaryMessage['allocationOption'] = this.allocationOption;
              this.changeSchedulingTaskAboutMessage(temporaryMessage)
            };
            if (item3) {
              for (let i = 0, len = item3.length; i < len; i++) {
                this.repairsCancelReasonOption.push({
                  text: item3[i]['cancelName'],
                  value: item3[i]['id']
                })
              };
              // 保存任务取消原因列表信息
              let temporaryMessage = this.schedulingTaskAboutMessage;
              temporaryMessage['repairsCancelReasonOption'] = this.repairsCancelReasonOption;
              this.changeSchedulingTaskAboutMessage(temporaryMessage)
            };
            if (item4) {
              for (let i = 0, len = item4.length; i < len; i++) {
                this.repairsDelayReasonOption.push({
                  text: item4[i]['delayName'],
                  value: item4[i]['id']
                })
              };
            // 保存任务延迟原因列表信息
              let temporaryMessage = this.schedulingTaskAboutMessage;
              temporaryMessage['repairsDelayReasonOption'] = this.repairsDelayReasonOption;
              this.changeSchedulingTaskAboutMessage(temporaryMessage)
            }
          };
          // 根据任务详情页面点击的按钮,显示对应的弹框及为对应的弹框列表数据赋值
        //   if (this.operateBtnClickRecord) {
        //     if (this.operateBtnClickRecord['allocationBtnClick']) {
        //       this.allocationShow = true
        //     } else if (this.operateBtnClickRecord['delayBtnClick']) {
        //       if (this.activeName == 'repairsTask') {
        //         this.delayReasonOption = this.repairsDelayReasonOption
        //       };
        //       this.delayReasonShow = true
        //     } else if (this.operateBtnClickRecord['cancelBtnClick']) {
        //       if (this.activeName == 'repairsTask') {
        //         this.cancelReasonOption = this.repairsCancelReasonOption
        //       };
        //       this.cancelReasonShow = true
        //     }
        //   };
        })
        .catch((err) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {})
        })
      },
    
     // 查询科室
    getAllDestination () {
      return new Promise((resolve,reject) => {
        queryDepartment(this.proId,'').then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

    // 查询运送员
    queryTransporter () {
      return new Promise((resolve,reject) => {
        getTransporter(this.proId, this.workerId)
        .then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

    // 获取取消原因列表
    getCancelReason (type) {
       return new Promise((resolve,reject) => {
        queryRepairsTaskCancelReason(this.proId)
        .then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

    // 获取延迟原因列表
    getDelayReason (type) {
       return new Promise((resolve,reject) => {
        queryRepairsTaskDelayReason(this.proId)
        .then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
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
          if(this.rightMenuShow) {return};
          this.rightMenuShow = true
        } else if (moveX > 50) {
          if(!this.rightMenuShow) {return};
          this.rightMenuShow = false
        }
        }        
    },

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 筛选事件
    screenEvent () {
      this.screenDialogShow = true
    },

    // 筛选弹框起点科室下拉框值清除事件
    startPointDepartmentClear () {
      this.$refs['departmentOption'].clearSelectValue()
    },

    // 筛选弹框运送员下拉框值清除事件
    transporterValueClear () {
      this.$refs['transporterOption'].clearSelectValue()
    },

    // 筛选弹框目的科室下拉框选值变化事件
    startPointDepartmentOptionChange (item) {
      this.startPointDepartmentValue = item.value
    },

    // 筛选弹框运送员下拉框选值变化事件
    transporterOptionChange (item) {
      this.transporterValue = item.value
    },

    // 筛选弹框关闭前事件
    beforeCloseDialogEvent (action, done) {
      console.log(action);
      if (action == 'cancel') {
        this.$refs['departmentOption'].clearSelectValue();
        this.$refs['transporterOption'].clearSelectValue();
        this.priorityResult = [];
        done(false);
        return
      } else {
        done()
      }
    },

    // 根据科室名称获取科室id
    getCurrentDepartmentIdByName(text) {
      if (!text) { return null};
      return this.startPointDepartmentOption.filter((item) => {return item['text'] == text })[0]['value']
    },

    // 筛选弹框确定事件
    screenDialogSure () {
      try {
        if (this.activeName == 'repairsTask') {
              if (!this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length == 0) {
              this.repairsTaskList = this.echoRepairsTaskList;
              if (this.repairsTaskList.length == 0) {
                  this.repairsTaskEmptyShow = true
              } else {
                  this.repairsTaskEmptyShow = false
              }
              } else {
              this.repairsTaskList = this.echoRepairsTaskList.filter((item) => {
                  if (this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length > 0) {
                    if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
                      return item['depName'] == this.startPointDepartmentValue &&
                      item['workerId'] == this.transporterValue &&
                      this.priorityResult.indexOf(item.priority.toString()) != -1
                    } else {
                      if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
                        console.log(item['depName'].split('/'));
                        return this.getCurrentDepartmentIdByName(item['depName'].split('/')[1]) == this.startPointDepartmentValue &&
                        item['workerId'] == this.transporterValue &&
                        this.priorityResult.indexOf(item.priority.toString()) != -1
                      } else {
                        return item['depName'] == this.startPointDepartmentValue &&
                        item['workerId'] == this.transporterValue &&
                        this.priorityResult.indexOf(item.priority.toString()) != -1
                      }
                    }
                  } else {
                      if (this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length == 0) {
                        if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
                          return item['depName'] == this.startPointDepartmentValue
                        } else {
                          if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
                            return this.getCurrentDepartmentIdByName(item['depName'].split('/')[1]) == this.startPointDepartmentValue
                          } else {
                            return item['depName'] == this.startPointDepartmentValue
                          }
                        }
                      };
                      if (!this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length == 0) {
                        return item['workerId'] == this.transporterValue
                      };
                      if (!this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length > 0) {
                        return this.priorityResult.indexOf(item.priority.toString()) != -1
                      };
                      if (this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length == 0) {
                        if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
                          return item['depName'] == this.startPointDepartmentValue && item['workerId'] == this.transporterValue
                        } else {
                          if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
                            return this.getCurrentDepartmentIdByName(item['depName'].split('/')[1]) == this.startPointDepartmentValue && item['workerId'] == this.transporterValue
                          } else {
                            return item['depName'] == this.startPointDepartmentValue && item['workerId'] == this.transporterValue
                          }
                        }
                      };
                      if (this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length > 0) {
                        if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
                          return item['depName'] == this.startPointDepartmentValue && this.priorityResult.indexOf(item.priority.toString()) != -1
                        } else {
                          if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
                            return this.getCurrentDepartmentIdByName(item['depName'].split('/')[1]) == this.startPointDepartmentValue && this.priorityResult.indexOf(item.priority.toString()) != -1
                          } else {
                            return item['depName'] == this.startPointDepartmentValue && this.priorityResult.indexOf(item.priority.toString()) != -1
                          }
                        }
                      };
                      if (!this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length > 0) {
                        return item['workerId'] == this.transporterValue && this.priorityResult.indexOf(item.priority.toString()) != -1
                      };
                  }
              });
              if (this.repairsTaskList.length == 0) {
                  this.repairsTaskEmptyShow = true
              } else {
                  this.repairsTaskEmptyShow = false
              }
              }
        }
      } catch (err) {
        this.$toast(`${err}`)
      }  
    },

    // 筛选弹框取消事件
    screenDialogCancel () {

    },

    // 关闭筛选弹框
    closeScreenDialogEvent () {
      this.screenDialogShow = false
    },

    // 分配点击事件
    allocationEvent (item,index,text) {
      this.curentTaskInfo = item;
      this.allocationShow = true;
      this.taskId = item.id
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
        if (this.activeName == 'repairsTask') {
        assignRepairsTask({
            id: this.taskId, //任务id
            proId: this.proId, //项目id
            isMe: this.curentTaskInfo['isMe'], // 是否我方
            taskNumber: this.curentTaskInfo['taskNumber'], // 任务编号
            present: this.curentTaskInfo['present'], //参与者
            workerId: this.selectAllocation['value'], //运送员id
            workerName: this.selectAllocation['text'] //运送员姓名
          })
          .then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
            this.$refs['allocationOption'].clearSelectValue();
            if (res && res.data.code == 200) {
              this.$toast('分配成功');
              // 更新任务信息
              this.getRepairsList()
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
      }
    },

    // 分配弹框取消事件
    allocationDialogCancel () {
      this.$refs['allocationOption'].clearSelectValue()
    },

    // 编辑点击事件
    editEvent (item,index,text) {
      let temporaryTaskType = this.schedulingTaskType;
      if (text == '维修任务') {
        temporaryTaskType['taskTypeName'] = 'repairsTask';
        this.$router.push({path: '/editRepairsTask'})
      };
      // 保存调度页面任务详情
      this.changeSchedulingTaskDetails(item);
      // 保存调度页面任务点击的类型
      this.changeSchedulingTaskType(temporaryTaskType)
      this.resetBtnClickStatus()
    },

    // 延迟点击事件
    delayReasonEvent(item,index,text) {
      this.delayReasonShow = true;
      this.curentTaskInfo = item;
      this.taskId = item.id;
      if (this.activeName == 'repairsTask') {
        this.delayReasonOption = this.repairsDelayReasonOption
      }
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
      if (this.activeName == 'repairsTask') {
        delayRepairsTask({
            taskId: this.taskId, //任务id
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
              // 更新任务信息
              this.getRepairsList()
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
      }
    },

    // 延迟原因弹框取消事件
    delayReasonDialogCancel () {
      this.$refs['delayOption'].clearSelectValue()
    },

    // 取消点击事件
    cancelReasonEvent(item,index,text) {
      this.cancelReasonShow = true;
      this.curentTaskInfo = item;
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
      if (this.activeName == 'repairsTask') {
        cancelRepairsTask({
            taskId: this.taskId, //任务id
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
              // 更新任务信息
              this.getRepairsList()
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
      }
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

    // 进入任务详情事件
    enterRepairsTaskEvent (item,index,text) {
      let temporaryTaskType = this.schedulingTaskType;
      if (text == '维修任务') {
        temporaryTaskType['taskTypeName'] = 'repairsTask';
        this.$router.push({path:'/schedulingRepairsTaskDetails'})
      };
      // 保存调度页面任务详情
      this.changeSchedulingTaskDetails(item);
      // 保存调度页面任务点击的类型
      this.changeSchedulingTaskType(temporaryTaskType);
      this.resetBtnClickStatus()
    },

    // 重置按钮点击状态
    resetBtnClickStatus () {
      let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
      temporaryOperateBtnClickRecord['delayBtnClick'] = false;
      temporaryOperateBtnClickRecord['allocationBtnClick'] = false;
      temporaryOperateBtnClickRecord['cancelBtnClick'] = false;
      this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord)
    },

    // 创建任务
    createTask (text) {
      let temporaryTaskType = this.schedulingTaskType;
        if (text == '报修任务') {
        temporaryTaskType['taskTypeName'] = 'repairsTask';
        this.$router.push({path: '/createRepairsTask'})
      };
      // 保存调度页面任务点击的类型
      this.changeSchedulingTaskType(temporaryTaskType)
      this.resetBtnClickStatus()
    },

    // 右侧菜单任务列表点击事件
    taskRouterSkip (name, index) {
        this.functionListIndex = index;
        if (name === '报修任务') {
          this.resetBtnClickStatus();
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        } else if (name === '区域巡检') {
          this.resetBtnClickStatus();
          this.$router.push({path: 'departmentService'});
          this.changeTitleTxt({tit:'区域巡检'});
          setStore('currentTitle','区域巡检')
        } else if (name === '调度管理') {
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

    // 元素滚动事件
    initScrollChange () {
        // 完成任务列表下拉
        if (this.activeName == 'repairsTask') {
            let boxCompleteteScroll = this.$refs['scrollRepairsTask'];
            boxCompleteteScroll.addEventListener('scroll',(e)=> {
                if (Math.ceil(e.srcElement.scrollTop) + e.srcElement.offsetHeight >= e.srcElement.scrollHeight) {
                    console.log('完成滚动了',e.srcElement.scrollTop, e.srcElement.offsetHeight, e.srcElement.scrollHeight)
                }
            },true)
        }    
    },

    // tab切换值变化事件
    vanTabsChangeEvent (value) {
        if (value == 'repairsTask') {
          this.getRepairsList()
        };
        this.$nextTick(()=> {
            this.initScrollChange()
        })
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
  .screen-box {
    /deep/ .van-dialog {
      top: auto !important;
      left: 0 !important;
      border-right: 1px solid #fff;
      bottom: 0 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      transform: translate3d(0,0,0) !important;
      .van-dialog__content {
        padding: 0 20px 10px 20px !important;
        box-sizing: border-box;
        height: 30vh;
        .dialog-top {
          height: 60px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .select-title {
            font-size: 18px;
            color: #101010;
            text-align: center
          };
          /deep/ .van-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0
          }
        };
        .dialog-center {
          .dialog-center-one-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            >span {
              display: inline-block;
              &:nth-child(1) {
                width: 30%;
                font-size: 14px;
                color: #101010;
                font-weight: bold
              };
              &:nth-child(3) {
                color: #fff;
                font-size: 12px;
                padding: 4px;
                box-sizing: border-box;
                background: #E86F50
              }
            };
            /deep/ .vue-dropdown {
              width: 55%
            }
          };
          .priority-box {
            .priority-title {
              font-size: 14px;
              color: #101010;
              font-weight: bold;
              padding-top: 10px;
              margin-bottom: 20px
            }
          }
        }
      };
      .van-dialog__footer {
          padding: 20px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            color: #1864FF;
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            background: #fff;
            border-radius: 30px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            color: #fff !important;
            border-radius: 30px;
        }
      };
      .van-hairline--top::after {
        border-top-width: 0 !important
      }
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
        height: 100%;
        /deep/ .van-tabs {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 0;
            background: #f7f7f7;
            .van-tabs__wrap {
                width: 50%;
                height: 0.8rem;
                padding: 10px 0;
                .van-tabs__nav {
                    border: none !important;
                    background: #f7f7f7 !important;
                    .van-tab {
                        border-radius: 4px
                    }
                }
            };
            .van-tabs__content {
                flex: 1;
                padding: 0 4px 0px 4px;
                box-sizing: border-box;
                background: #f7f7f7;
                overflow: scroll;
                height: 0;
                display: flex;
                .van-tab__pane {
                    height: 100%;
                    position: relative;
                    .van-empty {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%,-50%)
                    };
                    .task-message-top {
                      width: 100%;
                      padding: 0 8px;
                      margin-bottom: 10px;
                      height: 42px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      box-sizing: border-box;
                      background: #fff;
                      .message-left {
                        >span {
                          font-size: 14px;
                          &:nth-child(1) {
                            color: #4B4B4B
                          };
                          &:nth-child(2) {
                            color: #3B9DF9
                          }
                        }
                      };
                      .message-right {
                        flex: 1;
                        display: flex;
                        justify-content: flex-end;
                        >span {
                          display: inline-block;
                          width: 76px;
                          height: 26px;
                          border-radius: 6px;
                          text-align: center;
                          line-height: 26px;
                          font-size: 14px;
                          &:nth-child(1) {
                            color: #fff;
                            background: #3B9DF9;
                            margin-right: 8px;
                          };
                          &:nth-child(2) {
                            color: #3B9DF9;
                            background: #fff;
                            box-sizing: border-box;
                            border: 1px solid #3B9DF9
                          }
                        }
                      }
                    };
                    .backlog-task-list-box {
                        overflow: scroll;
                        flex: 1;
                        .backlog-task-list {
                            padding: 2px 8px 4px 8px;
                            box-sizing: border-box;
                            border-radius: 6px;
                            background: #fff;
                            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.23);
                            margin-bottom: 10px;
                            .list-top {
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              height: 40px;
                              .list-top-left {
                                flex: 1;
                                font-size: 14px;
                                color: #101010;
                                display: flex;
                                align-items: center;
                                img {
                                  width: 40px;
                                  height: 40px;
                                  margin-right: 2px;
                                  margin-left: -6px;
                                };
                                >span {
                                  display: inline-block;
                                  &:nth-child(2) {
                                    margin-right: 8px
                                  };
                                  &:nth-child(3) {
                                    height: 20px;
                                    padding-left: 8px;
                                    line-height: 20px;
                                    border-left: 1px solid #BBBBBB
                                  }
                                }  
                              };
                              .list-top-right {
                                font-size: 16px;
                                color: #E86F50
                              };
                              .noLookupStyle {
                                color: #E8CB51 !important
                              };
                              .underwayStyle {
                                color: #289E8E !important
                              }
                            };
                            .list-center {
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              margin: 8px 0;
                              .list-center-left {
                                flex: 1;
                                font-size: 14px;
                                color: #101010;
                                display: flex;
                                align-items: center;
                                margin-right: 6px;
                                width: 0;
                                >div {
                                  width: 0;
                                  display: flex;
                                  flex: 1;
                                  align-items: center;
                                  >span {
                                    font-weight: bold;
                                    display: inline-block;
                                    &:nth-child(1) {
                                      margin-right: 8px
                                    };
                                    &:nth-child(2) {
                                      flex: 1;
                                      .no-wrap();
                                      height: 20px;
                                      padding-left: 8px;
                                      line-height: 20px;
                                      border-left: 1px solid #BBBBBB
                                    }
                                  }
                                }    
                              };
                              .list-center-right {
                                
                              }
                            };
                            .list-bottom {
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              height: 40px;
                              .list-bottom-left {
                                flex: 1;
                                font-size: 14px;
                                color: #101010;
                                display: flex;
                                align-items: center;
                                >span {
                                  font-weight: bold;
                                  display: inline-block;
                                  color: #fff;
                                  border-radius: 16px;
                                  font-size: 12px;
                                  width: 54px;
                                  height: 25px;
                                  text-align: center;
                                  line-height: 25px;
                                  &:nth-child(1) {
                                    margin-right: 4px;
                                    background: #F2A15F
                                  };
                                };
                                .delay-btn {
                                  margin-right: 4px;
                                  background: #254550
                                };
                                .allocation-btn {
                                  background: #ffb77d
                                };
                                .listBottomLeftStyle {
                                  color: #F2A15F !important;
                                  border: 1px solid #F2A15F;
                                  background: #fff !important;
                                  box-sizing: border-box
                                }  
                              };
                              .list-bottom-right {
                                >span {
                                  font-weight: bold;
                                  display: inline-block;
                                  color: #fff;
                                  border-radius: 10px;
                                  font-size: 14px;
                                  width: 48px;
                                  height: 26px;
                                  text-align: center;
                                  line-height: 26px;
                                  box-sizing: border-box;
                                  border-radius: 2px;
                                  margin-right: 4px
                                };
                                .operate-one {
                                  color: #F2A15F;
                                  border: 1px solid #F2A15F
                                };
                                .operate-two {
                                  color: #174E97;
                                  border: 1px solid #174E97
                                };
                                .operate-three {
                                  color: #254550;
                                  border: 1px solid #254550
                                };
                                .operate-four {
                                  color: #E86F50;
                                  border: 1px solid #E86F50;
                                  margin-right: 0
                                }                   
                              }
                            };
                            .appoint-list-top {
                              padding: 4px 0;
                              .bottom-border-1px(#afafaf);
                              .list-top-left {
                                >span {
                                  font-weight: bold
                                }
                              }
                            };
                            .appoint-list-center {
                              margin-top: 0;
                              flex-direction: column;
                              .center-one-line {
                                display: flex;
                                width: 100%;
                                line-height: 20px;
                                margin-top: 10px;
                                .center-one-line-left {
                                  flex: 1;
                                  word-break: break-all;
                                  margin-right: 6px
                                };
                                .center-one-line-checkItem {

                                };
                                .center-one-line-right {
                                  flex: 1;
                                  word-break: break-all
                                }
                              };
                              .issue-image {
                                display: flex;
                                width: 100%;
                                margin-top: 10px;
                                align-items: center;
                                .issue-image-left {

                                };
                                .issue-image-list {
                                  flex: 1;
                                  display: flex;
                                  flex-flow: row wrap;
                                  margin-left: 6px;
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
                              };
                              .issue-describe {
                                display: flex;
                                width: 100%;
                                margin-top: 10px;
                                >span {
                                    line-height: 20px;
                                    &:nth-child(2) {
                                        flex: 1;
                                        word-break: break-all;
                                    }
                                }
                              }
                            };
                            .appoint-list-bottom {
                              .list-bottom-left {
                                .delay-btn {
                                  background: #254550 !important
                                };
                                .allocation-btn {
                                  background: #ffb77d !important
                                }
                              }
                            }   
                        };
                        .no-more-data {
                            font-size: 12px;
                            color: #BEC7D1;
                            width: 100%;
                            text-align: center;
                            line-height: 30px
                        }
                    }
                }        
            }
        }
    }
  }
}
</style>