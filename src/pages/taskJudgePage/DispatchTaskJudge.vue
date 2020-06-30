<template>
  <div class="content-wrapper">
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon>
    </HeaderTop>
    <div class="btn-area" v-show="endTaskShow">
      <van-button type="info" @click="endTask">结束任务</van-button>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import { mapGetters, mapMutations } from 'vuex'
import {updateDispatchTask} from '@/api/workerPort.js'
import { formatTime, setStore, getStore, removeStore, IsPC, deepClone, repeArray, compressImg} from '@/common/js/utils'
export default {
  name: 'dispatchTaskJudge',
  data () {
    return {
      showIsGoOtherDestination: false,
      endTaskShow: false
    };
  },

  components: {
    HeaderTop
  },

  mounted () {
    if (this.showEndTaskBtn) {
      this.endTaskShow = true;
      return
    };
    this.judgeIsGoOtherDestination();
    if (!IsPC()) {
      pushHistory();
      this.gotoURL(() => {
        pushHistory()
      })
    }
  },

  computed: {
    ...mapGetters([
      'navTopTitle',
      'isBack',
      'isSingleDestination',
      'dispatchTaskDepartmentType',
      'isCompleteSweepCode',
      'dispatchTaskMessage',
      'dispatchTaskState',
      'showEndTaskBtn',
      'isCompleteSweepCodeDestinationList'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    proName () {
      return JSON.parse(getStore('userInfo')).extendData.proName
    },
    taskId () {
      return this.dispatchTaskMessage.id
    }
  },

  methods: {
    ...mapMutations([
      'changeTitleTxt',
      'changeisCompleteSweepCode',
      'changeShowEndTaskBtn',
      'changeIsCompleteSweepCodeDestinationList'
    ]),

    // 判断是否为单一目的地
    judgeIsSingleDestination () {
      this.showIsGoOtherDestination = true;
      if (this.isSingleDestination) {
        // 调取结束派送方法
        this.updateTaskState({
          proId: this.proId, //当前项目ID
          id: this.dispatchTaskMessage.id, //当前任务ID
          state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
        })
      } else {
        this.endTaskShow = true
      }
    },

    // 判断是否要去其它目的地
    judgeIsGoOtherDestination () {
      this.$router.push({'path':'/dispatchTaskSweepCode'});
      this.changeTitleTxt({tit:'扫码'});
      setStore('currentTitle','扫码')
      // this.$dialog.confirm({
      //   message: '是否要去其它目的地?',
      //   closeOnPopstate: false,
      //   confirmButtonText: '是',
      //   cancelButtonText: '否'
      // })
      // .then(() => {
      //   this.$router.push({'path':'/dispatchTaskSweepCode'});
      //   this.changeTitleTxt({tit:'扫码'});
      //   setStore('currentTitle','扫码')
      // })
      // .catch(() => {
      //   this.judgeIsGoDeparture()
      // })
    },

    // 判断是否需要要回到出发地 0不回 1回
    judgeIsGoDeparture () {
      if (this.isBack == 1) {
        // 需要回到出发地时更新任务状态为4未结束
        this.updateTaskState({
          proId: this.proId, //当前项目ID
          id: this.dispatchTaskMessage.id, //当前任务ID
          state: 4//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
        })
      } else {
        this.judgeIsSingleDestination()
      }
    },

    // 提示结束手动任务
    judgeEndTask () {
      this.$dialog.alert({
        message: '请手动结束任务',
      }).then(() => {
        
      });
    },

    // 返回上一页
    backTo () {
      if (this.endTaskShow) {
        this.judgeEndTask();
        return
      };
      this.$router.push({'path':'/dispatchTaskSweepCode'});
      this.changeTitleTxt({tit:'扫码'});
      setStore('currentTitle','扫码')
    },

    // 更新任务状态
    updateTaskState (data) {
      updateDispatchTask(data).then((res) => {
        if (res && res.data.code == 200) {
          if ((this.dispatchTaskDepartmentType == 1 && this.isSingleDestination && this.dispatchTaskState != 4) || (this.dispatchTaskState == 7)) {
            this.$dialog.alert({
              message: '该条任务已完成',
              closeOnPopstate: true
            }).then(() => {
            });
            // 清空该完成任务存储的已扫过非单一目的地科室信息
            let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCodeDestinationList);
            temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
            this.changeIsCompleteSweepCodeDestinationList(temporarySweepCodeOficeList);
            setStore('completeDispatchSweepCodeDestinationInfo', {"sweepCodeInfo": temporarySweepCodeOficeList})
          };
          // 清空该完成任务存储的已扫过科室信息
          let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCode);
          temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
          this.changeisCompleteSweepCode(temporarySweepCodeOficeList);
          setStore('completeDispatchSweepCodeInfo', {"sweepCodeInfo": temporarySweepCodeOficeList});
          if (this.endTaskShow) {
            this.endTaskShow = false;
            this.changeShowEndTaskBtn(false)
          };
          this.$router.push({path:'/dispatchTask'});
          this.changeTitleTxt({tit:'调度任务'});
          setStore('currentTitle','调度任务')
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

    // 手动结束方法
    endTask () {
      this.updateTaskState({
        proId: this.proId, //当前项目ID
        id: this.dispatchTaskMessage.id, //当前任务ID
        state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
      })
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
    position: relative;
    font-size: 14px;
    .btn-area {
      width: 100%;
      position: absolute;
      bottom: 20px;
      left: 0;
      height: 80px;
      text-align: center;
      line-height: 80px;
    }
  }
</style>