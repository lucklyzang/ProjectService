<template>
  <div class="content-wrapper">
    <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <div class="loading">
      <loading :isShow="showLoadingHint" textContent="加载中,请稍候····" textColor="#2db8f9"></loading>
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
          <div class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="`${index}-${item}`">
            <span class="status-box" :class="{statusWaitFinish: item.state == 2,statusWaitSignature: item.state == 3}">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.startTime}}</span>
            <p class="task-btn">
              <span class="view"  :class="{viewStyle: item.state == 1}" @click="taskView(item)">查看任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">巡检单号:</span>
              <span class="name ">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">巡检:</span>
              <span class="name">{{item.taskName}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">当前次数:</span>
              <span class="name">{{item.currentTimes}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">已完成点位:</span>
              <span class="name">{{item.hasSpaces ? calculateCount(item.hasSpaces) : 0}}</span>
            </p>
            <p class="work-info-other work-info-other-row">
              <span class="tit">未完成点位:</span>
              <span class="name">{{item.hasSpaces ? calculateCountUnfinish(item,item.spaces,item.hasSpaces) : calculateCount(item.spaces)}}</span>
            </p>
          </div>
        </div>
        <div class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-show="currentIndex == 1">
          <div class="content-list-action-task-item" v-for="(item,index) in taskCompleteMessageList" :key="`${index}-${item}`">
            <span class="status-box">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.startTime}}</span>
            <p class="task-btn">
              <span class="view"  @click="taskView(item)">查看任务</span>
            </p>
            <p class="work-order-number">
                <span class="tit">巡检单号:</span>
                <span class="name">{{item.taskNumber}}</span>
              </p>
              <p class="work-info-other">
                <span class="tit">巡检:</span>
                <span class="name">{{item.taskName}}</span>
              </p>
              <p class="work-info-other">
                <span class="tit">当前次数:</span>
                <span class="name">{{item.currentTimes}}</span>
              </p>
              <p class="work-info-other work-info-other-row">
                <span class="tit">已完成点位:</span>
                <span class="name">{{item.hasSpaces ? calculateCount(item.hasSpaces) : 0}}</span>
              </p>
              <p class="work-info-other work-info-other-row">
                <span class="tit">未完成点位:</span>
                <span class="name">{{item.hasSpaces ? calculateCountUnfinish(item,item.spaces,item.hasSpaces) : calculateCount(item.spaces)}}</span>
              </p>
          </div>
        </div>
      </van-pull-refresh>
    </div>
   <!-- 退回原因弹窗 -->
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
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import { mapGetters, mapMutations } from 'vuex'
  import store from '@/store'
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage, deteleObject } from '@/common/js/utils'
  import {queryDepartmentServiceList} from '@/api/worker.js'
  export default {
    name: 'DepartmentService',
    data () {
      return {
        currentIndex: 0,
        tabTitleList: ['待办任务','已完成'],
        isRefresh: false,
        noDataShow: false,
        showLoadingHint: false,
        taskMessageList: [],
        taskCompleteMessageList: []
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
        'catch_components',
        'isFreshDepartmentServicePage'
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
      let i = catch_components.indexOf('DepartmentService');
      i === -1 && catch_components.push('DepartmentService');
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'departmentWorkOrderDeatils'){
        let i = catch_components.indexOf('DepartmentService');
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
      if (this.isFreshDepartmentServicePage) {
        this.getDepartmentList({
          proId: this.proId,
          workerId: this.workerId,	
          state: -1,
          startDate	: '',
          endDate : ''
        },0)
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
      }
      if (this.isFreshDepartmentServicePage) {
        this.getDepartmentList({
          proId: this.proId,
          workerId: this.workerId,	
          state: -1,
          startDate	: '',
          endDate : ''
        },0)
      }
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeCatchComponent',
        'changeDepartmentServiceMsg'
      ]),

      // 任务状态转换
      stateTransfer (index) {
        switch(index) {
          case 0 :
            return '未分配'
            break;
          case 1 :
            return '未开始'
            break;
          case 2 :
            return '待完成'
            break;
          case 3 :
            return '待签字'
            break;
          case 4 :
            return '已完成'
            break
        }
      },

      // 计算点位数量(已完成)
      calculateCount (number) {
        return deteleObject(JSON.parse(number)).length
      },

      // 计算点位数量(未完成)
      calculateCountUnfinish (item,sum,finishNum) {
        return deteleObject(JSON.parse(sum)).length - deteleObject(JSON.parse(finishNum)).length
      },

      // tab点击事件
      liClickEvent (item,index) {
        this.currentIndex = index;
        if (index == 0) {
          this.getDepartmentList({
            proId: this.proId,
            workerId: this.workerId,	
            state: -1,
            startDate	: '',
            endDate : ''
          },index)
        } else {
          this.getDepartmentList({
            proId: this.proId,
            workerId: this.workerId,	
            state: -2,
            startDate	: '',
            endDate : ''
          },index)
        }
      },

      // 下拉刷新事件
      onRefresh() {
        this.getDepartmentList({
          proId: this.proId,
          workerId: this.workerId,	
          state: this.currentIndex == 0 ? -1 : -2,
          startDate	: '',
          endDate : ''
        },this.currentIndex)
      },

      // 查询任务列表
      getDepartmentList(data,index) {
        this.noDataShow = false;
        this.showLoadingHint = true;
        queryDepartmentServiceList(data).then((res) => {
          this.showLoadingHint = false;
          this.taskMessageList = [];
          this.taskCompleteMessageList = [];
          if(res && res.data.code == 200) {
            this.isRefresh = false;
            if (res.data.data.length > 0) {
              this.noDataShow = false;
              for (let item of res.data.data) {
                if (index == 0) {
                  this.taskMessageList.push({
                    taskNumber: item.taskNumber,
                    taskName: item.taskName,
                    startTime: item.startTime,
                    state: item.state,
                    currentTimes: item.currentTimes,
                    id: item.id,
                    isMe: item.isMe,
                    spaces: item.spaces,
                    hasSpaces: item.hasSpaces
                  })
                } else {
                  this.taskCompleteMessageList.push({
                    taskNumber: item.taskNumber,
                    taskName: item.taskName,
                    startTime: item.startTime,
                    state: item.state,
                    currentTimes: item.currentTimes,
                    id: item.id,
                    isMe: item.isMe,
                    spaces: item.spaces,
                    hasSpaces: item.hasSpaces
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

      // 任务查看
      taskView (item) {
        this.changeDepartmentServiceMsg(item);
        setStore('departmentServiceMsg',item);
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工程详情')
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
      text-align: center;
      z-index: 200
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
          width: 50%;
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
      /deep/ .van-pull-refresh {
        overflow: auto
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
            right: 15px;
            font-size: 13px;
            color: #8e9397
          };
          .statusWaitFinish {
            color: @color-theme
          };
          .statusWaitSignature {
            color: #06e606
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
            };
            .viewStyle {
              background: #8e9397
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
              width: 70%;
              display: inline-block;
              overflow: auto;
              vertical-align: top
            }
          };
          .work-info-other-row {
            display: inline-block;
            width: 40%;
          }
          &:last-child {
            margin-bottom: 0
          }
        }
      }
    }
  }
</style>