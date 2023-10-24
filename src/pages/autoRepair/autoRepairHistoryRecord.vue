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
        title="自主报修历史记录"
        left-text=""
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
    >
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box" v-if="isLoadComplete">
           <div class="problem-description-box">
               <div class="problem-description-tit">
                  问题描述
               </div>
               <div class="problem-description-content">
                   <div class="line-content">
                       <span>类型</span>
                       <span>{{ taskMessage.typeName }}</span>
                   </div>
                   <div class="line-content">
                       <span>建筑</span>
                       <span>{{ taskMessage.structName }}</span>
                   </div>
                   <div class="line-content">
                       <span>科室</span>
                       <span>{{ taskMessage.depName }}</span>
                   </div>
                   <div class="line-content">
                       <span>房间</span>
                       <span>{{ disposeCheckType(taskMessage.spaces) }}</span>
                   </div>
                   <div class="list-line-image">
                        <div>问题图片</div>
                        <div>
                            <img v-for="(innerItem,innerIndex) in taskMessage.images" :key="innerIndex" :src="innerItem.path" alt="" @click.stop="enlareEvent(innerItem.path)">
                        </div>
                    </div>
                    <div class="issue-content">
                        <div class="issue-left">
                            问题描述
                        </div>
                        <div class="issue-right">
                            {{ taskMessage.taskDesc }}
                        </div>
                    </div>
               </div>
           </div>
           <div class="maintenance-record-box">
               <div class="maintenance-record-tit">
                   <span>维修记录</span>
               </div>
               <div class="maintenance-record-content">
                    <div class="line-content">
                       <span>维修员</span>
                       <span>{{ taskMessage.workerName }}</span>
                   </div>
                   <div class="line-content">
                       <span>参与人</span>
                       <span>{{ disposeTaskPresent(taskMessage.present) }}</span>
                   </div>
                    <div class="list-line-image">
                        <div>修复图片</div>
                        <div>
                            <img v-for="(innerItem,innerIndex) in taskMessage.repairImg" :key="innerIndex" :src="innerItem.path" @click.stop="enlareEvent(innerItem.path)">
                        </div>
                    </div>
               </div>
           </div>
           <div class="use-material-box">
              <div class="material-tit">
                <span>使用物料</span>
              </div>
              <div class="material-content">
                <div class="material-list" v-for="(item,index) in taskMessage.materials" :key="index">
                  <div class="material-list-left">
                    <span>{{ index+1 }}</span>
                    <span>{{ `${item.mateName}-${item.model}` }}</span>
                  </div>
                  <div class="material-list-right">
                    <span>{{ item.number }}</span>
                  </div>
                </div>
              </div>
           </div>
           <div class="signature-box">
            <div class="signature-tit">
              <span>签字</span>
            </div>
            <div class="signature-content">
              <img v-if="taskMessage.signImg.length > 0 && taskMessage.signImg[0].hasOwnProperty('path')" :src="taskMessage.signImg[0]['path']">
            </div>
           </div>
        </div>
    </div> 
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import SelectSearch from "@/components/SelectSearch";
export default {
  name: "AutoRepairHistoryRecord",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      isLoadComplete: false,
      loadingText: '加载中',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      moveInfo: {
        startX: ''
      },
      currentImgUrl: '',
      taskMessage: {},
      imgBoxShow: false,
      overlayShow: false
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/autoRepairList');
    this.taskMessage = this.$route.params;
    this.isLoadComplete = true
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
      this.$router.push({ path: "/autoRepairList"})
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
    /deep/ .van-dialog {
      top: 50% !important;
      max-height: 98vh;
      display: flex;
      flex-direction: column;
      .van-dialog__content {
        flex: 1;
        overflow: auto;
        >img {
          width: 100%;
        }
      };
      .van-dialog__footer {
        .van-dialog__confirm {
          background: #f2f2f2
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
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        overflow: auto;
        background: #f7f7f7;
        z-index: 10;
        .problem-description-box {
            .problem-description-tit {
                font-size: 14px;
                font-weight: bold;
                color: #101010;
                height: 35px;
                line-height: 35px;
                padding-left: 10px;
                box-sizing: border-box; 
            };
            .problem-description-content {
                .line-content {
                    padding: 14px;
                    box-sizing: border-box;
                    background: #fff;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    >span {
                        display: inline-block;
                        font-size: 14px;
                        &:first-child {
                            color: #9E9E9A
                        };
                        &:last-child {
                            flex: 1;
                            word-break: break-all;
                            line-height: 18px;
                            text-align: right;
                            padding-left: 6px;
                            font-weight: bold;
                            color: #101010;
                        }
                    }
                };
                .list-line-image {
                    display: flex;
                    flex-direction: column;
                    >div {
                        &:first-child {
                            font-size: 14px;
                            color: #9E9E9A; 
                            height: 40px;
                            line-height: 40px;
                            padding-left: 14px;
                            box-sizing: border-box
                        };
                        &:last-child {
                            display: flex;
                            padding-left: 10px;
                            box-sizing: border-box;
                            flex-wrap: wrap;
                            >img {
                                width: 18.4%;
                                height: 70px;
                                margin-right: 2%;
                                margin-bottom: 10px;
                                &:nth-child(5n) {
                                    margin-right: 0 !important
                                }
                            }
                        }    
                    }
                };
                .issue-content {
                    background: #fff;
                    padding: 14px;
                    margin-top: 10px;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: space-between;
                    .issue-left {
                        font-size: 14px;
                        color: #9E9E9A
                    };
                    .issue-right {
                        padding-left: 10px;
                        box-sizing: border-box;
                        text-align: right;
                        word-break: break-all;
                        font-size: 14px;
                        font-weight: bold;
                        color: #101010;
                        flex: 1;
                        line-height: 18px
                    }
                }
            }
        };
        .maintenance-record-box {
            .maintenance-record-tit {
                font-size: 14px;
                color: #101010;
                height: 35px;
                line-height: 35px;
                padding-left: 10px;
                box-sizing: border-box;
                >span {
                  font-weight: bold;
                } 
            };
            .maintenance-record-content {
               .line-content {
                    padding: 14px;
                    box-sizing: border-box; 
                    background: #fff;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    >span {
                        display: inline-block;
                        font-size: 14px;
                        &:first-child {
                          color: #9E9E9A
                        };
                        &:last-child {
                            flex: 1;
                            line-height: 18px;
                            word-break: break-all;
                            text-align: right;
                            padding-left: 6px;
                            font-weight: bold;
                            color: #101010;
                        }
                    }
                };
                .list-line-image {
                    display: flex;
                    flex-direction: column;
                    >div {
                        &:first-child {
                            font-size: 14px;
                            color: #9E9E9A; 
                            height: 40px;
                            line-height: 40px;
                            padding-left: 14px;
                            box-sizing: border-box
                        };
                        &:last-child {
                            display: flex;
                            padding-left: 10px;
                            box-sizing: border-box;
                            flex-wrap: wrap;
                            >img {
                                width: 18.4%;
                                height: 70px;
                                margin-right: 2%;
                                margin-bottom: 10px;
                                &:nth-child(5n) {
                                    margin-right: 0 !important
                                }
                            }
                        }    
                    }
                }
            }
        };
        .use-material-box {
          .material-tit {
            font-size: 14px;
            background: #fff;
            color: #101010;
            height: 35px;
            line-height: 35px;
            padding-left: 10px;
            margin-top: 10px;
            box-sizing: border-box;
            >span {
              font-weight: bold;
            } 
          };
          .material-content {
            padding: 10px;
            box-sizing: border-box;
            background: #fff; 
            .material-list {
              height: 40px;
              background: #f7f7f7;
              display: flex;
              align-items: center;
              border-radius: 2px;
              justify-content: space-between;
              margin-bottom: 6px;
              .material-list-left {
                display: flex;
                flex: 1;
                width: 0;
                >span {
                  font-size: 14px;
                  color: #101010;
                  &:first-child {
                    text-align: center;
                    width: 40px;
                    color: #333
                  };
                  &:last-child {
                    flex: 1;
                    .no-wrap()
                  }
                }
              };
              .material-list-right {
                width: 40px;
                font-size: 14px;
                color: #101010
              };
            }
          }
        };
        .signature-box {
          .signature-tit {
            font-size: 14px;
            color: #101010;
            height: 35px;
            line-height: 35px;
            padding-left: 10px;
            box-sizing: border-box;
            >span {
              font-weight: bold;
            } 
          };
          .signature-content {
            padding: 10px;
            box-sizing: border-box;
            background: #fff;
            >img {
              width: 100%;
              background: #e9e9e9;
            } 
          }
        }
    }
  }
}
</style>