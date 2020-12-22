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
    </HeaderTop>
    <div class="content-top">
      <ul class="tab-title">
        <li :class="{liStyle: currentIndex == index}" v-for="(item,index) in tabTitleList" :key="`${item,index}`" @click="liClickEvent(item,index)">{{item}}</li>
      </ul>
    </div>
    <div class="content-bottom">
      <van-pull-refresh v-model="isRefresh" @refresh="onRefresh" success-text="刷新成功">
        <div class="content-list-action-task-wrapper" v-show="currentIndex == 0">
          <div class="content-list-action-task-item" v-for="(item,index) in acceptableTaskList" :key="`${index}-${item}`">
            <span class="status-box" :class="{statusBoxStyle: item.state == 2}">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.startTime}}</span>
            <p class="task-btn">
              <span class="view"  @click="taskView(item)">领取任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">巡检单号:</span>
              <span class="name">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">巡检名称:</span>
              <span class="name">{{item.taskName}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">当前次数:</span>
              <span class="name">{{item.currentTimes}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">类型:</span>
              <span class="name name-other">常规巡检</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">已完成设备:</span>
              <span class="name name-other">{{item.hasInput}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">未完成设备:</span>
              <span class="name name-other">{{item.deviceCount - item.hasInput}}</span>
            </p>
          </div>
        </div>
        <div class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-show="currentIndex == 1">
          <div class="content-list-action-task-item" v-for="(item,index) in waitTaskList" :key="`${index}-${item}`">
            <span class="status-box" :class="{statusBoxStyle: item.state == 2}">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.startTime}}</span>
            <p class="task-btn">
              <span class="view"  @click="taskView(item)">查看任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">巡检单号:</span>
              <span class="name">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">巡检名称:</span>
              <span class="name">{{item.taskName}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">当前次数:</span>
              <span class="name">{{item.currentTimes}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">类型:</span>
              <span class="name name-other">常规巡检</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">已完成设备:</span>
              <span class="name name-other">{{item.hasInput}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">未完成设备:</span>
              <span class="name name-other">{{item.deviceCount - item.hasInput}}</span>
            </p>
          </div>
        </div>
        <div class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-show="currentIndex == 2">
          <div class="content-list-action-task-item" v-for="(item,index) in completeTaskList" :key="`${index}-${item}`">
            <span class="status-box" :class="{statusBoxStyle: item.state == 2}">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.startTime}}</span>
            <p class="task-btn">
              <span class="view"  @click="taskView(item)">查看任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">巡检单号:</span>
              <span class="name">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">巡检名称:</span>
              <span class="name">{{item.taskName}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">当前次数:</span>
              <span class="name">{{item.currentTimes}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">类型:</span>
              <span class="name name-other">常规巡检</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">已完成设备:</span>
              <span class="name name-other">{{item.hasInput}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">未完成设备:</span>
              <span class="name name-other">{{item.deviceCount - item.hasInput}}</span>
            </p>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import { mapGetters, mapMutations } from 'vuex'
  import store from '@/store'
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage } from '@/common/js/utils'
  import {queryAllEnergyTask,ensureEnergyTask} from '@/api/worker.js'
  export default {
    name: 'DeviceService',
    data () {
      return {
        noDataShow: false,
        showLoadingHint: false,
        isRefresh: false,
        currentIndex: 0,
        tabTitleList: ['可接任务','待办任务','已完成'],
        acceptableTaskList: [],
        waitTaskList: [],
        completeTaskList: []
      }
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
        'catch_components',
        'isFreshDeviceServicePage'
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

    beforeRouteEnter (to, from, next) {
      let catch_components = store.state.catchComponent.catch_components;
      let i = catch_components.indexOf('DeviceService');
      i === -1 && catch_components.push('DeviceService');
      console.log(store.state.catchComponent.catch_components);
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'copyDetails' && to.name !== 'deviceServiceDetails' && to.name !== 'operateRecordOrderDetails'){
        let i = catch_components.indexOf('DeviceService');
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
          this.changeTitleTxt({tit:'工程管理系统'});
          setStore('currentTitle','工程管理系统')
        })
      };
      if (this.isFreshDeviceServicePage) {
        this.getAllEnergyTask({
          proId: this.proId,
          workerId: this.workerId,
          state: this.currentIndex + 1,
          startDate	: '',
          endDate : ''
        },this.currentIndex)
      }
    },

    activated () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        let that = this;
        pushHistory();
        that.gotoURL(() => {
          pushHistory();
          this.$router.push({path: 'home'});
          this.changeTitleTxt({tit:'工程管理系统'});
          setStore('currentTitle','工程管理系统')
        })
      };
      if (this.isFreshDeviceServicePage) {
        this.getAllEnergyTask({
          proId: this.proId,
          workerId: this.workerId,
          state: this.currentIndex + 1,
          startDate	: '',
          endDate : ''
        },this.currentIndex)
      }
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeDeviceServiceMsg',
        'changeCatchComponent'
      ]),

      // 任务状态转换
      stateTransfer (index) {
        switch(index) {
          case 1 :
            return '待领取'
            break;
          case 2 :
            return '待完成'
            break;
          case 4 :
            return '已完成'
            break
        }
      },

      // 查询任务列表
      getAllEnergyTask(data,index) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        queryAllEnergyTask(data).then((res) => {
            this.showLoadingHint = false;
            this.acceptableTaskList = [];
            this.waitTaskList = [];
            this.completeTaskList = [];
          if(res && res.data.code == 200) {
            this.isRefresh = false;
            if (res.data.data.length > 0) {
              this.noDataShow = false;
              for (let item of res.data.data) {
                if (index == 0) {
                  this.acceptableTaskList.push({
                    taskId: item.id,
                    taskNumber: item.taskNumber,
                    taskName: item.taskName,
                    state: item.state,
                    startTime: item.startTime,
                    spaces: item.spaces,           //要访问科室
                    deviceCount: item.deviceCount,      //设备总数量
                    hasSpaces: item.hasSpaces,   //已访问科室
                    hasInput: item.hasInput,          //已访问设备数
                    currentTimes: item.currentTimes,      //当前次数
                    deviceId: item.deviceId,      //设备类型ID
                    createTime: item.createTime //创建时间
                  })
                } else if (index == 1) {
                  this.waitTaskList.push({
                    taskId: item.id,
                    taskNumber: item.taskNumber,
                    taskName: item.taskName,
                    state: item.state,
                    startTime: item.startTime,
                    spaces: item.spaces,           //要访问科室
                    deviceCount: item.deviceCount,      //设备总数量
                    hasSpaces: item.hasSpaces,   //已访问科室
                    hasInput: item.hasInput,          //已访问设备数
                    currentTimes: item.currentTimes,      //当前次数
                    deviceId: item.deviceId,      //设备类型ID
                    createTime: item.createTime //创建时间
                  })
                } else {
                  this.completeTaskList.push({
                    taskId: item.id,
                    taskNumber: item.taskNumber,
                    taskName: item.taskName,
                    state: item.state,
                    startTime: item.startTime,
                    spaces: item.spaces,           //要访问科室
                    deviceCount: item.deviceCount,      //设备总数量
                    hasSpaces: item.hasSpaces,   //已访问科室
                    hasInput: item.hasInput,          //已访问设备数
                    currentTimes: item.currentTimes,      //当前次数
                    deviceId: item.deviceId,      //设备类型ID
                    createTime: item.createTime //创建时间
                  })
                }
              }
            } else {
              this.noDataShow = true;
            }
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.showLoadingHint = false
        })
      },

      // tab点击事件
      liClickEvent (item,index) {
        this.currentIndex = index;
        if (index == 0) {
          this.getAllEnergyTask({
            proId: this.proId,
            workerId: this.workerId,
            state: 1,
            startDate	: '',
            endDate : ''
          },index)
        } else if (index == 1) {
          this.getAllEnergyTask({
            proId: this.proId,
            workerId: this.workerId,
            state: 2,
            startDate	: '',
            endDate : ''
          },index)
        } else {
          this.getAllEnergyTask({
            proId: this.proId,
            workerId: this.workerId,
            state: 4,
            startDate	: '',
            endDate : ''
          },index)
        }
      },

      // 下拉刷新事件
      onRefresh() {
        this.getAllEnergyTask({
          proId: this.proId,
          workerId: this.workerId,
          state: this.currentIndex == 0 ? 1 : this.currentIndex == 1 ? 2 : 4,
          startDate	: '',
          endDate : ''
        },this.currentIndex)
      },

      // 任务查看
      taskView (item) {
        if (item.state == 1) {
          ensureEnergyTask(this.proId,item.taskId).then((res) => {
            if (res && res.data.code == 200) {
              this.getAllEnergyTask({
                proId: this.proId,
                workerId: this.workerId,
                state: 1,
                startDate	: '',
                endDate : ''
              },0)
            } else {
              this.$dialog.alert({
                message: `${res.data.msg}`,
                closeOnPopstate: true
              }).then(() => {
              })
            }
          })
          .catch((err) => {
            this.$dialog.alert({
              message: `${err.message}`,
              closeOnPopstate: true
            }).then(() => {
            })
          });
          return
        };
        // if (item.type == 1) {
        //   this.$router.push({path: 'deviceServiceDetails'});
        //   this.changeTitleTxt({tit:'设备巡检详情'});
        //   setStore('currentTitle','设备巡检详情')
        // } else if (item.type == 2){
        //   this.$router.push({path: 'operateRecordOrderDetails'});
        //   this.changeTitleTxt({tit:'设备巡检详情'});
        //   setStore('currentTitle','设备巡检详情')
        // } else if (item.type == 3){
        //   this.$router.push({path: 'CopyDetails'});
        //   this.changeTitleTxt({tit:'抄录详情'});
        //   setStore('currentTitle','抄录详情')
        // };
        this.$router.push({path: 'CopyDetails'});
        this.changeTitleTxt({tit:'抄录详情'});
        setStore('currentTitle','抄录详情')
        this.changeDeviceServiceMsg(item);
        setStore('deviceServiceMsg',item);
      },

      // 返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'工程管理系统'});
        setStore('currentTitle','工程管理系统')
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
              background: @color-theme
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
    .no-data {
      position: absolute;
      top: 200px;
      left: 0;
      width: 100%;
      z-index: 200;
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
    .content-top {
      height: 60px;
      .tab-title {
        width: 90%;
        height: 55px;
        margin: 0 auto;
        li {
          float: left;
          font-size: 16px;
          width: 33.3333%;
          line-height: 55px;
          text-align: center;
          color: #bbbaba
        };
        .liStyle {
          color: @color-theme;
          border-bottom: 1px solid @color-theme
        }
      }
    };
    .content-bottom {
      flex: 1;
      width: 100%;
      font-size: 13px;
      background: #f7f7f7;
      position: relative;
      overflow: auto;
      .van-pull-refresh {
        overflow: auto;
      };
      > div {
        width: 96%;
        margin: 0 auto;
        height: 100%;
        padding-top: 10px;
        box-sizing: border-box;
      }
      .content-list-action-task-wrapper {
        .content-list-action-task-item {
          height: 200px;
          background: #fff;
          padding: 15px;
          box-sizing: border-box;
          margin-bottom: 15px;
          position: relative;
          .status-box {
            position: absolute;
            top: 15px;
            right: 8px;
            font-size: 13px;
            color: #bbbaba
          };
          .statusBoxStyle {
            color: #2db8f9
          };
          .task-date {
            position: absolute;
            bottom: 30px;
            left: 15px;
            font-size: 13px;
            color: #bbbaba
          };
          .task-btn {
            position: absolute;
            bottom: 15px;
            right: 15px;
            font-size: 13px;
            height: 35px;
            span {
              display: inline-block;
              width: 90px;
              height: 35px;
              line-height: 35px;
              text-align: center;
              color: #fff
            };
            .view {
              background: @color-theme
            }
          }
          > p {
            height: 30px;
            font-size: 15px;
            color: black;
            font-weight: bold;
          };
          .work-order-number {
            font-size: 14px;
            color: #bbbaba;
            .name {
              max-width: 70%;
              display: inline-block;
              overflow: auto;
              vertical-align: top;
            }
          };
          .work-info-other-row {
            display: inline-block;
            width: 40%;
            .name-other {
              color: #2db8f9
            }
          }
          &:last-child {
            margin-bottom: 0
          }
        }
      };
      .content-list-complete-task-wrapper {

      }
    }
  }
</style>
