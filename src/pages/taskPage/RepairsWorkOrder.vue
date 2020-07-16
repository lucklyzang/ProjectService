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
        <div class="content-list-action-task-wrapper" v-show="currentIndex === 0">
          <div class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="`${index}-${item}`">
            <span class="status-box">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.planStartTime}}</span>
            <p class="task-btn">
              <span class="back" @click="taskBack(item)" v-show="item.state == 1 || item.state == 2">退回</span>
              <span class="sure" @click="taskSure(item)" v-show="item.state == 1">确认</span>
              <span class="view"  @click="taskView(item)" v-show="item.state !== 1">查看任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">工单号:</span>
              <span class="name">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">工单:</span>
              <span class="name">{{item.taskDesc}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">类型:</span>
              <span class="name">{{item.typeName}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">地点:</span>
              <span class="name">{{item.depName}}</span>
              <span v-for="(item,index) in item.spaces" :key="`${item,index}`">-{{item.name}}</span>
            </p>
          </div>
        </div>
        <div class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-show="currentIndex === 1">
          <div class="content-list-action-task-item" v-for="(item,index) in taskCompleteMessageList" :key="`${index}-${item}`">
            <span class="status-box">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.planStartTime}}</span>
            <p class="task-btn">
              <span class="view" v-show="item.state !== 1" @click="taskView(item)">查看任务</span>
            </p>
            <p class="work-order-number">
              <span class="tit">工单号:</span>
              <span class="name">{{item.taskNumber}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">工单:</span>
              <span class="name">{{item.taskDesc}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">类型:</span>
              <span class="name">{{item.typeName}}</span>
            </p>
            <p class="work-info-other">
              <span class="tit">地点:</span>
              <span class="name">{{item.depName}}</span>
            </p>
          </div>
        </div>
      </van-pull-refresh>
    </div>
   <!-- 退回原因弹窗 -->
    <van-dialog v-model="reasonShow" title="请选择退回原因" show-cancel-button width="92%"
          @confirm="reasonSure" @cancel="reasonCancel"
        >
          <div class="tool-name-list">
            <div class="tool-name-list-title-innner">退回原因:</div>
            <div class="tool-name-list-content">
              <span :class="{spanStyle:reasonIndex === index}" v-for="(item,index) in reasonOperationList" :key="`${item}-${index}`" @click="reasonCheck(item,index)">
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
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage} from '@/common/js/utils'
  import {queryRepairsProjectList,sureRepairsTask,backRepairsTask,queryBackRepairsTaskReason} from '@/api/worker.js'
  export default {
    name: 'RepairsWorkOrder',
    data () {
      return {
        currentIndex: 0,
        taskId: '',
        tabTitleList: ['待办任务','已完成'],
        reasonShow: false,
        isRefresh: false,
        reasonOperationList: [],
        reasonIndex: '',
        reasonText: '',
        reasonName: '',
        reasonValue: '',
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
        'isFreshRepairsWorkOrderPage'
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
      let i = catch_components.indexOf('RepairsWorkOrder');
      i === -1 && catch_components.push('RepairsWorkOrder');
      next();
    },

    beforeRouteLeave(to, from, next) {
      let catch_components = this.catch_components;
      if (to.name !== 'workOrderDetails'){
        let i = catch_components.indexOf('RepairsWorkOrder');
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
      if (this.isFreshRepairsWorkOrderPage) {
        this.getRepairsProjectList({
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
      if (this.isFreshRepairsWorkOrderPage) {
        this.getRepairsProjectList({
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
        'changeRepairsWorkOrderMsg'
      ]),

      // 任务状态转换
      stateTransfer (index) {
        switch(index) {
          case 0 :
            return '未分配'
            break;
          case 1 :
            return '未获取'
            break;
          case 2 :
            return '未开始'
            break;
          case 3 :
            return '进行中'
            break;
          case 4 :
            return '待签字'
            break;
          case 5 :
            return '已完成'
            break;
          case 6 :
            return '已取消'
            break;
          case 7 :
            return '已延迟'
            break;
        }
      },

      // 下拉刷新事件
      onRefresh() {
        this.getRepairsProjectList ({
          proId: this.proId,
          workerId: this.workerId,	
          state: this.currentIndex == 0 ? -1 : -2,
          startDate	: '',
          endDate : ''
        },this.currentIndex)
      },

      // 退回原因确定
      reasonSure () {
        if (this.reasonIndex === '') {
          this.$toast('请选择退回原因');
          return
        };
        backRepairsTask({proId:this.proId, taskId:this.taskId,reason:this.reasonText})
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            this.getRepairsProjectList({
              proId: this.proId,
              workerId: this.workerId,	
              state: -1,
              startDate	: '',
              endDate : ''
            },0)
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

      // 退回原因取消
      reasonCancel() {
        this.reasonIndex = '';
        this.reasonName = '';
        this.reasonShow = false
      },

      // 原因选中事件
      reasonCheck (item,index) {
        this.reasonIndex = index;
        this.reasonText = item.text;
        this.reasonName = item.text
        this.reasonValue = item.value
      },

      // tab点击事件
      liClickEvent (item,index) {
        this.currentIndex = index;
        if (index == 0) {
          this.getRepairsProjectList({
            proId: this.proId,
            workerId: this.workerId,	
            state: -1,
            startDate	: '',
            endDate : ''
          },index)
        } else {
          this.getRepairsProjectList({
            proId: this.proId,
            workerId: this.workerId,	
            state: -2,
            startDate	: '',
            endDate : ''
          },index)
        }
      },

      // 查询报修项目列表
      getRepairsProjectList (data,index) {
        this.showLoadingHint = true;
        queryRepairsProjectList(data)
        .then((res) => {
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
                    taskDesc: item.taskDesc,
                    typeName: item.typeName,
                    depName: item.depName,
                    planStartTime: item.planStartTime,
                    planFinishTime: item.planFinishTime,
                    createTime: item.createTime,
                    state: item.state,
                    id: item.id,
                    isMe: item.isMe,
                    spaces: item.spaces
                  })
                } else {
                  this.taskCompleteMessageList.push({
                    taskNumber: item.taskNumber,
                    taskDesc: item.taskDesc,
                    typeName: item.typeName,
                    depName: item.depName,
                    planStartTime: item.planStartTime,
                    planFinishTime: item.planFinishTime,
                    createTime: item.createTime,
                    state: item.state,
                    id: item.id,
                    isMe: item.isMe,
                    spaces: item.spaces
                  })
                }
              };
              // 为房间信息增加check字段
              for (let item of this.taskMessageList) {
                for (let innerItem in item) {
                  if (innerItem == 'spaces') {
                    for (let medicalItem of item[innerItem]) {
                      medicalItem['check'] = false
                    }
                  }
                }
              };
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
          this.noDataShow = true;
          this.showLoadingHint = false
        })
      },

      // 任务退回
      taskBack (item) {
        this.taskId = item.id;
        this.reasonShow = true;
        queryBackRepairsTaskReason({proId:this.proId})
        .then((res) => {
          this.reasonOperationList = [];
          if (res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                this.reasonOperationList.push({
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
        this.reasonIndex = ''
      },

      // 任务确认
      taskSure (item) {
        sureRepairsTask({
          proId: this.proId, //项目ID 必输
          taskId: item.id, //任务ID 必输
          workerId: this.workerId //用户ID 必输
        })
        .then((res) => {
          if (res && res.data.code == 200) {
            this.getRepairsProjectList({
              proId: this.proId,
              workerId: this.workerId,	
              state: -1,
              startDate	: '',
              endDate : ''
            },0)
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

      // 任务查看
      taskView (item) {
        this.changeRepairsWorkOrderMsg(item);
        setStore('repairsWorkOrderMsg',item);
        this.$router.push({path: 'workOrderDetails'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
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
      z-index: 200
    }
    .loading {
      position: absolute;
      top: 260px;
      left: 0;
      width: 100%;
      height: 50px;
      text-align: center
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
          font-weight: 600;
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
            .back {
              background: #bec7d1
            };
            .sure {
              background: #2c65f7
            };
            .view {
              background: #2c65f7
            }
          }
          > p {
            height: 30px;
            font-size: 15px;
            overflow: auto;
            color: black;
            font-weight: bold;
          };
          .work-order-number {
            font-size: 14px;
            color: #bbbaba
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