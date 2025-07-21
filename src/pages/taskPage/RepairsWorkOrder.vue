<template>
  <div class="content-wrapper">
    <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <van-overlay :show="overlayShow"/>
    <div class="loading">
      <loading :isShow="showLoadingHint" :textContent="loadinText" textColor="#2db8f9"></loading>
    </div>
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon>
      <!-- <div v-if="currentIndex == 0" slot="right" class="left-text" @click="managementEvent">{{ isManagementClick ? '退出管理' : '管理' }}</div> -->
    </HeaderTop>
    <div class="content-top">
      <ul class="tab-title">
        <li :class="{liStyle: currentIndex == index}" v-for="(item,index) in tabTitleList" :key="`${item,index}`" @click="liClickEvent(item,index)">{{item}}</li>
      </ul>
    </div>
    <div class="content-bottom" ref="contentBottom">
      <van-pull-refresh v-model="isRefresh" @refresh="onRefresh" success-text="刷新成功">
        <div class="content-list-action-task-wrapper" v-show="currentIndex === 0">
          <div class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="`${index}-${item}`">
            <span class="status-box" :class="{statusWaitSure:item.state == 1,statusWaitFinish: item.state == 3,statusWaitSignature: item.state == 4, statusWaitCheck:item.state == 8}">{{stateTransfer(item.state)}}</span>
            <span class="task-date">{{item.planStartTime}}</span>
            <p class="task-btn">
              <span class="back" @click="taskBack(item)" v-show="item.state == 1 || item.state == 2">退回</span>
              <span class="sure" @click="taskSure(item)" v-show="item.state == 1">确认</span>
              <span class="view"  @click="taskView(item)" v-show="item.state !== 1">查看任务</span>
            </p>
            <p class="work-order-number">
              <van-checkbox icon-size="20px" checked-color="#3B9DF9" v-model="item.checked" v-if="item.state == 8 && isManagementClick"></van-checkbox>
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
    <div class="bottom-check-area" v-if="isManagementClick && taskMessageList.length > 0">
      <div class="check-area-left">
        <van-checkbox icon-size="24px" checked-color="#3B9DF9" v-model="allChecked" @click="allChooseEvent">全选</van-checkbox>
      </div>
      <div class="check-area-right" :class="{'checkAreaRightStyle' : !isCheckCanClick}" @click="completeCheckEvent">完成审核</div>
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
    <!-- 批量审核弹框 -->
    <div class="checkDialog">
      <van-dialog class="checkDialog" v-model="checkDialogShow" width="90%" :show-confirm-button="false" :close-on-click-overlay="true">
        <div class="close-icon">
          <van-icon name="cross" color="#0E2442" size="22" @click="checkDialogShow = false" />
        </div>
        <div class="check-text">
          {{ `是否完成审核以下${checkOrderCount}条工单` }}
        </div>
        <div class="btn-area">
          <div class="no-btn"  @click="checkDialogShow = false">否</div>
          <div class="yes-btn"  @click="sureCheckEvent">是</div>
        </div>
      </van-dialog>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, judgeOverTime, removeAllLocalStorage} from '@/common/js/utils'
  import {queryRepairsProjectList,sureRepairsTask,backRepairsTask,queryBackRepairsTaskReason,batchCgeckTask} from '@/api/worker.js'
  export default {
    name: 'RepairsWorkOrder',
    data () {
      return {
        currentIndex: 0,
        taskId: '',
        loadinText: '加载中,请稍候····',
        tabTitleList: ['待办任务','已完成'],
        reasonShow: false,
        isRefresh: false,
        noDataShow: false,
        overlayShow: false,
        showLoadingHint: false,
        reasonOperationList: [],
        reasonIndex: '',
        reasonText: '',
        reasonName: '',
        reasonValue: '',
        taskMessageList: [],
        allChecked: false,
        temporaryTaskMessageList: [],
        taskCompleteMessageList: [],
        isManagementClick: false,
        isCheckCanClick: false,
        checkDialogShow: false,
        checkOrderCount: 0,
        chooseCheckOrder: []
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
      taskMessageList: {
        handler(newValue, oldValue){
          if (this.taskMessageList.length == 0) {
            return
          };
          let flag = this.taskMessageList.every((el) => { return el.checked == true });
          let flagOther = this.taskMessageList.some((el) => { return el.checked == true });
          if (flag) {
            this.allChecked = true
          } else {
            this.allChecked = false
          };
          if (flagOther) {
            this.isCheckCanClick = true
          } else {
            this.isCheckCanClick = false
          }
        },
        deep: true,
        immediate: true
      },
      // allChecked: {
      //   handler(newValue, oldValue){
      //     if (this.taskMessageList.length == 0) {
      //       return
      //     };
      //     if (newValue) {
      //       this.taskMessageList.forEach(el => {
      //         el.checked = true
      //       })
      //     } else {
      //       if (!this.taskMessageList.some((el) => { return el.checked == true })) {
      //         this.taskMessageList.forEach(el => {
      //           el.checked = false
      //         })
      //       }
      //     }
      //   },
      //   immediate: true
      // }
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
      };
      // 控制tab切换首项文案显示
      if (this.userInfo['extendData']['projectAudit']) {
        this.tabTitleList[0] = '待复核任务'
      };
      if (this.isFreshRepairsWorkOrderPage) {
        this.getRepairsProjectList({
          proId: this.proId,
          workerId: this.workerId,
          state: -1,
          startDate	: '',
          endDate : '',
          audit: this.userInfo.extendData.projectAudit
        },0,'')
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
          endDate : '',
          audit: this.userInfo.extendData.projectAudit
        },0,'')
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
            return '待确认'
            break;
          case 2 :
            return '待完成'
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
           case 8 :
            return '待复核'
            break;
        }
      },

      // 管理事件
      managementEvent () {
        this.isManagementClick = !this.isManagementClick;
        let contentBottom = this.$refs.contentBottom;
        if (this.isManagementClick) {
          contentBottom.style.paddingBottom = '78px';
          this.taskMessageList = this.temporaryTaskMessageList.filter((item) => { return item.state == 8 });
          this.taskMessageList.forEach((item) => { return item.checked = false });
        } else {
          contentBottom.style.paddingBottom = 0;
          this.taskMessageList = this.temporaryTaskMessageList
        };
        if (this.taskMessageList.length == 0) {
          this.noDataShow = true;
        } else {
          this.noDataShow = false
        }
      },

      // 复选框全选事件
      allChooseEvent () {
        if (this.allChecked) {
          this.taskMessageList.forEach(el => {
            el.checked = true
          })
        } else {
          this.taskMessageList.forEach(el => {
            el.checked = false
          })
        }
      },

      // 完成审核事件
      completeCheckEvent () {
        if (!this.isCheckCanClick) { return };
        if (!this.userInfo.extendData.projectAudit) {
          this.$toast('你暂无此权限!');
          return
        };
        this.checkDialogShow = true;
        this.chooseCheckOrder = this.taskMessageList.filter((item) => { return item.checked == true });
        this.checkOrderCount = this.chooseCheckOrder.length
      },

      // 确定审核事件
      sureCheckEvent () {
        this.checkDialogShow = false;
        this.loadinText = '批量审核中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        let temporaryTaskList = [];
        for (let item of this.chooseCheckOrder) {
          temporaryTaskList.push(item.id)
        };
        batchCgeckTask({
          proId: this.proId,
          taskList: temporaryTaskList
        })
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast('批量审核成功');
            this.checked = false;
            this.getRepairsProjectList({
              proId: this.proId,
              workerId: this.workerId,
              state: -1,
              startDate	: '',
              endDate : '',
              audit: this.userInfo.extendData.projectAudit
            },0,'审核')
          } else {
            this.$toast(`${res.data.msg}`);
          };
          this.loadinText = '加载中,请稍候····';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.loadinText = '加载中,请稍候····';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

      // 下拉刷新事件
      onRefresh() {
        this.getRepairsProjectList ({
          proId: this.proId,
          workerId: this.workerId,
          state: this.currentIndex == 0 ? -1 : -2,
          startDate	: '',
          endDate : '',
          audit: this.userInfo.extendData.projectAudit
        },this.currentIndex,'')
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
              endDate : '',
              audit: this.userInfo.extendData.projectAudit
            },0,'')
          } else {
            this.$toast(`${res.data.msg}`)
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
        this.isManagementClick = false;
        let contentBottom = this.$refs.contentBottom;
        contentBottom.style.paddingBottom = 0;
        if (index == 0) {
          this.getRepairsProjectList({
            proId: this.proId,
            workerId: this.workerId,
            state: -1,
            startDate	: '',
            endDate : '',
            audit: this.userInfo.extendData.projectAudit
          },index,'')
        } else {
          this.getRepairsProjectList({
            proId: this.proId,
            workerId: this.workerId,
            state: -2,
            startDate	: '',
            endDate : '',
            audit: this.userInfo.extendData.projectAudit
          },index,'')
        }
      },

      // 查询报修项目列表
      getRepairsProjectList (data,index,text) {
        this.noDataShow = false;
        this.overlayShow = true;
        this.showLoadingHint = true;
        queryRepairsProjectList(data)
        .then((res) => {
          this.showLoadingHint = false;
          this.overlayShow = false;
          this.taskMessageList = [];
          this.temporaryTaskMessageList = [];
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
                    spaces: item.spaces,
                    checked: false
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
              this.temporaryTaskMessageList = this.taskMessageList;
              if (text == '审核') {
                if (this.temporaryTaskMessageList.filter((item) => { return item.state == 8 }).length == 0) {
                  this.isManagementClick = false
                } else {
                  this.isManagementClick = true;
                  this.taskMessageList = this.temporaryTaskMessageList.filter((item) => { return item.state == 8 });
                };
                this.allChecked = false;
              }
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
          this.overlayShow = false;
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
              this.$toast('没有查到退回原因')
            }
          } else {
            this.$toast(`${res.data.msg}`);
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
              endDate : '',
              audit: this.userInfo.extendData.projectAudit
            },0,'')
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
        })
      },

      // 任务查看
      taskView (item) {
        this.changeRepairsWorkOrderMsg(item);
        setStore('repairsWorkOrderMsg',item);
        if (item.state == 8) {
          this.$router.push({path: 'workOrderCheck'});
          this.changeTitleTxt({tit:'工单审核'});
          setStore('currentTitle','工单审核');
        } else {
          this.$router.push({path: 'workOrderDetails'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工单详情')
        }
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
    .checkDialog {
      /deep/ .van-dialog {
        width: 90% !important;
        top: 50% !important;
        .van-dialog__content {
          height: 209px;
          padding: 20px;
          margin: 0 !important;
          box-sizing: border-box;
          .close-icon {
            text-align: right
          };
          .check-text {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #101010;
            height: 100px;
          };
          .btn-area {
            display: flex;
            justify-content: center;
            .no-btn {
              width: 32%;
              height: 36px;
              text-align: center;
              line-height: 36px;
              border: 1px solid #0A7AF5;
              border-radius: 7px;
              font-size: 14px;
              color: #0A7AF5;
              margin-right: 60px;
            };
            .yes-btn {
              width: 32%;
              height: 36px;
              text-align: center;
              line-height: 36px;
              background: #0A7AF5;
              border-radius: 7px;
              font-size: 14px;
              color: #fff
            }
          }
        }
      }
    };
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
      box-sizing: border-box;
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
            right: 8px;
            font-size: 13px;
            color: #8e9397
          };
          .statusWaitSure {
            color: red
          };
          .statusWaitFinish {
            color: @color-theme
          };
          .statusWaitSignature {
            color: #06e606
          };
          .statusWaitCheck {
            color: orange
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
              background: @color-theme
            };
            .view {
              background: @color-theme
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
            color: #bbbaba;
            display: flex;
            align-items: center;
            /deep/ .van-checkbox {
              margin-right: 6px;
            };
            .name {
              max-width: 70%;
              display: inline-block;
              overflow: auto;
              vertical-align: top
            }
          }
          &:last-child {
            margin-bottom: 0
          }
        }
      };
      .content-list-complete-task-wrapper {

      }
    };
    .bottom-check-area {
      width: 100%;
      position: fixed;
      left: 0;
      bottom: 0;
      height: 78px;
      display: flex;
      justify-content: space-between;
      padding: 20px 10px;
      box-sizing: border-box;
      background: #fff;
      .check-area-left {
        height: 37px;
        display: flex;
        align-items: center;
        /deep/ .van-checkbox {
          .van-icon {
            border: 1px solid #3B9DF9 !important
          }; 
          .van-checkbox__label {
            font-size: 14px !important;
            color: #101010 !important;
          }
        }
      };
      .check-area-right {
        width: 140px;
        height: 37px;
        text-align: center;
        line-height: 37px;
        background: #2C65F7;
        border-radius: 4px;
        font-size: 14px;
        color: #fff;
      };
      .checkAreaRightStyle {
        background: #e4e4e4 !important;
      }
    }
  }
</style>
