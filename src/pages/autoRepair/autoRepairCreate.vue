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
           <van-icon name="scan" @click="onClickRight" />
        </template>
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
            <div class="message-box">
               
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
  name: "AutoRepairCreate",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      loadingText: '加载中',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      moveInfo: {
        startX: ''
      },
      currentImgUrl: '',
      imgBoxShow: false,
      overlayShow: false
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/autoRepairList')
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

    onClickRight() {

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
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        background: #f7f7f7;
        z-index: 10
    }
  }
}
</style>