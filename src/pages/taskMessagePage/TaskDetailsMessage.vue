<template>
  <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon>
    </HeaderTop>
    <div class="transport-type-title">
      <h3></h3>
    </div>
    <div class="transport-type-area">
      <div class="task-content-item"> 
        <div class="office-name">科室名称</div>
        <div class="office-name-specific">
          <p v-show="taskType == '预约任务'">
            起点: {{taskDetailsMessage.setOutPlaceName}}
          </p>
          <p v-show="taskType == '循环任务'">
            起点: <span v-for="(item,index) in taskDetailsMessage.spaces" :key="`${item}-${index}`">{{item.text}}</span>
          </p>
          <p v-show="taskType == '调度任务'">
            起点: {{dispatchMsg.setOutPlaceName}}
          </p>
          <p>
            目的地:
            <span v-for="(item,index) in taskDetailsMessage.spaces" :key="`${item}-${index}`" v-show="taskType == '预约任务'">{{item.text}}</span>
            <span v-for="(item,index) in dispatchMsg.distName" :key="`${item}-${index}`" v-show="taskType == '调度任务'">{{item}}</span>
            <span v-show="taskType == '循环任务'" v-for="(item,index) in circulationMsg.arriveSpaceNameList" :key="`${item}-${index}`">{{item}}</span>
          </p>
        </div>
        <div class="office-name">访问时间</div>
        <div class="office-name-specific">
          <p v-show="taskType == '预约任务'">
            开始时间: {{taskDetailsMessage.createTime}}
          </p>
          <p v-show="taskType == '调度任务'">
            开始时间: {{dispatchMsg.planStartTime}}
          </p>
          <p v-show="taskType !== '循环任务'">
            结束时间: {{taskDetailsMessage.finishTime}}
          </p>
          <p v-show="taskType == '循环任务'" :key="`${value}-${index}`" v-for="(value, key, index) in officeList">
            科室: {{value.name}} <br>
            开始时间: {{value.time}}
          </p>
          <p v-show="taskType == '循环任务'">
            结束时间: {{circulationMsg.finishTime}}
          </p>
        </div>
        <div class="office-name">任务内容</div>
        <div class="office-name-specific">
          <p v-show="taskType !== '调度任务'">
            任务名称: {{taskDetailsMessage.taskTypeName}}
          </p>
          <p v-show="taskType == '调度任务'">
            任务名称: {{dispatchMsg.taskTypeName}}
          </p>
        </div>
        <div class="office-name">转运工具</div>
        <div class="office-name-specific">
          <p v-show="taskType !== '调度任务'">
            工具名称: {{taskDetailsMessage.toolName}}
          </p>
          <p v-show="taskType == '调度任务'">
            工具名称: {{dispatchMsg.toolName}}
          </p>
        </div>
        <div class="office-name">任务状态</div>
        <div class="office-name-specific">
          <p v-show="taskType !== '调度任务'">
            状态: {{stateTransfer(taskDetailsMessage.state)}}
          </p>
           <p v-show="taskType == '调度任务'">
            状态: {{stateTransfer(dispatchMsg.state)}}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import FooterBottom from '@/components/FooterBottom'
import {queryAllDestination, queryTransportTools, generateDispatchTask, quereDeviceMessage} from '@/api/medicalPort.js'
import {queryDispatchTaskMessage, queryCirculationTaskMessage} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, removeBlock } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'taskDetailsMessage',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      liIndex: null,
      dispatchMsg: '',
      circulationMsg: '',
      officeList: {}
    }
  },

  components: {
    HeaderTop,
    NoData,
    FooterBottom,
    VanFieldSelectPicker
  },

  computed: {
    ...mapGetters([
      'navTopTitle',
      'transportantTaskMessage',
      'userInfo',
      'taskDetailsMessage',
      'taskType'
    ]),

    proId () {
      return this.userInfo.extendData.proId
    },
    userName () {
      return this.userInfo.userName
    },
    proName () {
      return this.userInfo.extendData.proName
    },
    workerId () {
      return this.userInfo.extendData.userId
    }
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        if (this.taskType == '调度任务') {
          this.$router.push({path:'/dispatchTask'});
          this.changeTitleTxt({tit:'调度任务'});
          setStore('currentTitle','调度任务');
        } else if (this.taskType == '预约任务') {
          this.$router.push({path:'/appointTask'});
          this.changeTitleTxt({tit:'预约任务'});
          setStore('currentTitle','预约任务')
        } else {
          this.$router.push({path:'/circulationTask'});
          this.changeTitleTxt({tit:'循环任务'});
          setStore('currentTitle','循环任务')
        }
      })
    };
    if (this.taskType == '调度任务') {
      this.getDispatchTaskMessage(this.taskDetailsMessage.id)
    } else if (this.taskType == '循环任务') {
      this.getCirculationTaskMessage(this.taskDetailsMessage.id,this.taskDetailsMessage.createTime)
    }
  },

  methods: {
    ...mapMutations([
      'changeTitleTxt'
    ]),

    // 返回上一页
    backTo () {
      if (this.taskType == '调度任务') {
        this.$router.push({path:'/dispatchTask'});
        this.changeTitleTxt({tit:'调度任务'});
        setStore('currentTitle','调度任务')
      } else if (this.taskType == '预约任务') {
        this.$router.push({path:'/appointTask'});
        this.changeTitleTxt({tit:'预约任务'});
        setStore('currentTitle','预约任务')
      } else {
        this.$router.push({path:'/circulationTask'});
        this.changeTitleTxt({tit:'循环任务'});
        setStore('currentTitle','循环任务')
      }
    },

    // 任务状态转换
      stateTransfer (index) {
        switch(index) {
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
            return '未结束'
            break;
          case 5 :
            return '已延迟'
            break;
          case 6 :
            return '已取消'
            break;
          case 7 :
            return '已完成'
            break;
        }
      },

    // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
      },

      //查询调度任务详情
      getDispatchTaskMessage (taskId) {
        queryDispatchTaskMessage(taskId)
        .then((res) => {
          if (res && res.data.code == 200) {
            this.dispatchMsg = res.data.data;
            console.log('结果',this.dispatchMsg);
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      },

      //查询循环任务详情
      getCirculationTaskMessage (id,date) {
        queryCirculationTaskMessage(id,date)
        .then((res) => {
          if (res && res.data.code == 200) {
            this.circulationMsg = res.data.data;
            this.officeList = JSON.parse(this.circulationMsg.hasAccess)
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      }
  },

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
    .transport-type-title {
    };
    .transport-type-area {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .task-content-item {
        font-size: 16px;
        .office-name {
          padding-left: 10px;
          background: #f2f2f2;
          line-height: 26px;
          margin-bottom: 4px;
          font-size: 17px;
          font-weight: bold
        }
        .office-name-specific {
          padding-left: 10px;
          padding-bottom: 6px;
          color: #5e5c5c;
          p {
            line-height: 22px;
            span {
              margin-right: 4px
            }
          }
        }
      }
    }
  }  
</style>