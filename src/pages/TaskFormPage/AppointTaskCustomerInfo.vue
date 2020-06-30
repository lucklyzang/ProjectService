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
      <h3>客户预约信息</h3>
      <div class="custormer-info">
        <van-field disabled v-model="patientName" label="病人姓名"/>
        <van-field  disabled v-model="sex" label="病人性别"/>
        <van-field  disabled v-model="age" label="病人年龄"/>
        <van-field  disabled v-model="bedNumber" label="病人床号"/>
        <van-field  disabled v-model="number" label="任务编号"/>
        <van-field
          v-model="appointDescribe"
          rows="1"
          autosize
          disabled
          label="描述"
          type="textarea"
        />
      </div>
    </div>
    <div class="customerInfo-box"></div>
    <div class="electronic-signature">
      <ElectronicSignature></ElectronicSignature>
    </div>
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="appointMessageSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="appointMessageCancel">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import ElectronicSignature from '@/components/ElectronicSignature'
import FooterBottom from '@/components/FooterBottom'
import {queryCustomerAppointInfo,sureCustomerAppointInfo,updateAppointTaskMessage} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, checkEmptyArray, deepClone, querySampleName } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'appointTaskCustomerInfo',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      appointDescribe: '',
      patientName: '',
      sex: '',
      age: '',
      bedNumber: '',
      number: '',
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png')
    };
  },

  components:{
    VanFieldSelectPicker,
    HeaderTop,
    NoData,
    FooterBottom,
    ElectronicSignature
  },

  computed: {
    ...mapGetters([
      'navTopTitle',
      'appointTaskMessage',
      'appointTaskState',
      'currentElectronicSignature',
      'isCompleteSweepCodeList'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    taskId () {
      return this.appointTaskMessage.id
    },
  },

  mounted () {
    console.log(this.appointTaskMessage);
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        this.changeCurrentElectronicSignature({DtMsg: null});
        this.$router.push({path:'/appointTask'});
        this.changeTitleTxt({tit:'预约任务'});
        setStore('currentTitle','预约任务')
      })
    };
    this.echoCustomerInfo()
  },

  methods: {
    ...mapMutations([
      'changeTitleTxt',
      'changeCurrentElectronicSignature',
      'changeIsCompleteSweepCodeList',
      'changeAppointSweepCodeIntoPage',
      'changeCatchComponent'
    ]),
    // 右边下拉框菜单点击
    leftLiCLick (index) {
      this.liIndex = index;
      localStorage.clear();
      this.$router.push({path:'/'})
    },

     // 性别转换
      sexTransfer (index) {
        switch(index) {
          case 0 :
            return '未指定'
            break;
          case 1 :
            return '男'
            break;
          case 2 :
            return '女'
            break;
          default:
            return '未指定'
        }
      },

    // 回显客户预约信息
    echoCustomerInfo () {
      this.patientName = this.appointTaskMessage['patientName'],
      this.sex = this.sexTransfer(this.appointTaskMessage['sex']),
      this.age = this.appointTaskMessage['age'],
      this.bedNumber = this.appointTaskMessage['bedNumber'],
      this.number = this.appointTaskMessage['number'],
      this.appointDescribe = this.appointTaskMessage['taskRemark']
    },

    // 查询客户预约信息
    getCustomerAppointInfo (data) {
      queryCustomerAppointInfo(data).then((res) => {
        if (res && res.data.code == 200) {}
      })
      .catch((err)=>{
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
      })
    },

    // 确认客户信息
    checkCustomerInfo (data) {
      sureCustomerAppointInfo(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true   
          }).then(() => {
          });
          this.updateTaskState({
            proId: this.proId, //当前项目ID
            id: this.appointTaskMessage.id, //当前任务ID
            state: this.appointTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
          });
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        }
      })
      .catch((err)=>{
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
      })
    },

     // 更新任务状态
    updateTaskState (data) {
      updateAppointTaskMessage(data).then((res) => {
        if (res && res.data.code == 200) {
          // 清空该完成任务存储的已扫过出发地科室信息
          let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCodeList);
          temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
          this.changeIsCompleteSweepCodeList(temporarySweepCodeOficeList);
          setStore('completAppointTaskSweepCodeInfo', {"sweepCodeInfo": temporarySweepCodeOficeList});
          this.$router.push({path:'/appointTask'});
          this.changeTitleTxt({tit:'预约任务'});
          setStore('currentTitle','预约任务')
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
    
    // 跳转到我的页
    skipMyInfo () {
      this.leftDownShow = !this.leftDownShow;
    },

    // 预约信息确认
    appointMessageSure () {
      if (!this.currentElectronicSignature) {
        this.$dialog.alert({
          message: '签名不能为空,请确认签名',
          closeOnPopstate: true
        }).then(() => {
        });
        return
      };
      this.checkCustomerInfo({
        id: this.taskId,//任务Id,必填项
			  proId: this.proId,//项目ID，必填项
			  ensureSign: this.currentElectronicSignature //base64字符串 必填项
      })
    },

    // 预约信息取消
    appointMessageCancel () {

    },

    // 返回上一页
    backTo () {
      this.changeCurrentElectronicSignature({DtMsg: null});
      this.$router.push({path:'/appointTask'});
      this.changeTitleTxt({tit:'预约任务'});
      setStore('currentTitle','预约任务')
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
      .left-dropDown {
      .rightDropDown
    }
    font-size: 14px;
    .sweep-code-title {
      height: 30px;
      line-height: 30px;
      padding-left: 10px;
      h3 {
        font-size: 14px;
        color: #1699e8
      }
    };
    .customerInfo-box {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      margin: 10px 0;
    };
    .electronic-signature {
      height: 250px
    }
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