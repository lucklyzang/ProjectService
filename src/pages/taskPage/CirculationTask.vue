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
    <div class="circultion-task-title">
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
    <van-pull-refresh class="circulation-task-list-box"  v-model="isRefresh" @refresh="onRefresh" success-text="刷新成功">
      <div class="circulation-task-list" v-show="stateIndex == 0">
        <div class="wait-handle-list" v-for="(item,indexWrapper) in circulationTaskList" :key="`${indexWrapper}-${item}`">
         <div class="view-office" @click.stop="startTask(item)">进入任务</div>
          <p class="wait-handle-message-createTime">
            任务名称：{{item.taskTypeName}}
          </p>
          <p class="wait-handle-message-createTime">
            开始时间：{{item.startTime}}
          </p>
          <p class="wait-handle-message-createTime wait-handle-message-style">
            任务状态：{{stateTransfer(item.state)}}
          </p>
        </div>
      </div>
      <div class="circulation-task-list" v-show="stateIndex == 1">
        <div class="wait-handle-list" v-for="(item,indexWrapper) in circulationTaskList" :key="`${indexWrapper}-${item}`">
         <div class="view-office" @click.stop="startTask(item)">进入任务</div>
          <p class="wait-handle-message-createTime">
            任务名称：{{item.taskTypeName}}
          </p>
          <p class="wait-handle-message-createTime">
            开始时间：{{item.startTime}}
          </p>
          <p class="wait-handle-message-createTime wait-handle-message-style">
            任务状态：{{stateTransfer(item.state)}}
          </p>
        </div>
      </div>
      <div class="circulation-task-list" v-show="stateIndex == 2">
        <div class="wait-handle-list" v-for="(item,indexWrapper) in circulationTaskList" :key="`${indexWrapper}-${item}`">
         <div class="view-office" @click.stop="startTask(item)">进入任务</div>
          <p class="wait-handle-message-createTime">
            任务名称：{{item.taskTypeName}}
          </p>
          <p class="wait-handle-message-createTime">
            开始时间：{{item.startTime}}
          </p>
          <p class="wait-handle-message-createTime wait-handle-message-style">
            任务状态：{{stateTransfer(item.state)}}
          </p>
        </div>
      </div>
      <div class="circulation-task-list">
        <div class="wait-handle-list"  v-show="taskQueryShow" v-for="(item,indexWrapper) in circulationTaskList" :key="`${indexWrapper}-${item}`">
          <div class="view-office" @click.stop="startTask(item)">进入任务</div>
          <p class="wait-handle-message-createTime">
            任务名称：{{item.taskTypeName}}
          </p>
          <p class="wait-handle-message-createTime">
            开始时间：{{item.startTime}}
          </p>
          <p class="wait-handle-message-createTime wait-handle-message-style">
            任务状态：{{stateTransfer(item.state)}}
          </p>
        </div>
      </div>
    </van-pull-refresh>
    <div class="circultion-task-btn">
      <span>
        <img :src="taskConditionPng" alt=""  @click="circulationConditionEvent">
      </span>
    </div>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import {queryCirculationTask,userSignOut} from '@/api/workerPort.js'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, removeBlock, deepClone, repeArray, compareDateTime, removeAllLocalStorage } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  let windowTimer
  export default {
    name: 'circulationTask',
    data () {
      return {
        showLoadingHint: false,
        stateListShow: false,
        statusScreen: false,
        taskQueryShow: false,
        noDataShow: false,
        stateIndex: 0,
        stateListShow: false,
        taskListBoxShow: true,
        isRefresh: false,
        stateScreenVal: '全部',
        taskLlineOneIndex: '0',
        activeNames: [],
        taskOneList: ['待办任务', '历史任务'],
        stateList: ['全部','未开始','进行中'],
        circulationTaskListShow: false,
        leftDropdownDataList: ['退出登录'],
        leftDownShow: false,
        liIndex: null,
        circulationTaskList: [],
        drawCompleteTaskIdList: [],
        currentOfficeName: '',
        taskConditionPng: require('@/components/images/task-condition.png'),
        taskArrivedPng: require('@/components/images/task-arrived.png')
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
        'completeDeparnmentInfo',
        'globalTimer',
        'isFreshCirculationTaskPage',
        'userInfo',
        'catch_components',
        'circulationDetails'
      ]),
      proId () {
        return JSON.parse(getStore('userInfo')).extendData.proId
      },
      workerId () {
        return JSON.parse(getStore('userInfo')).extendData.userId
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
      document.addEventListener('click', (e) => {
        if(e.target.className!='status-name'){
          this.stateListShow = false;
        };
        if(e.target.className!='van-icon van-icon-manager-o' && e.target.className!='left-dropDown'){
          this.leftDownShow = false;
        }
      });
      // 轮询是否有新任务
      windowTimer = window.setInterval(() => {
        setTimeout(
        this.getCirculationTask({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          states: [], //查询状态
          startDate: '',  //起始日期  YYYY-MM-dd
          endDate: ''  //终止日期  格式 YYYY-MM-dd
        }, this.stateIndex), 0)
        }, 600000);
      this.getCirculationTask({
        proId: this.proId,  //医院ID，必输
        workerId: this.workerId,   //运送员ID
        states: [], //查询状态
        startDate: '',  //起始日期  YYYY-MM-dd
        endDate: ''  //终止日期  格式 YYYY-MM-dd
      }, this.stateIndex);
      this.drawTaskId()
    },

    activated () {
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
      // 轮询是否有新任务
      windowTimer = window.setInterval(() => {
        setTimeout(
        this.getCirculationTask({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          states: [], //查询状态
          startDate: '',  //起始日期  YYYY-MM-dd
          endDate: ''  //终止日期  格式 YYYY-MM-dd
        }, this.stateIndex), 0)
      }, 600000);
      if (this.isFreshCirculationTaskPage) {
        this.getCirculationTask({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          states: [], //查询状态
          startDate: '',  //起始日期  YYYY-MM-dd
          endDate: ''  //终止日期  格式 YYYY-MM-dd
        },0);
      };
      this.drawTaskId()
    },

    beforeDestroy() {
      if(windowTimer) {window.clearInterval(windowTimer)}
    },

    beforeRouteEnter (to, from, next){
      let catch_components = store.state.catchComponent.catch_components;
      let i = catch_components.indexOf('circulationTask');
      i === -1 && catch_components.push('circulationTask');
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'circulationDetails'){
        let i = catch_components.indexOf('circulationTask');
        i > -1 && this.changeCatchComponent([]);
      }
      next()
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeIsCollectEnterSweepCodePage',
        'changeStipulateOfficeList',
        'changeArriveDepartmentId',
        'changeTaskDetailsMessage',
        'changeTaskType',
        'changeCirculationDetails',
        'changeOverDueWay',
        'changeCirculationTaskId',
        'changeCatchComponent'
      ]),

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

      // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        this.userLoginOut(this.proId, this.userInfo.userName)
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
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
          default:
            return '无'
        }
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

      // 历史任务点击事件
      itemClick (item) {
        this.$router.push({'path':'/taskDetailsMessage'});
        this.changeTitleTxt({tit:'历史任务详情'});
        setStore('currentTitle','历史任务详情');
        this.changeTaskDetailsMessage(item);
        this.changeTaskType('循环任务')
      },

      // 循环任务第一行按钮点击
      taskLineOneEvent (item,index) {
        this.statusScreen = false;
        this.taskLlineOneIndex = index;
        this.noDataShow = false;
        if (index == '0') {
          this.stateIndex = 0;
          this.taskQueryShow = false;
          this.stateScreenVal = '全部';
          this.getCirculationTask({
            proId: this.proId,  //医院ID，必输
            workerId: this.workerId,   //运送员ID
            states: [], //查询状态
            startDate: '',  //起始日期  YYYY-MM-dd
            endDate: ''  //终止日期  格式 YYYY-MM-dd
          }, this.stateIndex);
        } else if (index == '1') {
            this.stateIndex = null;
            this.taskQueryShow = true;
            this.getCirculationTask({
            proId: this.proId,  //医院ID，必输
            workerId: this.workerId,   //运送员ID
            state: 7, //查询状态
            startDate: '',  //起始日期  YYYY-MM-dd
            endDate: ''  //终止日期  格式 YYYY-MM-dd
          },7)
        }
      },

      // 状态筛选列表点击
      stateListEvent (index, item) {
        this.stateIndex = index;
        this.stateScreenVal = item;
        this.getCirculationTask ({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          states: [], //查询状态
          startDate: '',  //起始日期  YYYY-MM-dd
          endDate: ''  //终止日期  格式 YYYY-MM-dd
        }, index)
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

      // 开始任务
      startTask (item) {
        // 判断上个任务是否完成或超时
        let currentItemIndex = this.circulationTaskList.indexOf(item);
        if (currentItemIndex != 0) {
          let innerIndex = currentItemIndex - 1,
              conditionOne = !this.circulationTaskList[innerIndex]['spaces'].every((item) => {return item.check == true}),
              conditionTwo = compareDateTime(`${new Date().getHours()}:${new Date().getMinutes()}`,item.startTime),
              conditionFour = compareDateTime(this.circulationTaskList[innerIndex]['startTime'],item.startTime);
              let timeOne = new Date(item.createTime).getTime(),
                  timeTwo = new Date(this.circulationTaskList[innerIndex]['createTime']).getTime(),
                  conditionThree = timeOne == timeTwo;
          if (conditionThree) {
            if (conditionOne) {
              if (conditionTwo) {
                if (item.state !== 7) {
                  this.$dialog.alert({
                    message: '请先完成该循环任务上一时间段的任务',
                    closeOnPopstate: true
                  }).then(() => {
                  });
                  return
                }
              }
            }
          } else {
            if (conditionOne) {
              if (conditionFour) {
                if (item.state !== 7) {
                  this.$dialog.alert({
                    message: '请先完成该循环任务上一时间段的任务',
                    closeOnPopstate: true
                  }).then(() => {
                  });
                  return
                }
              }
            }
          }
        };
        this.changeCirculationTaskId(item.id);
        this.$router.push({'path':'/circulationDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情');
        this.changeCirculationDetails(item)
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

      // 查询循环任务
      getCirculationTask (data,index) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        queryCirculationTask(data).then((res) => {
          this.showLoadingHint = false;
          this.circulationTaskList = [];
          let temporaryTaskListFirst = [];
          if (res && res.data.code == 200) {
            this.isRefresh = false;
            if (res.data.data.length > 0) {
              this.circulationTaskListShow = true;
              this.noDataShow = false;
              for (let item of res.data.data) {
                temporaryTaskListFirst.push({
                  createTime: item.createTime,
                  startTime: item.startTime,
                  proName: item.proName,
                  officeName: item.proName,
                  taskTypeName: item.taskTypeName,
                  workerName: item.workerName,
                  state: item.state,
                  priority: item.priority,
                  taskNumber: item.taskNumber,
                  finishTime: item.finishTime,
                  spaces: item.spaces,
                  id: item.id,
                  show: false,
                  check: false,
                  startUpTime: item.startUpTime
                })
              };
              if (this.stateIndex !== null) {
                if (index == 0) {
                  this.circulationTaskList = temporaryTaskListFirst.filter((item) => { return item.state !== 7});
                  if (this.circulationTaskList.length == 0) {
                    this.noDataShow = true;
                    return
                  };
                } else if (index == 1) {
                  this.circulationTaskList = temporaryTaskListFirst.filter((item) => { return item.state == 2});
                  if (this.circulationTaskList.length == 0) {
                    this.noDataShow = true;
                    return
                  }
                } else if (index == 2) {
                  this.circulationTaskList = temporaryTaskListFirst.filter((item) => { return item.state == 3});
                  if (this.circulationTaskList.length == 0) {
                    this.noDataShow = true;
                    return
                  }
                }
              } else if (this.taskQueryShow) {
                 if (index == 7) {
                  this.circulationTaskList = temporaryTaskListFirst.filter((item) => { return item.state == 7});
                  if (this.circulationTaskList.length == 0) {
                    this.noDataShow = true;
                    return
                  }
                }
              }
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
              console.log('任务信息',this.circulationTaskList)
            } else {
              this.circulationTaskListShow = false;
              this.noDataShow = true;
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
              this.circulationTaskListShow = false;
              this.noDataShow = true;
            });
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
            this.circulationTaskListShow = false;
            this.noDataShow = true;
          });
          this.showLoadingHint = false;
        });
      },

      // 下拉刷新
      onRefresh () {
        if (!this.taskQueryShow) {
          this.getCirculationTask({
            proId: this.proId,  //医院ID，必输
            workerId: this.workerId,   //运送员ID
            states: [], //查询状态
            startDate: '',  //起始日期  YYYY-MM-dd
            endDate: ''  //终止日期  格式 YYYY-MM-dd
          }, this.stateIndex)
        } else {
           this.getCirculationTask({
            proId: this.proId,  //医院ID，必输
            workerId: this.workerId,   //运送员ID
            state: 7, //查询状态
            startDate: '',  //起始日期  YYYY-MM-dd
            endDate: ''  //终止日期  格式 YYYY-MM-dd
          }, 7)
        }
      },

      // 返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'中央运送'});
        setStore('currentTitle','中央运送')
      },

      // 循环情况事件
      circulationConditionEvent () {
        this.$router.push({path: 'circulationTaskCondition'});
        this.changeTitleTxt({tit:'循环情况'});
        setStore('currentTitle','循环情况')
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
    font-size: 14px;
    .left-dropDown {
      .rightDropDown
    }
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
    .circultion-task-title {
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
          position: absolute;
          top: 0;
          left: 7px;
          .taskLineTwoStyle {
            color: #2895ea
          }
          span {
            color: #000000;
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
    };
    .circulation-task-list {
      /deep/ .van-tabs {
        .right-sign {
          .status-sign 
        }
      }
    };
    .circulation-task-list-box {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .circulation-task-list {
        .wait-handle-list {
          width: 96%;
          margin: 0 auto;
          margin-top: 6px;
          box-sizing: border-box;
          position: relative;
          padding-bottom: 4px;
          box-sizing: border-box;
          border: 1px solid #e1e1e1;
          .sample-type-check {
            position: absolute;
            top: 4px;
            left: 5px
          };
          .wait-handle-message-createTime {
            padding-left: 10px;
            height: 27px;
            line-height: 27px;
            font-size: 18px;
            color: #7f7d7d
          };
          .wait-handle-message-style {
            color: red
          };
        }
        .view-office {
          position: absolute;
          top: 22px;
          right: 16px;
          padding: 15px 12px;
          background: #2895ea;
          font-size: 13px;
          color: #fff;
          border-radius: 3px;
          box-sizing: border-box
        }
      }
    };
    .circulation-task-list-two {
      height: 100%;
      overflow: auto;
      width: 100%;
      padding: 0;
      padding-top: 8px;
      border-bottom: 1px solid #d3d3d3;
      box-sizing: border-box;
      .wait-handle-list {
        box-sizing: border-box;
        position: relative;
        margin-top: 6px;
        padding-bottom: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid #e1e1e1;
        .wait-handle-message-createTime {
          padding-left: 10px;
          height: 27px;
          line-height: 27px;
          font-size: 18px;
          color: #7f7d7d
        };
        .wait-handle-message-style {
          color: red
        }
      }   
      .view-office {
        position: absolute;
        top: 22px;
        right: 16px;
        padding: 15px 12px;
        background: #2895ea;
        font-size: 13px;
        color: #fff;
        border-radius: 3px;
        box-sizing: border-box
      }
    };
    .circultion-task-btn {
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