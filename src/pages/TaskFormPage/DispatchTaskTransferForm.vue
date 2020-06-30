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
      <h3>在线的工作人员</h3>
      <van-dropdown-menu>
        <van-dropdown-item v-model="currentPerson" :options="onlinePersonLlist" />
      </van-dropdown-menu>
    </div>
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="transferPersonSure">
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
import {transferDispatchTask} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'dispatchTaskTransferForm',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      currentPerson: '',
      onlinePersonLlist: [],
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
        this.$router.push({path:'/dispatchTask'});
        this.changeTitleTxt({tit:'调度任务'});
        setStore('currentTitle','调度任务')
      })
    };
    this.queryOnlineWorker({proId: this.proId, state:''})
  },

  computed:{
    ...mapGetters([
      'dispatchTaskTransferIdList',
      'navTopTitle',
      'userInfo'
    ]),
    proId () {
      return this.userInfo.extendData.proId
    },
    workerId () {
      return this.userInfo.extendData.userId
    },
    workerName () {
      return this.userInfo.userName
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt'
    ]),

    // 获取在线工作人员
    queryOnlineWorker (data) {
      getWorkerMessage(data).then((res) => {
        if (res && res.data.code == 200) {
          this.onlinePersonLlist = [];
          for (let item of res.data.data) {
            let temporaryWorkerMessageArray = [];
            for (let innerItem in item) {
              if (innerItem == 'id') {
                temporaryWorkerMessageArray.push(item[innerItem])
              };
              if (innerItem == 'workerName') {
                temporaryWorkerMessageArray.push(item[innerItem])
              }
            };
            this.onlinePersonLlist.push({text: temporaryWorkerMessageArray[1], value: temporaryWorkerMessageArray[0]})
          };
        }
      })
      .catch((err) => {
        console.log(err)
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
      this.$router.push({path:'/dispatchTask'});
      this.changeTitleTxt({tit:'调度任务'});
      setStore('currentTitle','调度任务')
    },

    // 转移任务
    sureTransferDispatchTask (data) {
      transferDispatchTask(data)
      .then((res) => {
        if (res && res.data.code == 200) {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: true
          }).then(() => {
            this.$router.push({path:'/dispatchTask'});
            this.changeTitleTxt({tit:'调度任务'});
            setStore('currentTitle','调度任务')
          });
        } else {
          this.$dialog.alert({
            message: res.data.msg,
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

    // 转移人员确认事件
    transferPersonSure () {
      let taskAcceptName = '';
      let currentCheckWorkerInfo = [];
      currentCheckWorkerInfo = this.onlinePersonLlist.filter((item) => {return item.value == this.currentPerson});
      taskAcceptName = currentCheckWorkerInfo[0]['text'];
      if (taskAcceptName == this.workerName) {
        this.$dialog.alert({
          message: '任务不能转移给自己',
          closeOnPopstate: true
        }).then(() => {
        });
        return
      };
      this.sureTransferDispatchTask ({
        // taskId: this.dispatchTaskTransferIdList[0],
        taskIds: this.dispatchTaskTransferIdList,  //任务ID
        afterId: this.currentPerson,   //任务接受者ID
        afterName: taskAcceptName, //任务接受者姓名
        modifyId: this.workerId,      //转移者ID
        modifyName: this.workerName    //转移者姓名
      })
    },

    // 转移人员取消事件
    transferPersonCancel () {
      this.$router.push({path:'/dispatchTask'});
      this.changeTitleTxt({tit:'调度任务'});
      setStore('currentTitle','调度任务')
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