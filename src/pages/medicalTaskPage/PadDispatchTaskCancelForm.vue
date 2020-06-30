<template>
   <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      <!-- <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon>  -->
    </HeaderTop>
     <!-- 右边下拉框菜单 -->
    <ul class="left-dropDown" v-show="leftDownShow">
      <li v-for="(item, index) in leftDropdownDataList" :key="index" :class="{liStyle:liIndex == index}" @click="leftLiCLick(index)">{{item}}</li>
    </ul>
    <div class="sweep-code-title">
      <h3>取消原因</h3>
      <van-dropdown-menu>
        <van-dropdown-item v-model="taskCancelReason" :options="cancelReasonLlist" />
      </van-dropdown-menu>
    </div>
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="canceltaskSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="transferPersonCancel">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import FooterBottom from '@/components/FooterBottom'
import {getWorkerMessage} from '@/api/login.js'
import {queryDispatchTaskCancelReason, updateDispatchTask, cancelDispatchTaskBatch} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'padDispatchTaskCancelForm',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      taskCancelReason: '',
      cancelReasonLlist: [],
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png')
    };
  },

  components:{
    HeaderTop,
    NoData,
    FooterBottom
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        this.changeIsFreshHomePage(true);
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'中央运送'});
        setStore('currentTitle','中央运送')
      })
    };
    this.getDispatchTaskCancelReason({proId: this.proId, state: 0})
  },

  computed:{
    ...mapGetters([
      'navTopTitle',
      'taskTranceMsg'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    workerId () {
      return JSON.parse(getStore('userInfo')).extendData.userId
    },
    workerName () {
      return JSON.parse(getStore('userInfo')).userName
    },
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeIsFreshHomePage'
    ]),

    // 获取取消原因列表
    getDispatchTaskCancelReason (data) {
      queryDispatchTaskCancelReason(data).then((res) => {
        if (res && res.data.code == 200) {
          this.cancelReasonLlist = [];
          for (let item of res.data.data) {
            let temporaryWorkerMessageArray = [];
            for (let innerItem in item) {
              if (innerItem == 'id') {
                temporaryWorkerMessageArray.push(item[innerItem])
              };
              if (innerItem == 'cancelName') {
                temporaryWorkerMessageArray.push(item[innerItem])
              }
            };
            this.cancelReasonLlist.push({text: temporaryWorkerMessageArray[1], value: temporaryWorkerMessageArray[1]})
          };
        }
      })
      .catch((err) => {
        console.log(err)
      })
    },

     // 调度任务的取消
      cancelDispatchTask (data) {
        updateDispatchTask(data)
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            this.$router.push({path: 'home'});
            this.changeTitleTxt({tit:'中央运送'});
            setStore('currentTitle','中央运送')
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
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

    // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

    // 返回上一页
    backTo () {
      this.changeIsFreshHomePage(true);
      this.$router.push({path: 'home'});
      this.changeTitleTxt({tit:'中央运送'});
      setStore('currentTitle','中央运送')
    },


    // 取消原因确认事件
    canceltaskSure () {
      if (!this.taskCancelReason) {
        this.$toast('请选择退回原因');
        return
      };
      this.cancelDispatchTask({
        proId: this.proId,	//当前项目ID
        id: this.taskTranceMsg.id, //当前任务ID
        state: 6, //取消后的状态
        cancelReason: this.taskCancelReason //取消原因
      })
    },

    // 取消原因取消事件
    transferPersonCancel () {
      this.$router.push({path: 'home'});
      this.changeTitleTxt({tit:'中央运送'});
      setStore('currentTitle','中央运送')
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
      .left-dropDown {
      .rightDropDown
    }
    .sweep-code-title {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      h3 {
        height: 30px;
        margin-top: 10px;
        line-height: 30px;
        padding-left: 10px;
        font-size: 14px;
        color: #1699e8
      }
    };
    .btn-area {
      height: 80px;
      text-align: center;
      line-height: 80px;
      span {
        .bottomButton;
        display: inline-block;
        margin-top: 15px;
        img {
          width: 100%;
          height: 100%
        }
      }
    }
  }
</style>