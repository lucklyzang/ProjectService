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
      <div class="task-operate-box" v-show="cancelTaskBtnShow || transferTaskBtnShow">
        <span v-show="cancelTaskBtnShow" @click="cancelTaskEvent">取消任务</span>
        <span v-show="transferTaskBtnShow" @click="transferTaskEvent">转移任务</span>
      </div>
    </div>
    <van-pull-refresh v-model="isRefresh" class="wait-handle-box" @refresh="onRefresh" v-show="waitHandleBox" success-text="刷新成功">
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 0">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
            <p class="wait-handle-message-createTime">
              开始时间：{{item.createTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">预约名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <P>
                  <span class="message-tit">起点:</span>
                  <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务目的地:</span>
                  <span :class="{destinationRealStyle: drawCompleteTaskIdList.indexOf(item.id) != -1 && innerItem.check == true}" v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
                </p>
                <P>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">病人姓名:</span>
                  <span class="message-tit-real">{{item.patientName}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real">{{item.bedNumber}}</span>
                </p>
              </div>
            </div>
            <p class="wait-handle-check" v-show="item.state == 2">
              <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
            </p>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 1">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
            <p class="wait-handle-message-createTime">
              开始时间：{{item.createTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">预约名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <P>
                  <span class="message-tit">起点:</span>
                  <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务目的地:</span>
                  <span :class="{destinationRealStyle: drawCompleteTaskIdList.indexOf(item.id) != -1 && innerItem.check == true}" v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
                </p>
                <P>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">病人姓名:</span>
                <span class="message-tit-real">{{item.patientName}}</span>
              </p>
              <p>
                <span class="message-tit">床号:</span>
                <span class="message-tit-real">{{item.bedNumber}}</span>
              </p>
            </div>
            </div>
            <p class="wait-handle-check" v-show="item.state == 2">
              <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
            </p>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 2">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
            <p class="wait-handle-message-createTime">
              开始时间：{{item.createTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">预约名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <P>
                  <span class="message-tit">起点:</span>
                  <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务目的地:</span>
                  <span :class="{destinationRealStyle: drawCompleteTaskIdList.indexOf(item.id) != -1 && innerItem.check == true}" v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
                </p>
                <P>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">病人姓名:</span>
                <span class="message-tit-real">{{item.patientName}}</span>
              </p>
              <p>
                <span class="message-tit">床号:</span>
                <span class="message-tit-real">{{item.bedNumber}}</span>
              </p>
            </div>
            </div>
            <p class="wait-handle-check" v-show="item.state == 2">
              <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
            </p>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 3">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
            <p class="wait-handle-message-createTime">
              开始时间：{{item.createTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">预约名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <P>
                  <span class="message-tit">起点:</span>
                  <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务目的地:</span>
                  <span :class="{destinationRealStyle: drawCompleteTaskIdList.indexOf(item.id) != -1 && innerItem.check == true}" v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
                </p>
                <P>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">病人姓名:</span>
                <span class="message-tit-real">{{item.patientName}}</span>
              </p>
              <p>
                <span class="message-tit">床号:</span>
                <span class="message-tit-real">{{item.bedNumber}}</span>
              </p>
            </div>
            </div>
            <p class="wait-handle-check" v-show="item.state == 2">
              <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
            </p>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="state-filter-all wait-handle-one" v-show="stateIndex == 4">
        <div class="task-status-list">
          <div class="wait-handle-list" v-for="(item,index) in stateFilterList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
            <p class="wait-handle-message-createTime">
              开始时间：{{item.createTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">预约名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <P>
                  <span class="message-tit">起点:</span>
                  <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务目的地:</span>
                  <span :class="{destinationRealStyle: drawCompleteTaskIdList.indexOf(item.id) != -1 && innerItem.check == true}" v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
                </p>
                <P>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
                </P>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">病人姓名:</span>
                  <span class="message-tit-real">{{item.patientName}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real">{{item.bedNumber}}</span>
                </p>
              </div>
            </div>
            <p class="wait-handle-check" v-show="item.state == 2">
              <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
            </p>
            <p class="get-wait-task">
              <span v-show="item.state == '1'">
                <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
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
        <div class="wait-handle-list" v-for="(item,index) in stateCompleteList" :key="`${item}-${index}`" @click="taskClickEvent(item)">
          <p class="wait-handle-message-createTime">
            开始时间：{{item.createTime}}
          </p>
          <div class="wait-handle-message">
            <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">预约名称:</span>
                <span class="message-tit-real">{{item.taskTypeName}}</span>
              </p>
              <P>
                <span class="message-tit">起点:</span>
                <span class="message-tit-real message-tit-real-style">{{item.setOutPlaceName}}</span>
              </P>
            </div>
            <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">任务目的地:</span>
                <span v-for="(innerItem, index) in item.spaces" :key="index" class="message-tit-real message-tit-destination-real message-tit-real-style">{{innerItem.text}}</span>
              </p>
              <p>
                <span class="message-tit">床号:</span>
                <span class="message-tit-real message-tit-real-bdeNumber message-tit-real-style">{{item.bedNumber}}</span>
              </p>
            </div>
            <div class="handle-message-line-wrapper">
              <p>
                <span class="message-tit">优先级:</span>
                <span class="message-tit-real message-tit-real-style">{{priorityTransfer(item.priority)}}</span>
              </p>
              <P>
                <span class="message-tit">状态:</span>
                <span class="message-tit-real" style="color:red">{{ stateTransfer(item.state) }}</span>
              </P>
            </div>
            <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">病人姓名:</span>
                  <span class="message-tit-real">{{item.patientName}}</span>
                </p>
                <p>
                  <span class="message-tit">床号:</span>
                  <span class="message-tit-real">{{item.bedNumber}}</span>
                </p>
              </div>
          </div>
          <p class="wait-handle-check" v-show="item.state == 2">
            <van-checkbox v-model="item.taskCheck"  @click.stop.native="emptyHandle" @change="waitTaskChecked(item.taskCheck)"></van-checkbox>
          </p>
          <p class="get-wait-task">
            <span v-show="item.state == '1'">
              <img :src="taskGetPng" alt="" @click.stop="getTask(item.id)">
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import {queryAppointTaskMessage, updateAppointTaskMessage, cancelAppointTask, getAppointTaskComplete, userSignOut} from '@/api/workerPort.js'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, removeBlock, removeAllLocalStorage } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  export default {
    name: 'appointTask',
    data () {
      return {
        showLoadingHint: false,
        noDataShow: false,
        stateIndex: 0,
        taskQueryShow: false,
        leftDropdownDataList: ['退出登录'],
        stateListShow: false,
        stateScreenVal: '全部',
        leftDownShow: false,
        stateList:['全部','未获取','已获取', '进行中', '未结束'],
        startTime: '',
        endTime: '',
        startTimePop: false,
        endTimePop: false,
        currentDateStart: new Date(),
        currentDateEnd: new Date(),
        minDateStart: new Date(2020, 0, 1),
        minDateEnd: new Date(2020, 0, 1),
        liIndex: null,
        transferWorkerShow: false,
        taskOneList: ['待办任务', '历史任务'],
        taskLlineOneIndex: '0',
        cancelTask: false,
        transferTask: false,
        waitHandleCheck: true,
        cancelTaskBtnShow: false,
        transferTaskBtnShow: false,
        isRefresh: false,
        waitHandleBox: true,
        stateFilterList: [],
        stateCompleteList: [],
        waitBaskList: [],
        screenTaskList: [],
        cancelTaskIdList: [],
        transferTaskIdList: [],
        drawCompleteTaskIdList: [],
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
        'userInfo',
        'completeSweepcodeDestinationInfo',
        'globalTimer'
      ]),
      proId () {
        return JSON.parse(getStore('userInfo')).extendData.proId
      },
      workerId () {
        return JSON.parse(getStore('userInfo')).extendData.userId
      }
    },

    watch : {
      waitBaskList: {
        handler(newName, oldName) {
          if (newName.some(function (item, index) {return item.taskCheck == true})) {
            this.cancelTaskBtnShow = true;
            this.transferTaskBtnShow = true;
          } else {
            this.cancelTaskBtnShow = false;
            this.transferTaskBtnShow = false;
          }
        },
        deep: true,
        immediate: true
      },
      stateFilterList: {
        handler(newName, oldName) {
          if (newName.some(function (item, index) {return item.taskCheck == true})) {
            this.cancelTaskBtnShow = true;
            this.transferTaskBtnShow = true;
          } else {
            this.cancelTaskBtnShow = false;
            this.transferTaskBtnShow = false;
          }
        },
        deep: true,
        immediate: true
      }
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
      document.addEventListener('click',(e) => {
        if(e.target.className!='status-name'){
          this.stateListShow = false;
        };
        if(e.target.className!='van-icon van-icon-manager-o' && e.target.className!='left-dropDown'){
          this.leftDownShow = false;
        }
      });
      // 查询预约任务(分配给自己的)
      this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex);
      this.drawTaskId()
    },

    // activated () {
    //  // 控制设备物理返回按键测试
    //   if (!IsPC()) {
    //     let that = this;
    //     pushHistory();
    //     that.gotoURL(() => {
    //       pushHistory();
    //       this.$router.push({path: 'home'});
    //       this.changeTitleTxt({tit:'中央运送'});
    //       setStore('currentTitle','中央运送') 
    //     })
    //   };
    //   document.addEventListener('click',(e) => {
    //     if(e.target.className!='status-name'){
    //       this.stateListShow = false;
    //     };
    //     if(e.target.className!='van-icon van-icon-manager-o' && e.target.className!='left-dropDown'){
    //       this.leftDownShow = false;
    //     }
    //   });
    //   // 查询预约任务(分配给自己的)
    //   this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex);
    //   this.drawTaskId()
    // },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeAppointTaskMessage',
        'changeAppointTaskTransferIdList',
        'changeAppoinTaskCancelIdList',
        'changeAppointSweepCodeNumber',
        'changeAppointSweepCodeIntoPage',
        'changeAppointTaskDepartmentType',
        'changeAppointTaskState',
        'changeSurplusDestinationList',
        'changeTaskDetailsMessage',
        'changeTaskType',
        'changeOverDueWay',
        'changeCatchComponent'
      ]),

      // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        this.userLoginOut(this.proId, this.userInfo.userName)
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

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

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

      // 查询预约任务(状态筛选点击专用)  
      queryStateFilterDispatchTask (proID, workerId, index) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        queryAppointTaskMessage (proID, workerId)
        .then((res) => {
          this.showLoadingHint = false;
          let temporaryTaskListFirst = [];
          this.stateFilterList = [];
          if (res && res.data.code == 200) {
            this.isRefresh = false;
            if (res.data.data.length > 0) {
              this.noDataShow = false;
              for (let item of res.data.data) {
                temporaryTaskListFirst.push({
                  taskCheck: false,
                  createTime: item.createTime,
                  state: item.state,
                  setOutPlaceId: item.setOutPlaceId,
                  setOutPlaceName: item.setOutPlaceName,
                  destinationName: item.destinationName,
                  destinationId: item.destinationId,
                  taskTypeName: item.taskName,
                  toolName: item.toolName,
                  id: item.id,
                  patientName: item.patientName,
                  bedNumber: item.bedNumber,
                  sex: item.bedNumber,
                  age: item.age,
                  patientId: item.id,
                  number: item.number,
                  priority: item.priority,
                  taskRemark: item.taskRemark,
                  spaces: item.destinationName
                })
              };
              if (index == 0) {
                this.stateFilterList = temporaryTaskListFirst;
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                  return
                }
              } else if (index == 1) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 1});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                  return
                }
              } else if (index == 2) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 2});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                  return
                }
              } else if (index == 3) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 3});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                  return
                }
              } else if (index == 4) {
                this.stateFilterList = temporaryTaskListFirst.filter((item) => { return item.state == 4});
                if (this.stateFilterList.length == 0) {
                  this.noDataShow = true;
                  return
                }
              };
              // 改变目的地科室列表数据结构
              for (let item = 0, len = this.stateFilterList.length; item < len; item++) {
                let temporaryArrayTwo = [];
                for (let innerItem in this.stateFilterList[item]) {
                  if (innerItem == 'spaces') {
                    let temporaryArrayTwo = [];
                    let temporaryItem = removeBlock(this.stateFilterList[item][innerItem]).split(",");
                    let temporaryArrayOne = [];
                    for (let kip of temporaryItem) {
                      temporaryArrayOne = [];
                      temporaryArrayOne = kip.replace(/\"/g, "").split(':');
                      temporaryArrayTwo.push({text: temporaryArrayOne[1], value: temporaryArrayOne[0]});
                    }
                    this.stateFilterList[item]['spaces'] = temporaryArrayTwo;
                  };
                }
              };
              // 目的地科室列表增加字段
              for (let item of this.stateFilterList) {
                for (let innerItem in item) {
                  if (innerItem == 'spaces') {
                    for (let medicalItem of item[innerItem]) {
                      medicalItem['check'] = false
                    }
                  }
                }
              };
              console.log('改变',this.stateFilterList);
              // 为完成扫码目的地科室增加标记
              if (this.completeSweepcodeDestinationInfo.length > 0) {
                for (let w = 0, wLen = this.completeSweepcodeDestinationInfo.length; w < wLen; w++) {
                  if (this.stateFilterList.length > 0) {
                     for (let n = 0, nLen = this.stateFilterList.length; n < nLen; n++) {
                      if (this.stateFilterList[n]['id'] == this.completeSweepcodeDestinationInfo[w]['taskId']) {
                        if (this.completeSweepcodeDestinationInfo[w]['officeList'].length > 0) {
                          for (let i = 0, len1 = this.completeSweepcodeDestinationInfo[w]['officeList'].length; i < len1; i++) {
                            if (this.stateFilterList[n]['spaces'].length > 0) {
                              for (let j = 0, len2 = this.stateFilterList[n]['spaces'].length; j < len2; j++) {
                                if (this.stateFilterList[n]['spaces'][j]['value'] == this.completeSweepcodeDestinationInfo[w]['officeList'][i]) {
                                  this.stateFilterList[n]['spaces'][j]['check'] = true
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
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

      // 提取存储已完成采集任务科室所属任务id
      drawTaskId () {
        this.drawCompleteTaskIdList = [];
        if (this.completeSweepcodeDestinationInfo.length > 0) {
          for (let item of this.completeSweepcodeDestinationInfo) { 
            for (let innerItem in item) {
              if (innerItem == 'taskId') {
                this.drawCompleteTaskIdList.push(item[innerItem])
              }
            }
          }
        }
      },

      // 查询调度任务(已完成)
      queryCompleteDispatchTask (data) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        getAppointTaskComplete(data).then((res) => {
          this.stateCompleteList = [];
          this.showLoadingHint = false;
          this.noDataShow = true
          if (res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.noDataShow = false;
              for (let item of res.data.data) {
                this.stateCompleteList.push({
                  taskCheck: false,
                  createTime: item.createTime,
                  spaces: item.destinationName,
                  state: item.state,
                  finishTime: item.finishTime,
                  setOutPlaceName: item.setOutPlaceName,
                  destinationName: item.destinationName,
                  taskTypeName: item.taskName,
                  toolName: item.toolName,
                  id: item.id,
                  patientName: item.patientName,
                  bedNumber: item.bedNumber,
                  sex: item.bedNumber,
                  age: item.age,
                  patientId: item.id,
                  number: item.number,
                  taskRemark: item.taskRemark
                })
              };
               // 改变目的地科室列表数据结构
              for (let item = 0, len = this.stateCompleteList.length; item < len; item++) {
                let temporaryArrayTwo = [];
                for (let innerItem in this.stateCompleteList[item]) {
                  if (innerItem == 'spaces') {
                    let temporaryArrayTwo = [];
                    let temporaryItem = removeBlock(this.stateCompleteList[item][innerItem]).split(",");
                    let temporaryArrayOne = [];
                    for (let kip of temporaryItem) {
                      temporaryArrayOne = [];
                      temporaryArrayOne = kip.replace(/\"/g, "").split(':');
                      temporaryArrayTwo.push({text: temporaryArrayOne[1], value: temporaryArrayOne[0]});
                    }
                    this.stateCompleteList[item]['spaces'] = temporaryArrayTwo;
                  }
                }
              }
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
      

      // 阻止change事件冒泡
      emptyHandle () {},

      // 返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'中央运送'});
        setStore('currentTitle','中央运送')
      },

      // 调度任务第一行按钮点击
      taskLineOneEvent (item,index) {
        this.taskLlineOneIndex = index;
        this.transferTask = false;
        this.cancelTask = false;
        this.noDataShow = false;
        if (index == '0') {
          this.stateIndex = 0;
          this.taskQueryShow = false;
          this.waitHandleBox = true;
          this.stateScreenVal = '全部';
          this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, this.stateIndex);
        } else if (index == '1') {
          this.stateIndex = null;
          this.taskQueryShow = true;
          this.waitHandleBox = false;
          this.cancelTaskBtnShow = false;
          this.transferTaskBtnShow = false;
          this.initDate();
          this.queryCompleteDispatchTask({proId:this.proId, workerId:this.workerId,state:7,startDate: this.startTime, endDate: this.endTime})
        }
      },

       // 状态筛选列表点击
      stateListEvent (index,item) {
        this.stateIndex = index;
        this.stateScreenVal = item;
        this.queryStateFilterDispatchTask(this.userInfo.extendData.proId, this.workerId, index)
      },

      // 状态筛选按钮点击
      statusScreenEvent () {
        this.statusScreen = true;
        this.taskQueryShow = false;
        this.stateListShow = !this.stateListShow;
        if (this.stateScreenVal == '状态筛选') {
          this.queryStateFilterDispatchTask(this.proId, this.workerId, 0);
          this.stateIndex = 0;
        }
      },

      // 转移任务按钮点击
      transferTaskEvent () {
        this.transferTask = true;
        this.cancelTask = false;
        this.transferWorkerShow = true;
        this.$router.push({path:'/appointTaskForm'});
        this.changeTitleTxt({tit:'转移人员选择'});
        setStore('currentTitle','转移人员选择');
        this.transferTaskIdList = [];
        let temporaryTransferTaskCheckList = [];
        temporaryTransferTaskCheckList = this.stateFilterList.filter((item) => {return item.taskCheck == true});
        for (let item of temporaryTransferTaskCheckList)  {
          for (let key in item) {
            if (key == 'id')
            this.transferTaskIdList.push(item['id'])
          }
        };
        this.changeAppointTaskTransferIdList({DtMsg: this.transferTaskIdList})
      },

      // 复选框选择事件 
      waitTaskChecked (waitHandleCheck) {
      },

      // 获取待处理任务事件
      getTask (taskId) {
        updateAppointTaskMessage({
          proId: this.proId,//当前项目ID
          id: taskId, //当前任务ID
          state: 2 //更新后的状态
        })
        .then(res => {
          if (res && res.data.code == 200) {
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
      },

      // 点击具体任务事件
      taskClickEvent (item) {
        if (item.state == 7) {
          this.$router.push({'path':'/taskDetailsMessage'});
          this.changeTitleTxt({tit:'历史任务详情'});
          setStore('currentTitle','历史任务详情');
          this.changeTaskDetailsMessage(item);
          this.changeTaskType('预约任务')
        };
        if (item.state !== 1 && item.state !== 7) {
          // 传给扫码界面科室类型和任务状态的值
          if (item.state == 2) {
            this.changeAppointSweepCodeNumber(false);
            this.changeAppointSweepCodeIntoPage(true);
            this.changeAppointTaskDepartmentType(0);
            this.changeAppointTaskState(3);
            this.changeSurplusDestinationList(item.spaces)
          } else if (item.state == 3) {
            this.changeAppointSweepCodeIntoPage(false);
            this.changeAppointSweepCodeNumber(true);
            this.changeAppointTaskDepartmentType(1);
            this.changeSurplusDestinationList(item.spaces.filter((item) => {return item.check == false}))
          } else if (item.state == 4) {
            this.changeAppointSweepCodeNumber(false);
            this.changeAppointSweepCodeIntoPage(false);
            this.changeAppointTaskDepartmentType(2);
            this.changeAppointTaskState(7);
            this.changeSurplusDestinationList(item.spaces.filter((item) => {return item.check == false}))
          };
          this.$router.push({'path':'/appointTaskSweepCode'});
          this.changeTitleTxt({tit:'扫码'});
          setStore('currentTitle','扫码');
          // 改变调度具体某一预约任务的信息状态
          this.changeAppointTaskMessage({DtMsg: item});
          setStore('currentAppointTaskMessage',item);
        }
      },

      // 取消任务按钮点击
      cancelTaskEvent () {
        this.cancelTask = true;
        this.transferTask = false;
        this.cancelTaskIdList = [];
        this.$router.push({path:'/appointTaskCancelForm'});
        this.changeTitleTxt({tit:'取消原因选择'});
        setStore('currentTitle','取消原因选择');
        this.cancelTaskIdList = [];
        let temporaryCancelTaskCheckList = [];
        temporaryCancelTaskCheckList = this.stateFilterList.filter((item) => {return item.taskCheck == true});
        for (let item of temporaryCancelTaskCheckList)  {
          for (let key in item) {
            if (key == 'id')
            this.cancelTaskIdList.push(item['id'])
          }
        };
        this.changeAppoinTaskCancelIdList({DtMsg: this.cancelTaskIdList})
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
    position: relative;
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
    }
    .left-dropDown {
      .rightDropDown
    }
    .dispatch-task-title {
      .task-line-one-wrapper {
          height: 36px;
          font-size: 17px;
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
          color: #7f7d7d;
          position: absolute;
          top: 0;
          left: 10px;
          .taskLineTwoStyle {
            color: #2895ea
          }
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
          right: 10px;
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
          padding-bottom: 10px;
          box-sizing: border-box;
          .wait-handle-message-createTime {
            border-top: 1px solid #e3ece9;
            padding-left: 10px;
            background: #ececec;
            height: 27px;
            line-height: 27px;
            font-size: 18px;
            color: #7f7d7d
          };
          .wait-handle-message {
            margin-left: 30px;
            font-size: 18px;
            padding-top: 15px;
            padding-bottom: 8px;
            box-sizing: border-box;
            .handle-message-line-wrapper {
              p {
                margin-bottom: 12px;
                width: 47%;
                display: inline-block;
                vertical-align: top;
                .message-tit {
                  color: #7f7d7d
                };
                .message-tit-real {
                  color: black
                }
                .message-tit-real-style {
                  color: #2895ea
                }
                .message-tit-real-bdeNumber {
                  line-height: 24px
                }
                .message-tit-destination-real {
                  padding: 4px;
                  margin-right:2px;
                  line-height: 24px
                }
                .destinationRealStyle {
                  background: #2895ea;
                  color: #fff
                }
              }
            }
          };
          .wait-handle-check {
            position: absolute;
            top: 40px;
            left: 6px
          };
          .get-wait-task {
            width: 100%;
            text-align: center;
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
        }
      };
    };
    .wait-handle, .task-query, .status-handle-screen {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
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
    .wait-handle {
      .wait-handle-list {
        box-sizing: border-box;
        position: relative;
        padding-bottom: 10px;
        box-sizing: border-box;
        .wait-handle-message-createTime {
          border-top: 1px solid #e3ece9;
          padding-left: 10px;
          background: #ececec;
          height: 27px;
          line-height: 27px;
          font-size: 18px;
          color: #7f7d7d
        };
        .wait-handle-message {
          margin-left: 30px;
          font-size: 18px;
          padding-top: 15px;
          padding-bottom: 8px;
          box-sizing: border-box;
          .handle-message-line-wrapper {
            p {
              margin-bottom: 12px;
              width: 47%;
              display: inline-block;
              vertical-align: top;
              .message-tit {
                color: #7f7d7d
              };
              .message-tit-real {
                color: black
              };
              .message-tit-real-style {
                color: #2895ea
              }
              .message-tit-real-bdeNumber {
                line-height: 24px
              }
              .message-tit-destination-real {
                padding: 4px;
                margin-right:2px;
                line-height: 24px
              };
              .destinationRealStyle {
                background: #2895ea;
                color: #fff
              }
            }
          }
        };
        .wait-handle-check {
          position: absolute;
          top: 40px;
          left: 6px
        };
        .get-wait-task {
          width: 100%;
          text-align: center;
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
      }
    };
    .status-handle-screen {
       .wait-handle-list {
        box-sizing: border-box;
        position: relative;
        padding-bottom: 10px;
        box-sizing: border-box;
        .wait-handle-message-createTime {
          border-top: 1px solid #e3ece9;
          padding-left: 10px;
          background: #ececec;
          height: 27px;
          line-height: 27px;
          font-size: 18px;
          color: #7f7d7d
        };
        .wait-handle-message {
          margin-left: 30px;
          font-size: 18px;
          padding-top: 15px;
          padding-bottom: 8px;
          box-sizing: border-box;
          .handle-message-line-wrapper {
            p {
              margin-bottom: 12px;
              width: 47%;
              display: inline-block;
              vertical-align: top;
              .message-tit {
                color: #7f7d7d
              };
              .message-tit-real {
                color: black
              };
              .message-tit-real-style {
                color: #2895ea
              }
              .message-tit-real-bdeNumber {
                line-height: 24px
              }
              .message-tit-destination-real {
                padding: 4px;
                margin-right:2px;
                line-height: 24px;
              };
              .destinationRealStyle {
                background: #2895ea;
                color: #fff
              }
            }
          }
        };
        .wait-handle-check {
          position: absolute;
          top: 40px;
          left: 6px
        };
        .get-wait-task {
          width: 100%;
          text-align: center;
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