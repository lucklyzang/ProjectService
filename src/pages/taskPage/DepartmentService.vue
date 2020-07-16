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
      <div class="content-list-action-task-wrapper" v-show="currentIndex == 0">
        <div class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="`${index}-${item}`">
          <span class="status-box">待确认</span>
          <span class="task-date">{{item.date}}</span>
          <p class="task-btn">
            <span class="view"  @click="taskView(item)">查看任务</span>
          </p>
          <p class="work-order-number">
            <span class="tit">巡检单号:</span>
            <span class="name">{{item.workOrderNumber}}</span>
          </p>
          <p class="work-info-other">
            <span class="tit">巡检:</span>
            <span class="name">{{item.workOrderNumber}}</span>
          </p>
          <p class="work-info-other">
            <span class="tit">当前次数:</span>
            <span class="name">{{item.workOrder}}</span>
          </p>
          <p class="work-info-other work-info-other-row">
            <span class="tit">已完成点位:</span>
            <span class="name">{{item.taskType}}</span>
          </p>
          <p class="work-info-other work-info-other-row">
            <span class="tit">未完成点位:</span>
            <span class="name">{{item.taskPoint}}</span>
          </p>
        </div>
      </div>
      <div class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-show="currentIndex == 1">
        <div class="content-list-action-task-item">
          <span class="status-box">待确认</span>
          <span class="task-date">sasasas</span>
          <p class="task-btn">
            <span class="view"  @click="taskView(item)">查看任务</span>
          </p>
          <p class="work-order-number">
            <span class="tit">巡检单号:</span>
            <span class="name">sasasas</span>
          </p>
          <p class="work-info-other">
            <span class="tit">巡检:</span>
            <span class="name">sasas</span>
          </p>
          <p class="work-info-other">
            <span class="tit">当前次数:</span>
            <span class="name">sasasasa</span>
          </p>
          <p class="work-info-other work-info-other-row">
            <span class="tit">已完成点位:</span>
            <span class="name">1</span>
          </p>
          <p class="work-info-other work-info-other-row">
            <span class="tit">未完成点位:</span>
            <span class="name">2</span>
          </p>
        </div>
      </div>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage } from '@/common/js/utils'
  import {getDictionaryData} from '@/api/login.js'
  export default {
    name: 'RepairsWorkOrder',
    data () {
      return {
        currentIndex: 0,
        tabTitleList: ['待办任务','已完成'],
        taskMessageList: [
          {
            date: '2020-03-03 13:00',
            workOrderNumber: 'bx12131313131',
            workOrder: '灯管不亮,需更换',
            taskType: '1',
            taskPoint: '2',
            id: 1
          },
          {
            date: '2020-03-03 13:00',
            workOrderNumber: 'bx12131313131',
            workOrder: '灯管不亮,需更换',
            taskType: '1',
            taskPoint: '2',
            id: 1
          },
          {
            date: '2020-03-03 13:00',
            workOrderNumber: 'bx12131313131',
            workOrder: '灯管不亮,需更换',
            taskType: '1',
            taskPoint: '2',
            id: 1
          },
          {
            date: '2020-03-03 13:00',
            workOrderNumber: 'bx12131313131',
            workOrder: '灯管不亮,需更换',
            taskType: '1',
            taskPoint: '2',
            id: 1
          }
        ]
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
      }
      
    },

    methods: {
      ...mapMutations([
        'changeTitleTxt',
        'changeCatchComponent',
        'changeDepartmentServiceMsg'
      ]),

      // tab点击事件
      liClickEvent (item,index) {
        this.currentIndex = index
      },

      // 任务查看
      taskView (item) {
        this.changeDepartmentServiceMsg(item)
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
          color: #2c65f7;
          border-bottom: 1px solid #2c65f7
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
            color: red
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
              background: #2c65f7
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
            color: #bbbaba
          };
          .work-info-other-row {
            display: inline-block;
            width: 40%;
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