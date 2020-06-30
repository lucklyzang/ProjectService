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
      <!-- <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon>  -->
    </HeaderTop>
     <!-- 右边下拉框菜单 -->
    <ul class="left-dropDown" v-show="leftDownShow">
      <li v-for="(item, index) in leftDropdownDataList" :key="index" :class="{liStyle:liIndex == index}" @click="leftLiCLick(index)">{{item}}</li>
    </ul>
    <div class="circulation-task-condition-title">
      <div class="content-middle-top-content">
        <div class="create-date">创建日期:</div>
        <div class="date-wrapper">
          <van-field v-model="startTime" placeholder="开始日期" readonly="readonly" @click="startTimePop = true" right-icon="newspaper-o"/>
        </div>
        <div class="search-btn">
          <img :src="taskSearchPng" alt="" @click="searchTask">
        </div>
      </div>
      <van-popup v-model="startTimePop" label="离开时间" position="bottom" :overlay="true"> 
        <van-datetime-picker  v-model="currentDateStart"  type="date"  :min-date="minDateStart"
          @cancel="startTimePop = false"  @confirm="startTimePop = false"  @change="startTimeChange"/>
        </van-popup>
    </div>
    <div class="content-middle-content">
      <van-tabs v-model="activeName" @click="onClickTab">
        <van-tab name="0">
          <div slot="title">
            <span class="title">已完成</span>
            <span class="right-sign sign-not-in" v-show="currentIndex == 0">{{taskCount}}</span>
          </div>
          <div class="wait-handle-list" :key="`${item}-${index}`" v-for="(item,index) in completedTasksList">
            <div class="view-office" @click.stop="viewOfficeHandle(item)">{{item.show == true ? '隐藏科室' : '显示科室'}}</div>
            <p class="wait-handle-message-createTime">
              创建时间: {{item.createTime}}
            </p>
            <p class="wait-handle-message-createTime">
              完成时间: {{item.finishTime}}
            </p>     
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">医院:</span>
                  <span class="message-tit-real">{{item.proName}}</span>
                </p>
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real">{{priorityTransfer(item.priority)}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <p>
                  <span class="message-tit">工作人员:</span>
                  <span class="message-tit-real">{{item.workerName}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{stateTransfer(item.state)}}</span>
                </p>
                <p>
                  <span class="message-tit">开始时间:</span>
                  <span class="message-tit-real">{{item.startTime}}</span>
                </p>
              </div>
            </div>
            <div class="wait-handle-office-list" v-show="item.show">
              <ul>
                <li v-for="(innerItem, index) in JSON.parse(item.spaces)" :key="index">{{innerItem.name}}</li>
              </ul>
            </div>
          </div>
        </van-tab>
        <van-tab name="1">
          <div slot="title">
            <span class="title">未完成</span>
            <span class="right-sign sign-in" v-show="currentIndex == 1">{{taskCount}}</span>
          </div>
          <div class="wait-handle-list" :key="`${item}-${index}`" v-for="(item,index) in unfinishedTasksList">
            <div class="view-office" @click.stop="viewOfficeHandle(item)">{{item.show == true ? '隐藏科室' : '显示科室'}}</div>
            <p class="wait-handle-message-createTime">
              创建时间: {{item.createTime}}
            </p>
            <p class="wait-handle-message-createTime">
              开始时间: {{item.startTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">医院:</span>
                  <span class="message-tit-real">{{item.proName}}</span>
                </p>
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real">{{priorityTransfer(item.priority)}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <p>
                  <span class="message-tit">工作人员:</span>
                  <span class="message-tit-real">{{item.workerName}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{stateTransfer(item.state)}}</span>
                </p>
              </div>
            </div>
            <div class="wait-handle-office-list" v-show="item.show">
              <ul>
                <li v-for="(innerItem, index) in JSON.parse(item.spaces)" :key="index">{{innerItem}}</li>
              </ul>
            </div>
          </div>
        </van-tab>
        <van-tab  name="2">
          <div slot="title">
            <span class="title">已过期</span>
            <span class="right-sign sign-out" v-show="currentIndex == 2">{{taskCount}}</span>
          </div>
          <div class="wait-handle-list" :key="`${item}-${index}`" v-for="(item,index) in expiredTasksList">
            <div class="view-office" @click.stop="viewOfficeHandle(item)">{{item.show == true ? '隐藏科室' : '显示科室'}}</div>
            <p class="wait-handle-message-createTime">
              创建时间: {{item.createTime}}
            </p>
            <p class="wait-handle-message-createTime">
              开始时间: {{item.startTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">医院:</span>
                  <span class="message-tit-real">{{item.proName}}</span>
                </p>
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real">{{priorityTransfer(item.priority)}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <p>
                  <span class="message-tit">工作人员:</span>
                  <span class="message-tit-real">{{item.workerName}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{stateTransfer(item.state)}}</span>
                </p>
              </div>
             </div>
            <div class="wait-handle-office-list" v-show="item.show">
              <ul>
                <li v-for="(innerItem, index) in JSON.parse(item.spaces)" :key="index">{{innerItem}}</li>
              </ul>
            </div>
          </div>
        </van-tab>
        <van-tab  name="3">
          <div slot="title">
            <span class="title">进行中</span>
            <span class="right-sign sign-finish" v-show="currentIndex == 3">{{taskCount}}</span>
          </div>
          <div class="wait-handle-list" :key="`${item}-${index}`" v-for="(item,index) in inServiceTasksList">
            <div class="view-office" @click.stop="viewOfficeHandle(item)">{{item.show == true ? '隐藏科室' : '显示科室'}}</div>
            <p class="wait-handle-message-createTime">
              创建时间: {{item.createTime}}
            </p>
            <p class="wait-handle-message-createTime">
              开始时间: {{item.startTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">医院:</span>
                  <span class="message-tit-real">{{item.proName}}</span>
                </p>
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real">{{priorityTransfer(item.priority)}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务名称:</span>
                  <span class="message-tit-real">{{item.taskTypeName}}</span>
                </p>
                <p>
                  <span class="message-tit">工作人员:</span>
                  <span class="message-tit-real">{{item.workerName}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{stateTransfer(item.state)}}</span>
                </p>
              </div>
            </div>
            <div class="wait-handle-office-list" v-show="item.show">
              <ul>
                <li v-for="(innerItem, index) in JSON.parse(item.spaces)" :key="index">{{innerItem.name}}</li>
              </ul>
            </div>
          </div>
        </van-tab>
        <van-tab  name="4">
          <div slot="title">
            <span class="title">循环配置</span>
            <span class="right-sign sign-finish" v-show="currentIndex == 4">{{taskCount}}</span>
          </div>
          <div class="wait-handle-list" :key="`${item}-${index}`" v-for="(item,index) in circleSettingList">
            <div class="view-office" @click="viewOfficeHandle(item)">{{item.show == true ? '隐藏科室' : '显示科室'}}</div>
            <p class="wait-handle-message-createTime">
              创建日期: {{item.modifyTime}}
            </p>
            <p class="wait-handle-message-createTime">
              开始时间: {{item.circleStartTime}}
            </p>
            <div class="wait-handle-message">
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">医院:</span>
                  <span class="message-tit-real">{{item.proName}}</span>
                </p>
                <p>
                  <span class="message-tit">优先级:</span>
                  <span class="message-tit-real">{{priorityTransfer(item.priority)}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">任务名称:</span>
                  <span class="message-tit-real">{{item.circleName}}</span>
                </p>
                <p>
                  <span class="message-tit">工作人员:</span>
                  <span class="message-tit-real">{{item.workerName}}</span>
                </p>
              </div>
              <div class="handle-message-line-wrapper">
                <p>
                  <span class="message-tit">状态:</span>
                  <span class="message-tit-real" style="color:red">{{stateTransfer(item.state)}}</span>
                </p>
                <p>
                  <span class="message-tit">循环频率:</span>
                  <span class="message-tit-real">{{item.circleRate}}</span>
                </p>
              </div>
            </div>
            <div class="wait-handle-office-list" v-show="item.show">
              <ul>
                <li v-for="(innerItem, index) in JSON.parse(item.spaces)" :key="index">{{innerItem}}</li>
              </ul>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import FooterBottom from '@/components/FooterBottom'
import {getCirculationCondition} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import Loading from '@/components/Loading'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, deepClone } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'circulationTaskCondition',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      startTime: '',
      currentDateStart: new Date(),
      minDateStart: new Date(2020, 0, 1),
      startTimePop: false,
      leftDownShow: false,
      noDataShow: false,
      showLoadingHint: false,
      liIndex: null,
      taskCount: '',
      activeName: 0,
      currentIndex: 0,
      completedTasksList: [],
      unfinishedTasksList: [],
      expiredTasksList: [],
      inServiceTasksList: [],
      circleSettingList: [],
      taskSearchPng: require('@/components/images/task-search.png')
    };
  },

  components:{
    VanFieldSelectPicker,
    HeaderTop,
    NoData,
    Loading,
    FooterBottom
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        this.changeIsrefreshCirculationConnectPage(true);
        this.$router.push({path:'/circulationTask'})
        this.changeTitleTxt({tit:'循环任务'});
        setStore('currentTitle','循环任务')
      })
    };
    this.initDate();
    this.queryCirculationTaskCondition({
      proId: this.proId,  //医院ID，必输
      workerId: this.workerId,   //运送员ID
      createTime: this.startTime
    },0)
  },

  computed:{
    ...mapGetters([
      'navTopTitle'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    workerId () {
      return JSON.parse(getStore('userInfo')).extendData.userId
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeIsrefreshCirculationConnectPage',
      'changeCatchComponent'
    ]),

     // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
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

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

      startTimeChange(e) { 
        let startTimeArr = e.getValues();//["2019", "03", "22", "17", "28"] 
        this.startTime = `${startTimeArr[0]}-${startTimeArr[1]}-${startTimeArr[2]}`
      },

      // 初始化时间显示框
      initDate () {
        let currentDateList = formatTime('YYYY-MM-DD').split('-');
        this.startTime = `${currentDateList[0]}-${currentDateList[1]}-${currentDateList[2]}`
      },

      initData () {
        this.completedTasksList = [];
        this.unfinishedTasksList = [];
        this.expiredTasksList = [];
        this.inServiceTasksList = [];
        this.circleSettingList = [];
      },

      // 搜索任务
      searchTask () {
        this.activeName = 0;
        this.currentIndex = 0;
        this.queryCirculationTaskCondition ({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          createTime: this.startTime
        },0)
      },

      // 点击标签按钮事件
      onClickTab (name, title) {
        this.currentIndex = name;
        this.queryCirculationTaskCondition ({
          proId: this.proId,  //医院ID，必输
          workerId: this.workerId,   //运送员ID
          createTime: this.startTime
        },name)
      },

      // 查看科室事件
      viewOfficeHandle (item) {
        item.show = !item.show;
      },

      // 查询循环情况
      queryCirculationTaskCondition (data,index) {
        this.initData();
        this.showLoadingHint = true;
        getCirculationCondition(data).then((res) => {
          this.showLoadingHint = false;
          if (res && res.data.code == 200) {
            if (index == 0) {
              if (res.data.data.completedTasks != null && JSON.stringify(res.data.data.completedTasks) != "[]" ) {
                this.noDataShow = false;
                for (let item of res.data.data.completedTasks) {
                  if (item.hasAccess == "{}") {
                    item.hasAccess = '{"无":"无"}'
                  };
                  this.completedTasksList.push({
                    createTime: item.createTime,
                    startTime: item.startTime,
                    finishTime: item.finishTime,
                    proName: item.proName,
                    taskTypeName: item.taskTypeName,
                    workerName: item.workerName,
                    state: item.state,
                    priority: item.priority,
                    taskNumber: item.taskNumber,
                    spaces: item.hasAccess,
                    id: item.id,
                    show: false
                  })
                };
                this.taskCount = this.completedTasksList.length;
                console.log('21212',this.completedTasksList);
              } else {
                this.taskCount = 0;
                this.noDataShow = true
              }
            } else if (index == 1 ) {
              if (res.data.data.unfinishedTasks != null && JSON.stringify(res.data.data.unfinishedTasks) != "[]") {
                this.noDataShow = false;
                for (let item of res.data.data.unfinishedTasks) {
                  if (item.hasAccess == "{}") {
                    item.hasAccess = '{"无":"无"}'
                  };
                  this.unfinishedTasksList.push({
                    createTime: item.createTime,
                    startTime: item.startTime,
                    finishTime: item.finishTime,
                    proName: item.proName,
                    taskTypeName: item.taskTypeName,
                    workerName: item.workerName,
                    state: item.state,
                    priority: item.priority,
                    taskNumber: item.taskNumber,
                    spaces: item.hasAccess,
                    id: item.id,
                    show: false
                  })
                };
                this.taskCount = this.unfinishedTasksList.length
              } else {
                this.taskCount = 0;
                this.noDataShow = true
              }
            } else if (index == 2 ) {
              if (res.data.data.expiredTasks != null && JSON.stringify(res.data.data.expiredTasks) != "[]") {
                this.noDataShow = false;
                for (let item of res.data.data.expiredTasks) {
                  if (item.hasAccess == "{}") {
                    item.hasAccess = '{"无":"无"}'
                  };
                  this.expiredTasksList.push({
                    createTime: item.createTime,
                    startTime: item.startTime,
                    finishTime: item.finishTime,
                    proName: item.proName,
                    taskTypeName: item.taskTypeName,
                    workerName: item.workerName,
                    state: item.state,
                    priority: item.priority,
                    taskNumber: item.taskNumber,
                    spaces: item.hasAccess,
                    id: item.id,
                    show: false
                  })
                };
                this.taskCount = this.expiredTasksList.length;
              } else {
                this.taskCount = 0;
                this.noDataShow = true
              }
            } else if (index == 3 ) {
              if (res.data.data.inServiceTasks != null && JSON.stringify(res.data.data.inServiceTasks) != "[]") {
                this.noDataShow = false;
                for (let item of res.data.data.inServiceTasks) {
                  if (item.hasAccess == "{}") {
                    item.hasAccess = '{"无":"无"}'
                  };
                  this.inServiceTasksList.push({
                    createTime: item.createTime,
                    startTime: item.startTime,
                    finishTime: item.finishTime,
                    proName: item.proName,
                    taskTypeName: item.taskTypeName,
                    workerName: item.workerName,
                    state: item.state,
                    priority: item.priority,
                    taskNumber: item.taskNumber,
                    spaces: item.hasAccess,
                    id: item.id,
                    show: false
                  })
                };
                this.taskCount = this.inServiceTasksList.length;
              } else {
                this.taskCount = 0;
                this.noDataShow = true
              }
            } else if (index == 4 ) {
              if (res.data.data.circleSettingList != null && JSON.stringify(res.data.data.circleSettingList) != "[]") {
                this.noDataShow = false;
                for (let item of res.data.data.circleSettingList) {
                  if (item.spaces == "{}") {
                    item.spaces = '{"无":"无"}'
                  };
                  this.circleSettingList.push({
                    modifyTime: item.modifyTime,
                    circleRate: item.circleRate,
                    circleStartTime: item.circleStartTime,
                    proName: item.proName,
                    circleRate: item.circleRate,
                    workerName: item.workerName,
                    state: item.state,
                    priority: item.priority,
                    circleName: item.circleName,
                    spaces: item.spaces,
                    id: item.id,
                    show: false
                  })
                };
                this.taskCount = this.circleSettingList.length
              } else {
                this.taskCount = 0;
                this.noDataShow = true
              }
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
          }
        })
        .catch((err) => {
          this.showLoadingHint = false;
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
            this.circulationTaskListShow = false;
            this.noDataShow = true;
          });
        })
      },

      // 返回上一页
      backTo () {
        this.changeIsrefreshCirculationConnectPage(true);
        this.$router.push({path:'/circulationTask'})
        this.changeTitleTxt({tit:'循环任务'});
        setStore('currentTitle','循环任务')
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
    };
    .left-dropDown {
      .rightDropDown
    };
    .circulation-task-condition-title {
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
      .content-middle-top-content {
        position: relative;
        height: 100%;
        width: 98%;
        margin: 0 auto;
        .create-date {
          position: absolute;
          top: 17px;
          left: 4px;
          color: #3893e4;
          font-size: 18px
        }
        .date-wrapper {
          position: absolute;
          top: 7px;
          width: 44%;
          left: 90px;
        }
        .search-btn {
          position: absolute;
          top: 10px;
          right: 0;
          width: 70px;
          height: 60px;
          img {
            width: 100%;
            height: 100%ss
          }
        }
      }
    };
    .content-middle-content {
      flex:1;
      overflow: auto;
      /deep/ .van-tabs--line {
        margin-top: 4px;
        .van-tabs__line {
          background-color: @color-theme;
        }
      };
      /deep/ .van-tabs {
        .right-sign {
          .status-sign
        };
        .van-tabs__nav {
          .van-tab {
            font-size: 18px;
            flex-basis: 33% !important;
          }
        }
      };
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
          margin-left: 10px;
          font-size: 18px;
          padding-top: 15px;
          padding-bottom: 15px;
          box-sizing: border-box;
          .handle-message-line-wrapper {
            p {
              margin-bottom: 10px;
              width: 47%;
              display: inline-block;
              vertical-align: top;
              .message-tit {
                color: #7f7d7d
              };
              .message-tit-real {
                color: black
              }
            }
          }
        };
         .view-office {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 8px 6px;
          line-height: 14px;
          background: #2895ea;
          font-size: 14px;
          color: #fff;
          border-radius: 3px;
          box-sizing: border-box
        }
        .wait-handle-office-list {
          position: absolute;
          top: 54px;
          left: 0;
          width: 100%;
          max-height: 160px;
          overflow: auto;
          z-index: 100;
          ul {
            li {
              line-height: 30px;
              font-size: 18px;
              text-align: center;
              background: #fafafa;
              border-bottom: 1px solid #e9e9e9;
              color: #9b9b9b
            }
          }
        }
      }
    }
  }
</style>