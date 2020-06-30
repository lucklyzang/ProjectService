<template>
  <div class="content-wrapper">
    <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <div class="loading">
      <loading :isShow="showLoadingHint" textContent="加载中,请稍候····" textColor="#2895ea"></loading>
    </div>
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon> 
    </HeaderTop>
   <!-- 右边下拉框菜单 -->
    <ul class="left-dropDown" v-show="leftDownShow">
      <li v-for="(item, index) in leftDropdownDataList" :key="index" :class="{liStyle:liIndex == index}" @click="leftLiCLick(index)">{{item}}</li>
    </ul>
    <div class="dispatch-task-title">
      <div class="task-line-one-wrapper">
        <ul class="task-line-one">
          <li :class="{'taskLineOneStyle':taskLlineOneIndex == index}" :key="index" v-for="(item,index) in taskOneList" @click="taskLineOneEvent(item, index)">{{item}}</li>
        </ul>
      </div>
      <div class="status-box" v-show="taskQueryShow == false">
        <p class="task-line-two">
          <span class="state-filter-span">
            状态筛选
          </span>
         </p>
        <p class="status-name-box">
          <span class="status-name-title" @click.stop="statusScreenEvent">{{stateScreenVal}}</span>
          <ul class="status-name" v-show="stateListShow">
            <li class="state-li" :class="{stateListStyle:stateIndex == index}" v-for="(item, index) in stateList" :key="index" @click.stop="stateListEvent(index, item)">{{item}}</li>
          </ul>
        </p>
      </div>
    </div>
    <van-pull-refresh class="wait-handle-box" v-show="waitHandleBox" v-model="isRefresh" @refresh="onRefresh" success-text="刷新成功">
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 0">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList"  :key="`${item}-${index}`">
            <span class="list-status" :class="{'listStatusStyleOne':item.state == 1,'listStyleStatusTwo':item.state == 2}">{{stateTransfer(item.state)}}</span>
            <div class="wait-handle-message">
              <p class="wait-handle-message-top">
                <span>{{item.parentTypeName}}-{{item.taskTypeName}}</span>
                <span>{{item.patientName == "" ? '无' : item.patientName}}-{{item.bedNumber == "" ? '无' : item.bedNumber}}</span>
              </p>
              <p class="wait-handle-message-bottom">
                <span>时间: ({{item.planStartTime}})</span>
                <span>起点: {{item.setOutPlaceName}}</span>
              </p>
            </div>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item)">
              </span>
              <span v-show="!(item.state == '1')" @click.stop="intoTask(item)">
                进入任务
              </span>
               <span v-show="item.state == '1' || item.state == '2'" @click.stop="sendBack(item)">
                退回
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-no-get wait-handle-one" v-show="stateIndex == 1">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList"  :key="`${item}-${index}`">
            <span class="list-status" :class="{'listStatusStyleOne':item.state == 1,'listStyleStatusTwo':item.state == 2}">{{stateTransfer(item.state)}}</span>
            <div class="wait-handle-message">
              <p class="wait-handle-message-top">
                <span>{{item.parentTypeName}}-{{item.taskTypeName}}</span>
                <span>{{item.patientName == "" ? '无' : item.patientName}}-{{item.bedNumber == "" ? '无' : item.bedNumber}}</span>
              </p>
              <p class="wait-handle-message-bottom">
                <span>时间: ({{item.planStartTime}})</span>
                <span>起点: {{item.setOutPlaceName}}</span>
              </p>
            </div>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item)">
              </span>
              <span v-show="!(item.state == '1')" @click.stop="intoTask(item)">
                进入任务
              </span>
               <span v-show="item.state == '1' || item.state == '2'" @click.stop="sendBack(item)">
                退回
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-get wait-handle-one" v-show="stateIndex == 2">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`">
            <span class="list-status" :class="{'listStatusStyleOne':item.state == 1,'listStyleStatusTwo':item.state == 2}">{{stateTransfer(item.state)}}</span>
            <div class="wait-handle-message">
              <p class="wait-handle-message-top">
                <span>{{item.parentTypeName}}-{{item.taskTypeName}}</span>
                <span>{{item.patientName == "" ? '无' : item.patientName}}-{{item.bedNumber == "" ? '无' : item.bedNumber}}</span>
              </p>
              <p class="wait-handle-message-bottom">
                <span>时间: ({{item.planStartTime}})</span>
                <span>起点: {{item.setOutPlaceName}}</span>
              </p>
            </div>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item)">
              </span>
              <span v-show="!(item.state == '1')" @click.stop="intoTask(item)">
                进入任务
              </span>
               <span v-show="item.state == '1' || item.state == '2'" @click.stop="sendBack(item)">
                退回
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-going wait-handle-one" v-show="stateIndex == 3">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList"  :key="`${item}-${index}`">
            <span class="list-status" :class="{'listStatusStyleOne':item.state == 1,'listStyleStatusTwo':item.state == 2}">{{stateTransfer(item.state)}}</span>
            <div class="wait-handle-message">
              <p class="wait-handle-message-top">
                <span>{{item.parentTypeName}}-{{item.taskTypeName}}</span>
                <span>{{item.patientName == "" ? '无' : item.patientName}}-{{item.bedNumber == "" ? '无' : item.bedNumber}}</span>
              </p>
              <p class="wait-handle-message-bottom">
                <span>时间: ({{item.planStartTime}})</span>
                <span>起点: {{item.setOutPlaceName}}</span>
              </p>
            </div>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item)">
              </span>
              <span v-show="!(item.state == '1')" @click.stop="intoTask(item)">
                进入任务
              </span>
               <span v-show="item.state == '1' || item.state == '2'" @click.stop="sendBack(item)">
                退回
              </span>
            </p>
          </div>
        </div>
      </div>
    </van-pull-refresh>
    <div class="task-query wait-handle task-complete" v-show="taskQueryShow">
      <div class="content-middle-top">
        <span class="time-between">至</span>
        <div class="content-middle-top-content">
          <div style="left:0">
            <van-field v-model="startTime" placeholder="开始日期" readonly="readonly" @click="startTimePop = true" right-icon="newspaper-o"/>
          </div>
          <div style="right:0">
            <van-field v-model="endTime" placeholder="结束日期" readonly="readonly" @click="endTimePop = true" right-icon="newspaper-o"/>
          </div>
        </div>
        <van-popup v-model="startTimePop" label="离开时间" position="bottom" :overlay="true"> 
          <van-datetime-picker  v-model="currentDateStart"  type="date"  :min-date="minDateStart"
          @cancel="startTimePop = false"  @confirm="startTimePop = false"  @change="startTimeChange"/>
        </van-popup>
        <van-popup v-model="endTimePop" label="离开时间" position="bottom" :overlay="true"> 
          <van-datetime-picker  v-model="currentDateEnd"  type="date"  :min-date="minDateEnd"
          @cancel="endTimePop = false"  @confirm="endTimePop = false"  @change="endTimeChange"/>
        </van-popup>
      </div>
      <p class="middle-top-search">
        <span>
          <img :src="taskSearchPng" alt="" @click.stop="searchCompleteTask">
        </span>
      </p>
      <div class="task-status-list">
        <div class="wait-handle-list" v-for="(item,index) in stateCompleteList"  :key="`${item}-${index}`">
          <span class="list-status" :class="{'listStatusStyleOne':item.state == 1,'listStyleStatusTwo':item.state == 2}">{{stateTransfer(item.state)}}</span>
          <div class="wait-handle-message">
            <p class="wait-handle-message-top">
              <span>{{item.parentTypeName}}-{{item.taskTypeName}}</span>
              <span>{{item.patientName == "" ? '无' : item.patientName}}-{{item.bedNumber == "" ? '无' : item.bedNumber}}</span>
            </p>
            <p class="wait-handle-message-bottom">
              <span>时间: ({{item.planStartTime}})</span>
              <span>起点: {{item.setOutPlaceName}}</span>
            </p>
          </div>
          <p class="get-wait-task">
           <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item)">
              </span>
              <span v-show="!(item.state == '1')" @click.stop="intoTask(item)">
                进入任务
              </span>
               <span v-show="item.state == '1' || item.state == '2'" @click.stop="sendBack(item)">
                退回
              </span>
            </p>
        </div>
      </div>
    </div>
    <van-dialog v-model="toolShow" title="请选择退回原因" show-cancel-button width="92%"
          @confirm="toolSure" @cancel="toolCancel"
        >
          <div class="tool-name-list">
            <div class="tool-name-list-title-innner">退回原因:</div>
            <div class="tool-name-list-content">
              <span :class="{spanStyle:toolIndex === index}" v-for="(item,index) in vehicleOperationList" :key="`${item}-${index}`" @click="toolCheck(item,index)">
                {{item.text}}
              </span>
            </div>
          </div>
    </van-dialog>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import {getDispatchTaskMessage, getDispatchTaskComplete, querySendBackDispatchTaskReason, updateDispatchTask, userSignOut, sendBackDispatchTask} from '@/api/workerPort.js'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import { mapGetters, mapMutations } from 'vuex'
  import store from '@/store'
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  export default {
    name: 'dispatchTask',
    data () {
      return {
        value:0,
        taskId: '',
        showLoadingHint: false,
        noDataShow: false,
        stateListShow: false,
        stateIndex: 0,
        stateList: ['全部','未获取','已获取', '进行中'],
        stateScreenVal: '全部',
        startTime: '',
        endTime: '',
        toolIndex: '',
        toolText: '',
        toolShow: false,
        toolName: '',
        toolValue: '',
        vehicleOperationList: [],
        startTimePop: false,
        endTimePop: false,
        currentDateStart: new Date(),
        currentDateEnd: new Date(),
        minDateStart: new Date(2020, 0, 1),
        minDateEnd: new Date(2020, 0, 1),
        stateFilterList: [],
        leftDropdownDataList: ['退出登录'],
        leftDownShow: false,
        liIndex: null,
        taskOneList: ['待办任务', '历史任务'],
        taskLlineOneIndex: '0',
        checkPerson: 0,
        stateCompleteList: [],
        cancelTaskIdList : [],
        transferTaskIdList : [],
        cancelTask: false,
        transferTask: false,
        taskQueryShow: false,
        waitHandleCheck: true,
        waitHandleBox: true,
        isRefresh: false,
        waitBaskList: [],
        taskGetPng: require('@/components/images/task-get.png'),
        taskSearchPng: require('@/components/images/task-search.png')
      };
    },

    components: {
      HeaderTop,
      NoData,
      Loading,
      FooterBottom
    },

    computed: {
      ...mapGetters([
        'navTopTitle',
        'isRefershDispatchTaskPage',
        'userInfo',
        'globalTimer',
        'isFreshDispatchTaskPage',
        'catch_components'
      ]),
      proId () {
        return this.userInfo.extendData.proId
      },
      workerId () {
        return JSON.parse(getStore('userInfo')).extendData.userId
      }
    },

    watch : {
    },

    beforeRouteEnter (to, from, next){
      let catch_components = store.state.catchComponent.catch_components;
      let i = catch_components.indexOf('dispatchTask');
      i === -1 && catch_components.push('dispatchTask');
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'dispatchDetails'){
        let i = catch_components.indexOf('dispatchTask');
        i > -1 && this.changeCatchComponent([]);
      }
      next()
   },

    mounted () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        let that = this;
        pushHistory();
        that.gotoURL(() => {
          pushHistory();
          this.$router.push({path: 'home'});
          this.changeTitleTxt({tit:'中央运送'});
          setStore('currentTitle','中央运送') 
        })
      };
      document.addEventListener('click', (e) => {
        if(e.target.className!='status-name'){
          this.stateListShow = false;
        };
        if(e.target.className!='van-icon van-icon-manager-o' && e.target.className!='left-dropDown'){
          this.leftDownShow = false;
        }
      });
      // 查询调度任务(分配给自己的)
      this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex)
      
    },

    activated () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        let that = this;
        pushHistory();
        that.gotoURL(() => {
          pushHistory();
          this.$router.push({path: 'home'});
          this.changeTitleTxt({tit:'中央运送'});
          setStore('currentTitle','中央运送') 
        })
      };
      document.addEventListener('click', (e) => {
        if(e.target.className!='status-name'){
          this.stateListShow = false;
        };
        if(e.target.className!='van-icon van-icon-manager-o' && e.target.className!='left-dropDown'){
          this.leftDownShow = false;
        }
      });
      // 查询调度任务(分配给自己的)
      if (this.isFreshDispatchTaskPage) {
        this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, 0)
      }
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeDispatchTaskMessage',
        'changedispatchTaskTransferIdList',
        'changedispatchTaskCancelIdList',
        'changeDispatchTaskDepartmentType',
        'changeDispatchTaskState',
        'changeIsCoerceTakePhoto',
        'changeIsBack',
        'changeIsSign',
        'changeIsSingleDestination',
        'changeTaskDetailsMessage',
        'changeTaskType',
        'changeOverDueWay',
        'changeDispatchTaskId',
        'changeCatchComponent'
      ]),

      startTimeChange(e) { 
        let startTimeArr = e.getValues();//["2019", "03", "22", "17", "28"] 
        this.startTime = `${startTimeArr[0]}-${startTimeArr[1]}-${startTimeArr[2]}`
      },

      endTimeChange(e) {
        let endTimeArr = e.getValues();//["2019", "03", "22", "17", "28"] 
        this.endTime = `${endTimeArr[0]}-${endTimeArr[1]}-${endTimeArr[2]}`
      },

      // 初始化时间显示框
      initDate () {
        let currentDateList = formatTime('YYYY-MM-DD').split('-');
        this.startTime = `${currentDateList[0]}-${currentDateList[1]}-${currentDateList[2]}`;
        this.endTime = `${currentDateList[0]}-${currentDateList[1]}-${currentDateList[2]}`
      },

      // 搜索完成的任务
      searchCompleteTask () {
        this.queryCompleteDispatchTask({proId:this.proId, workerId:this.workerId,state:7, startDate: this.startTime, endDate: this.endTime})
      },

    // 查询调度任务(状态筛选点击专用)  
      queryStateFilterDispatchTask (proID, workerId, index) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        getDispatchTaskMessage (proID, workerId)
        .then((res) => {
          this.showLoadingHint = false;
          this.noDataShow = false;
          let temporaryTaskListFirst = [];
          this.stateFilterList = [];
          if (res && res.data.code == 200) {
            this.isRefresh = false;
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                temporaryTaskListFirst.push({
                  createTime: item.createTime,
                  planUseTime: item.planUseTime,
                  planStartTime: item.planStartTime,
                  state: item.state,
                  setOutPlaceName: item.setOutPlaceName,
                  setOutPlaceId: item.setOutPlaceId,
                  parentTypeName: item.parentTypeName,
                  destinationName: item.destinationName,
                  destinationId: item.destinationId,
                  taskTypeName: item.taskTypeName,
                  toolName: item.toolName,
                  priority: item.priority,
                  id: item.id,
                  patientName: item.patientName,
                  bedNumber: item.bedNumber,
                  startPhoto: item.startPhoto,
                  endPhoto: item.endPhoto,
                  isBack: item.isBack,
                  isSign: item.isSign,
                  number: item.number,
                  actualCount: item.actualCount,
                  distName: item.distName,
                  hasSanOut: item.hasSanOut
                });
              };
              if (index == 0) {
                this.stateFilterList = temporaryTaskListFirst;
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                }
              } else if (index == 1) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 1});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                }
              } else if (index == 2) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 2});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                }
              } else if (index == 3) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 3});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                }
              }
               console.log(this.stateFilterList);
            } else {
              this.noDataShow = true;
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
              this.noDataShow = true;
            });
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
            this.noDataShow = true;
          });
          this.showLoadingHint = false;
        })
      },

      // 下拉刷新
      onRefresh () {
        this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex)
      },

      // 查询调度任务(已完成)
      queryCompleteDispatchTask (data) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        getDispatchTaskComplete(data).then((res) => {
          this.showLoadingHint = false;
          this.stateCompleteList = [];
          if (res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.noDataShow = false;
              for (let item of res.data.data) {
                this.stateCompleteList.push({
                  createTime: item.createTime,
                  planUseTime: item.planUseTime,
                  planStartTime: item.planStartTime,
                  state: item.state,
                  setOutPlaceName: item.setOutPlaceName,
                  destinationName: item.destinationName,
                  taskTypeName: item.taskTypeName,
                  toolName: item.toolName,
                  priority: item.priority,
                  id: item.id,
                  parentTypeName: item.parentTypeName,
                  finishTime: item.finishTime,
                  patientName: item.patientName,
                  bedNumber: item.bedNumber,
                  startPhoto: item.startPhoto,
                  endPhoto: item.endPhoto,
                  isBack: item.isBack,
                  isSign: item.isSign,
                  number: item.number,
                  actualCount: item.actualCount,
                  distName: item.distName
                })
              };
              console.log('完成',this.stateCompleteList);
            } else {
              this.noDataShow = true;
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
              this.noDataShow = true;
            });
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
            this.noDataShow = true;
          });
          this.showLoadingHint = false;
        })
      },

      // 用户签退
      userLoginOut (proId,workerId) {
        this.changeOverDueWay(true);
        setStore('storeOverDueWay',true);
        userSignOut(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            if(this.globalTimer) {window.clearInterval(this.globalTimer)};
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

      // 任务状态转换
      stateTransfer (index) {
        switch(index) {
          case 0 :
            return '未分配'
            break;
          case 1 :
            return '待确认'
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


      // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        this.userLoginOut(this.proId, this.userInfo.userName)
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

      // 返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'中央运送'});
        setStore('currentTitle','中央运送')
      },

      // 调度任务第一行按钮点击
      taskLineOneEvent (item,index) {
        this.taskLlineOneIndex = index;
        this.stateListShow = false;
        this.transferTask = false;
        this.cancelTask = false;
        this.noDataShow = false;
        if (index == '0') {
          this.stateIndex = 0;
          this.stateScreenVal = '全部';
          this.waitHandleBox = true;
          this.taskQueryShow = false;
          this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex)
        } else if (index == '1') {
          this.stateIndex = null;
          this.taskQueryShow = true;
          this.waitHandleBox = false;
          this.initDate();
          this.queryCompleteDispatchTask({proId:this.proId, workerId:this.workerId,state:7, startDate: this.startTime, endDate: this.endTime})
        }
      },

      // 状态筛选列表点击
      stateListEvent (index, item) {
        this.stateIndex = index;
        this.stateScreenVal = item;
        this.queryStateFilterDispatchTask(this.proId, this.workerId, index)
      },

      // 退回接口
      sendBack (item) {
        this.taskId = item.id;
        this.toolShow = true;
        querySendBackDispatchTaskReason(this.proId)
        .then((res) => {
          this.vehicleOperationList = [];
          if (res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                this.vehicleOperationList.push({
                  text: item.name,
                  value: item.code
                })
              }
            } else {
              this.$toast('没有查到退回原因');
            }
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
        });
        this.toolIndex = ''
      },

      // 退回原因选中点击事件
      toolCheck (item, index) {
        this.toolIndex = index;
        this.toolText = item.text;
        this.toolName = item.text
        this.toolValue = item.value
      },

      // 退回原因弹框确认事件
      toolSure () {
        if (this.toolIndex === '') {
          this.$toast('请选择退回原因');
          return
        };
        sendBackDispatchTask(this.proId,this.taskId,this.toolText)
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex)
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

      // 退回原因取消事件
      toolCancel () {
        this.toolIndex = '';
        this.toolName = '';
        this.toolShow = false
      },

      // 状态筛选按钮点击
      statusScreenEvent () {
        this.taskQueryShow = false;
        this.stateListShow = !this.stateListShow;
        if (this.stateScreenVal == '状态筛选') {
          this.queryStateFilterDispatchTask(this.proId, this.workerId, 0);
          this.stateIndex = 0;
        }
      },

      // 点击具体任务事件
      intoTask (item) {
        if (item.state !== 1 && item.state !== 7) {
          //是否需要返回出发地
          this.changeIsBack(item.isBack);
          //是否需要签字
          this.changeIsSign(item.isSign);
          //判断是否为单一目的地
          if (item.destinationName == "") {
            this.changeIsSingleDestination(false)
          } else {
            this.changeIsSingleDestination(true)
          };
        };
        //储存任务id状态
        this.changeDispatchTaskId(item.id);
        this.$router.push({'path':'/dispatchDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情');
        // 改变调度具体某一任务的信息状态
        this.changeDispatchTaskMessage({DtMsg: item});
        setStore('currentDispatchTaskMessage',item);
      },

      // 获取待处理任务事件
      getTask (item) {
        updateDispatchTask({
          proId: this.proId,//当前项目ID
          id: item.id, //当前任务ID
          state: 2 //更新后的状态
        })
        .then(res => {
          if (res && res.data.code == 200) {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
            this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex)
          }
        })
        .catch(err => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
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
    /deep/ .van-dialog {
      .van-dialog__content {
        margin-bottom: 6px;
        height: 200px;
        margin: 10px 0;
        .tool-name-list {
          width: 94%;
          height: 100%;
          overflow: auto;
          margin: 0 auto;
          padding: 0;
          border: 1px solid #b2b2b2;
          .tool-name-list-title-innner {
            padding: 10px;
          }
          .tool-name-list-content {
            padding: 6px;
            .spanStyle {
              color: #fff;
              background: #2895ea
            }
            span {
              display: inline-block;
              width: 48%;
              height: 40px;
              text-align: center;
              margin-bottom: 8px;
              line-height: 40px;
              background: #f3f3f3;
              margin-right: 4%;
              &:nth-child(even) {
                margin-right: 0
              }
            }
          }
        }
      }
    };
    .content-wrapper();
    position: relative;
    font-size: 14px;
    .no-data {
      position: absolute;
      top: 200px;
      left: 0;
      width: 100%;
      text-align: center;
    }
    .loading {
      position: absolute;
      top: 260px;
      left: 0;
      width: 100%;
      height: 50px;
      text-align: center;
    };
    .left-dropDown {
      .rightDropDown
    }
    .dispatch-task-title {
        .task-line-one-wrapper {
          font-size: 17px;
          height: 36px;
          background-image: linear-gradient(to bottom, #2895ea, #5173f8);
        .task-line-one {
          width: 70%;
          margin: 0 auto;
          .taskLineOneStyle {
            color: #2895ea;
            background: #ffff;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px
          }
          li {
            display: inline-block;
            margin-top: 1px;
            color: #fff;
            width: 46%;
            height: 36px;
            line-height: 36px;
            text-align: center
          }
        };
      }
      .status-box {
        position: relative;
        width: 100%;
        margin-top: 6px;
        height: 40px;
        background: #f6f6f6;
        .task-line-two {
          height: 40px;
          font-size: 0;
          box-sizing: border-box;
          color: #000000;
          position: absolute;
          top: 0;
          left: 7px;
          span {
            font-size: 18px;
            height: 40px;
            display: inline-block;
            text-align: center;
            line-height: 40px;
            border-right: 1px solid #dedada;
            &:last-child {
              border-right: none
            }
          }
        }
        .status-name-box {
          position: absolute;
          width: 100px;
          top: 0;
          right: 0;
          font-size: 18px;
          .status-name-title {
            width: 100%;
            color: #3996f3;
            background: #fff;
            height: 40px;
            line-height: 40px;
            text-align: center;
            display: inline-block;
          }
          .status-name {
            position: absolute;
            top: 40px;
            left: 0;
            z-index: 1000;
            box-shadow: 0 1px 6px 2px #d1d1d1;
            width: 100%;
            background: #fff;
            li {
              width: 100%;
              line-height: 40px;
              text-align: center
            }
            .stateListStyle {
              color: #fff;
              background: #2895ea
            }
          }
        }
      }
      .task-operate-box {
        height: 40px;
        line-height: 30px;
        padding-left: 10px;
        span {
          font-size: 13px;
          display: inline-block;
          margin-top: 5px;
          width: 70px;
          height: 30px;
          color: #fff;
          background: #2895ea;
          text-align: center;
          border-radius: 2px
        }
      }
    };
    .wait-handle-box {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .wait-handle-one {
        .wait-handle-list {
          box-sizing: border-box;
          position: relative;
          border: 1px solid #cecece;
          width: 96%;
          margin:0 auto;
          margin-top: 6px;
          height: 200px;
          padding-left: 8px;
          box-sizing: border-box;
          .list-status {
            position: absolute;
            top: 0;
            right: 0;
            display: inline-block;
            width: 80px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            border-bottom: 1px solid #cecece;
            border-left: 1px solid #cecece;
          }
          .listStatusStyleOne {
            color: red
          }
          .listStyleStatusTwo {
            color: #85dc85
          }
          .wait-handle-message {
            font-size: 18px;
            padding: 14px 0;
            box-sizing: border-box;
            .wait-handle-message-top {
              height: 50px;
              border-left: 6px solid #2895ea;
              span {
                display: inline-block;
                width: 75%;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
            .wait-handle-message-bottom {
              height: 50px;
              margin-top: 8px;
              margin-left: -4px;
              span {
                display: block;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
          };
          .get-wait-task {
            margin-top: 4px;
            width: 100%;
            text-align: center;
            span {
              vertical-align: top;
              display: inline-block;
              width: 110px;
              line-height: 40px;
              height: 40px;
              margin-right: 4px;
              img {
                width: 100%;
                height: 100%
              };
              &:nth-child(2) {
                color: #fff;
                font-size: 13px;
                background: #2895ea;
                text-align: center;
                border-radius: 4px
              }
              &:last-child {
                margin-right: 0;
                color: #fff;
                font-size: 13px;
                background: #cccccc;
                text-align: center;
                border-radius: 4px
              }
            }
          }
        }
      };
    };
    .wait-handle, .task-query, .status-handle-screen {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
    };
    .wait-handle {
      .wait-handle-list {
        box-sizing: border-box;
        position: relative;
        border: 1px solid #cecece;
        width: 96%;
        margin:0 auto;
        height: 200px;
        margin-top: 6px;
        padding-left: 8px;
        box-sizing: border-box;
        .list-status {
          position: absolute;
          top: 0;
          right: 0;
          display: inline-block;
          width: 80px;
          text-align: center;
          height: 30px;
          line-height: 30px;
          border-bottom: 1px solid #cecece;
          border-left: 1px solid #cecece;
        };
        .listStatusStyleOne {
          color: red
        }
        .listStyleStatusTwo {
          color: #85dc85
        }
       .wait-handle-message {
            font-size: 18px;
            padding: 14px 0;
            box-sizing: border-box;
            .wait-handle-message-top {
              height: 50px;
              border-left: 6px solid #2895ea;
              span {
                display: inline-block;
                width: 75%;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
            .wait-handle-message-bottom {
              height: 50px;
              margin-top: 8px;
              margin-left: -4px;
              span {
                display: block;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
          };
        .get-wait-task {
          margin-top: 4px;
          width: 100%;
          text-align: center;
          span {
            vertical-align: top;
            display: inline-block;
            width: 110px;
            line-height: 40px;
            height: 40px;
            margin-right: 4px;
            img {
              width: 100%;
              height: 100%
            };
            &:nth-child(2) {
              color: #fff;
              font-size: 13px;
              background: #2895ea;
              text-align: center;
              border-radius: 4px
            }
            &:last-child {
              margin-right: 0;
              color: #fff;
              font-size: 13px;
              background: #cccccc;
              text-align: center;
              border-radius: 4px
            }
          }
        }
      }
    };
    .task-complete {
      display: flex;
      flex-direction: column;
      .middle-top-search {
        width: auto;
        margin: 0 auto;
        line-height: 30px;
        height: 40px;
        span {
          display: inline-block;
          width: 90px;
          height: 40px;
          img {
            width: 100%;
            height: 100%
          }
        }
      }
      .content-middle-top {
        background: #fff;
        margin-top: 3%;
        height: 52px;
        position: relative;
        box-shadow: 0px 1px 3px 1px #e4e4e4,  /*下边阴影*/
        0px -1px 3px 0px #e4e4e4;   /*上边阴影*/
        /deep/ .van-cell {
          width: 100%;
          display: inline-block;
          padding: 10px 24px;
          border: 1px solid #d8d5d5;
          border-radius: 4px;
          line-height: 0;
        }
        .time-between {
          color: black;
          position: absolute;
        }
        .content-middle-top-content {
          position: relative;
          height: 100%;
          width: 98%;
          margin: 0 auto;
          > div {
            width: 44%;
            position: absolute;
            top: 14%;
          }
        }
      };
      .task-status-list {
        flex: 1;
        overflow: auto
      }
    }
    .status-handle-screen {
       .wait-handle-list {
          box-sizing: border-box;
          position: relative;
          border: 1px solid #cecece;
          width: 96%;
          margin:0 auto;
          height: 200px;
          margin-top: 6px;
          padding-left: 8px;
          box-sizing: border-box;
      .list-status {
          position: absolute;
          top: 0;
          right: 0;
          display: inline-block;
          width: 80px;
          text-align: center;
          height: 30px;
          line-height: 30px;
          border-bottom: 1px solid #cecece;
          border-left: 1px solid #cecece;
        };
        .listStatusStyleOne {
          color: red
        }
        .listStyleStatusTwo {
          color: #85dc85
        }
       .wait-handle-message {
            font-size: 18px;
            padding: 14px 0;
            box-sizing: border-box;
            .wait-handle-message-top {
              height: 50px;
              border-left: 6px solid #2895ea;
              span {
                display: inline-block;
                width: 75%;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
            .wait-handle-message-bottom {
              height: 50px;
              margin-top: 8px;
              margin-left: -4px;
              span {
                display: block;
                padding-left: 5px;
                box-sizing: border-box;
                &:first-child {
                  margin-bottom: 15px
                }
              }
            }
          };
        .get-wait-task {
          margin-top: 4px;
          width: 100%;
          text-align: center;
          span {
            vertical-align: top;
            display: inline-block;
            width: 110px;
            line-height: 40px;
            height: 40px;
            margin-right: 4px;
            img {
              width: 100%;
              height: 100%
            };
            &:nth-child(2) {
              color: #fff;
              font-size: 13px;
              background: #2895ea;
              text-align: center;
              border-radius: 4px
            }
            &:last-child {
              margin-right: 0;
              color: #fff;
              font-size: 13px;
              background: #cccccc;
              text-align: center;
              border-radius: 4px
            }
          }
        }
      }
    }
    .status-handle-screen {
      /deep/ .van-tabs {
        .right-sign {
          .status-sign 
        }
      }
    }
  }
</style>