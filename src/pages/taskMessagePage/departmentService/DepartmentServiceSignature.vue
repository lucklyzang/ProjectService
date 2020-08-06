<template>
  <div class="content-wrapper">
    <van-overlay :show="overlayShow" />
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <div class="loading">
        <loading :isShow="showLoadingHint" :textContent="loadinText" textColor="#2895ea"></loading>
      </div>
      <!-- 内容部分 -->
      <div class="content-top" ref="contentTop">
        <ElectronicSignature ref="mychild"></ElectronicSignature>
      </div>
      <div class="content-bottom">
        <span @click="sure">确认</span>
        <span @click="rewrite">重写</span>
        <span @click="cancel">取消</span>
      </div>
    </div>
  </div>
</template>
<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import ElectronicSignature from '@/components/ElectronicSignature'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage } from '@/common/js/utils'
  import {submitDepartMentServiceSignInfo, updateDepartmentServiceTaskBeCompleted} from '@/api/worker.js'
  export default {
    name: 'DepartmentServiceSignature',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker,
      ElectronicSignature,
      Loading
    },
    data() {
      return {
        showLoadingHint: false,
        loadinText: '',
        overlayShow: false
      }
    },
    
    mounted() {
      this.$refs.contentTop.style.zIndex = 100;
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'departmentWorkOrderDeatils'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工单详情')
        })
      }
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'currentElectronicSignature',
        'userInfo',
        'originalSignature',
        'departmentServiceMsg',
        'completeDepartmentServiceOfficeInfo'
      ]),
      userName () {
       return this.userInfo.userName
      },
      userTypeId () {
        return this.userInfo.extendData.user_type_id
      },
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
      },
      taskId () {
        return this.departmentServiceMsg.id
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeCompleteDepartmentServiceOfficeInfo'
      ]),

      //返回上一页
      backTo () {
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
      },

      // 确认
      sure () {
        this.$refs.mychild.commitSure();
        if (this.currentElectronicSignature == this.originalSignature || !this.currentElectronicSignature) {
          return
        };
        this.$refs.contentTop.style.zIndex = 0;
        this.loadinText = '上传中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        submitDepartMentServiceSignInfo({
          taskId: this.taskId,
          imgType: 0,
          imgOrsign: this.currentElectronicSignature
        }).then((res) => {
          this.showLoadingHint = false;
          this.overlayShow = false;
          if(res && res.data.code == 200) {
            this.updateTaskComplete(this.proId,this.taskId)
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
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

      // 更新任务为已完成
      updateTaskComplete (proId,taskId) {
        updateDepartmentServiceTaskBeCompleted(proId,taskId).then((res) => {
          if(res && res.data.code == 200) {
            // 删除当前任务存储的已完成巡检的科室信息
            this.$toast('该任务已完成');
            let temporaryInfo = this.completeDepartmentServiceOfficeInfo.filter((item) => { return item.taskId !== this.taskId});
            this.changeCompleteDepartmentServiceOfficeInfo(temporaryInfo);
            setStore('isCompleteDepartmentServiceOfficeInfo', {"sweepCodeInfo": temporaryInfo});
            this.$router.push({path: 'departmentService'});
            this.changeTitleTxt({tit:'科室巡检'});
            setStore('currentTitle','科室巡检');
          } else {
            this.$toast(`${res.data.msg}`)
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        });
      },

      // 重写
      rewrite () {
        this.$refs.mychild.overwrite()
      },

      // 取消
      cancel () {
        this.$refs.mychild.overwrite();
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
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
     .no-data {
      position: absolute;
      top: 245px;
      left: 13%;
      width: 100%;
      text-align: center;
      z-index: 100
    }
    .loading {
      position: absolute;
      top: 280px;
      left: 0;
      width: 100%;
      height: 100px;
      text-align: center;
      z-index: 10
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-top {
        flex: 1;
        padding-top: 10px;
        overflow: auto
      };
      .content-bottom {
        width: 90%;
        margin: 0 auto;
        height: 150px;
        margin-top: 10px;
        position: relative;
        > span {
          display: inline-block;
          position: absolute;
          width: 100%;
          height: 45px;
          text-align: center;
          line-height: 45px;
          left: 0;
          border-radius: 2px;
          &:first-child {
            background: @color-theme;
            color: #fff;
            top: 0
          };
          &:nth-child(2) {
            border: 1px solid #7198fa;
            color: #7198fa;
            bottom: 53px;
            box-sizing: border-box
          }
          &:last-child {
            background: #999ea1;
            color: #fff;
            bottom: 1px
          }
        }
      }
    }
  }
</style>
