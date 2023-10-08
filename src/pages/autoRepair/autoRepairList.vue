<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <!-- 图片放大弹框  -->
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>
    <div class="nav">
       <van-nav-bar
        title="自主报修"
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
           <van-icon name="plus"  @click="onClickRight" />
        </template>
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
            <van-empty description="暂无数据" v-show="repairsTaskEmptyShow" />
            <div class="list-box" ref="repairListBox">
                <div class="repair-list" @click="enterTaskDetailsEvent">
                    <div class="list-line-one">
                        <div class="list-line-one-left">
                            <span>工单号: </span>
                            <span>xdsasa12</span>
                        </div>
                        <div class="list-line-one-right">
                            <span>2023-08-17 14:00</span>
                        </div>
                    </div>
                    <div class="list-line-two">
                        <span>类型: </span>
                        <span>杀就杀大大</span>
                    </div>
                    <div class="list-line-three">
                        <span>概述: </span>
                        <span>杀就杀飒飒飒飒撒大大</span>
                    </div>
                    <div class="list-line-four">
                        <div>问题图片</div>
                        <div>
                            <img :src="statusBackgroundPng" alt="" @click.stop="enlareEvent(statusBackgroundPng)">
                            <img :src="statusBackgroundPng" alt="">
                            <img :src="statusBackgroundPng" alt="">
                            <img :src="statusBackgroundPng" alt="">
                            <img :src="statusBackgroundPng" alt="">
                        </div>
                    </div>
                </div>
            </div>    
        </div> 
    </div> 
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {userSignOut} from '@/api/login.js'
import { assignRepairsTask, delayRepairsTask, cancelRepairsTask } from '@/api/taskScheduling.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { setStore,removeAllLocalStorage } from '@/common/js/utils'
import SelectSearch from "@/components/SelectSearch";
export default {
  name: "AutoRepairList",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      isLoadingRepairsTask: false,
      repairsTaskEmptyShow: false,
      loadingText: '加载中',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      moveInfo: {
        startX: ''
      },
      loadFreshTimer: null,
      isLoadMore: true,
      currentPageList: [],
      repairsTaskList: [],
      eventTime: 0,
      totalCount: '',
      currentPage: 1,
      pageSize: 10,
      currentImgUrl: '',
      imgBoxShow: false,
      overlayShow: false
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/home');
     this.$nextTick(()=> {
      try {
        this.initScrollChange();
      } catch (error) {
        this.$toast({
            type: 'fail',
            message: error
        })
      }
    });
    // this.getRepairsList(false)
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","schedulingTaskDetails","schedulingTaskAboutMessage","operateBtnClickRecord"]),
    proId () {
      return this.userInfo.extendData.proId
    }
  },

  methods: {
    ...mapMutations(["changeTitleTxt","changeCatchComponent","changeOverDueWay","changeOperateBtnClickRecord"]),

    onClickLeft() {
      this.$router.push({ path: "/home"})
    },

    onClickRight() {
      this.$router.push({ path: "/autoRepairCreate" })
    },

    // 元素滚动事件
    initScrollChange () {
        let boxBackScroll = this.$refs['repairListBox'];
        boxBackScroll.addEventListener('scroll',this.repairListLoadMore,true)
    },

    // 自主报修任务列表加载事件
    repairListLoadMore () {
      if (!this.isLoadMore) { return };
      let boxBackScroll = this.$refs['repairListBox'];
      if (Math.ceil(boxBackScroll.scrollTop) + boxBackScroll.offsetHeight >= boxBackScroll.scrollHeight) {
        if (this.eventTime) {return};
        this.eventTime = 1;
        this.timeTwo = setTimeout(() => {
          let totalPage = Math.ceil(this.totalCount/this.pageSize);
          if (this.currentPage >= totalPage) {
          } else {
            this.currentPage = this.currentPage + 1;
            this.loadingShow = true;
            this.overlayShow = true;
            this.loadText = '加载中...';
            this.getRepairsList(true)
          };
          this.eventTime = 0
        },300)
      }
    },

    // 自主报修任务列表
    getRepairsList (flag) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.repairsTaskEmptyShow = false;
      repairsList(-3,this.proId,1)
      .then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.loadingText = '';
        if (res && res.data.code == 200) {
          // 是否上拉加载
          if (flag) {
            this.isLoadingRepairsTask = false;
            this.$toast('加载成功');
          };
          this.repairsTaskList = this.repairsTaskList.concat(currentPageList);
          if (this.repairsTaskList.length == 0) {
            this.repairsTaskEmptyShow = true
          }
        } else {
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
        if (flag) {
          this.isLoadingRepairsTask = false;
          this.$toast('刷新失败,请检查网络');
          if (this.loadFreshTimer) {
            clearTimeout(this.loadFreshTimer)
          };
          return
        };
        this.$toast({
          type: 'fail',
          message: err.message
        })
      })
    },

    // 处理维修任务空间信息
    disposeCheckType (item) {
      if (!item) { return };
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.name)
      };
      return temporaryArray.join('、')
    },

    // 处理维修任务参与者
    disposeTaskPresent (item) {
      if (!item) { return };
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.name)
      };
      return temporaryArray.join('、')
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

    // 进入任务详情事件
    enterTaskDetailsEvent () {
        this.$router.push({ path: "/autoRepairHistoryRecord" })
    },

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 优先级转换
    taskPriotityTransition (state) {
      switch(state) {
        case 1 :
          return '正常'
          break;
        case 2 :
          return '紧急'
          break;
        case 3 :
          return '重要'
          break;
        case 4 :
          return '紧急重要'
          break
      }
    },

    // 任务状态转换
    taskStatusTransition (state) {
      switch(state) {
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
          return '待签字'
          break
      }
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
  /deep/ .van-popup--right {
    padding: 20px 0 80px 0;
    box-sizing: border-box;
    .top-icon {
        padding-left: 10px;
        box-sizing: border-box
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
        padding: 0 6px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: auto;
        background: #f7f7f7;
        z-index: 10;
        position: relative;
        .list-box {
            .repair-list {
                background: #fff;
                border-radius: 4px;
                padding: 10px 10px 6px 16px;
                box-sizing: border-box;
                margin-top: 10px;
                .list-line-one {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    .list-line-one-left {
                        padding-right: 4px;
                        box-sizing: border-box;
                        flex: 1;
                        width: 0;
                        display: flex;
                        >span {
                            font-size: 12px;
                            color: #BEC7D1;
                            &:first-child {
                                margin-right: 4px;
                            };
                            &:last-child {
                                flex: 1;
                                .no-wrap()
                            }
                        }
                    };
                    .list-line-one-right {
                        >span {
                            font-size: 12px;
                            color: #BEC7D1;
                        }    
                    }
                };
                .list-line-two {
                    margin-top: 10px;
                    >span {
                        line-height: 20px;
                        font-size: 14px;
                        font-weight: bold;
                        color: #00070F;  
                    }
                };
                .list-line-three {
                    margin-top: 10px;
                    >span {
                        line-height: 20px;
                        font-size: 14px;
                        font-weight: bold;
                        color: #00070F;  
                    }
                };
                .list-line-four {
                    margin-top: 10px;
                    display: flex;
                    flex-direction: column;
                    >div {
                        &:first-child {
                            font-size: 14px;
                            font-weight: bold;
                            color: #00070F; 
                            margin-bottom: 6px; 
                        };
                        &:last-child {
                            display: flex;
                            flex-wrap: wrap;
                            >img {
                                width: 23.5%;
                                height: 70px;
                                margin-right: 2%;
                                &:nth-child(4n) {
                                    margin-right: 0 !important
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
</style>