<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadinText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
    <!-- <NavBar path="/AutoRepairCreate" title="工单完成签名" :leftArrow="false" :leftText="null" /> -->
    </div>
    <div class="content">
      <div class="content-left">
        <ElectronicSignature ref="mychild"></ElectronicSignature>
        <div class="btn-area">
          <div class="cancel-btn" @click="cancel">
            <span>取</span>
            <span>消</span>
          </div>
          <div class="overwrite-btn" @click="rewrite">
            <span>重</span>
            <span>写</span>
          </div>
          <div class="sure-btn" @click="sure">
            <span>确</span>
            <span>认</span>
          </div>
        </div> 
      </div>
      <div class="content-right">
        <span>工</span>
        <span>单</span>
        <span>完</span>
        <span>成</span>
        <span>签</span>
        <span>名</span>
      </div>
    </div>
  </div>
</template>
<script>
import ElectronicSignature from '@/components/ElectronicSignature'
import { mapGetters, mapMutations } from "vuex";
import { rotateBase64Img } from '@/common/js/utils';
import { uploadRepairsTaskPhoto, completeRepairsTaskFinal } from '@/api/worker.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "AutoRepairTaskSignature",
  components: {
    ElectronicSignature
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      loadingShow: false,
      isExpire: false,
      isAllTaskComplete: true,
      loadinText: '提交中',
      fromPathSource: '',
      imgOnlinePathArr: [],
      currentTaskSetId: '',
      timeTabIndex: 0,
      taskSetTime: '',
      taskSetName: '',
      taskSetNameIndex: 0,
      allPatrolTaskDetailsData: [],
      timeList: []
    }
  },

  mounted() {
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      vm.fromPathSource = from.path
	  });
    next() 
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","submitAutoRepairTaskMessage","currentElectronicSignature","createAutoRepairTaskMessage","patrolTaskListMessage","ossMessage","timeMessage","originalSignature","devicePatrolDetailsSelectMessage"]),
     proId () {
        return this.userInfo.extendData.proId
      },
      proName () {
        return this.userInfo.extendData.proName
      },
      workerId () {
        return this.userInfo.extendData.userId
      },
      name () {
        return this.userInfo.name
      }
  },

  methods: {
    ...mapMutations(["changeOssMessage","changeTimeMessage","changePatrolTaskListMessage","changeCreateAutoRepairTaskMessage"]),


    resizeScreen() {
      const _this = this;
      // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
      const detectOrient = function() {
        let width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        $wrapper = _this.$refs.wrapper, // 页面最外层元素
          style = "";
        if (width >= height) {
          // 横屏
          style += "width:" + width + "px;"; // 注意旋转后的宽高切换
          style += "height:" + height + "px;";
          style += "-webkit-transform: rotate(0); transform: rotate(0);";
          style += "-webkit-transform-origin: 0 0;";
          style += "transform-origin: 0 0;";
        } else {
          // 竖屏
          console.log('竖屏了');
          style += "width:" + height + "px;";
          style += "height:" + width + "px;";
          style += "min-height:auto;";
          style +=
            "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
          // 注意旋转中点的处理
          style +=
            "-webkit-transform-origin: " +
            width / 2 +
            "px " +
            width / 2 +
            "px;";
          style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        }
        $wrapper.style.cssText = style;
      };
      window.onresize = detectOrient;
      detectOrient()
    },

    // 签名重写
    rewrite () {
      this.$refs.mychild.overwrite()
    },

    // 签名确认
    sure () {
      this.$refs.mychild.commitSure();
      if (this.currentElectronicSignature == this.originalSignature || !this.currentElectronicSignature) {
        this.$toast('签名不能为空');
        return
      };
      // canvas签名旋转
      rotateBase64Img(this.currentElectronicSignature,-90,this.signatureRotateCallback)
  },
  
  //canvas签名旋转完成回调
  signatureRotateCallback (signatureValue) {
    this.loadinText = '上传中,请稍等···';
    this.loadingShow = true;
    this.overlayShow = true;
    let photoMsg = {
      taskId: this.$route.query.taskId,  //任务ID
      images: []
    };
    photoMsg.images = [];
    photoMsg.images.push({
      imgType: 0,
      image: signatureValue
    });
    uploadRepairsTaskPhoto(photoMsg)
    .then((res) => {
      this.loadingShow = false;
      this.overlayShow = false;
      if (res && res.data.code == 200) {
        this.$toast(`${res.data.msg}`);
        this.rewrite ();
        this.updateTaskComplete()
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
      this.loadingShow = false;
      this.overlayShow = false
    })
  },
  

  // 更改任务状态为已完成
    updateTaskComplete () {
      this.loadinText = '加载中,请稍等···';
      this.loadingShow = true;
      this.overlayShow = true;
      completeRepairsTaskFinal({
        proId: this.proId,
        taskId: this.$route.query.taskId
      })
      .then((res) => {
        if (res && res.data.code == 200) {
          this.$toast(`${res.data.msg}`);
          // 清除保存的创建自主报修任务信息
          this.changeCreateAutoRepairTaskMessage({});
          this.$router.push({ path: "/autoRepairList" })
        } else {
          this.$toast(`${res.data.msg}`);
        };
        this.loadinText = '';
        this.showLoadingHint = false;
        this.overlayShow = false
      })
      .catch((err) => {
        this.loadinText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        })
      })
    },

    // 签名取消
    cancel () {
      this.$refs.mychild.overwrite();
      this.$router.push({path: '/autoRepairCreate'})
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
  height: 0;
  .van-overlay {
    z-index: 1000 !important
  };
  .van-loading {
    z-index: 10000 !important
  };
  .nav {
    width: 100%;
    height: 46px;
    /deep/ .van-nav-bar {
        .van-nav-bar__left {
        .van-nav-bar__text {
            color: #101010 !important;
            margin-left: 8px !important;
        }
        }
        .van-icon {
            color: #101010 !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
          color: #101010 !important;
          font-size: 16px !important;
          margin: 0 !important;
          margin-left: 2% !important
        }
    }
  };
  .content {
    width: 92%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: row;
    height: 0;
    .content-left {
      display: flex;
      flex: 1;
      flex-direction: column;
      .signature {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        /deep/ .signatureBox {
            width: 100% !important;
            flex: 1
        }
      };
      .btn-area {
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 150px;
        >div {
          font-size: 14px;
          border-radius: 4px;
          margin-right: 20px;
          width: 39px;
          height: 95px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          >span {
            transform: rotate(90deg);
            margin-bottom: 2px
          }
        }
        .cancel-btn {
            background: #1684FC;
            color: #fff

        };
        .overwrite-btn {
            border: 1px solid #1684FC;
            color: #1684FC
        };
        .sure-btn {
            background: #E86F50;
            color: #fff;
            margin-right: 0
        }
      }
    };
    .content-right {
      width: 50px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 20px;
      color: #101010;
      >span {
        transform: rotate(90deg)
      }
    }  
  }
}
</style>