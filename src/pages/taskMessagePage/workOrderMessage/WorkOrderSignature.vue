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
   import {uploadRepairsTaskPhoto, completeRepairsTaskFinal} from '@/api/worker.js'
  import { formatTime, setStore, getStore, removeStore, IsPC, deepClone } from '@/common/js/utils'
  export default {
    name: 'WorkOrderSignature',
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
          this.$router.push({path: 'workOrderDetails'});
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
        'repairsWorkOrderMsg',
        'originalSignature',
        'userInfo',
        'isCompleteRepairsWorkOrderPhotoList'
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
        return this.repairsWorkOrderMsg.id
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeIsCompletePhotoList'
      ]),

      //返回上一页
      backTo () {
        this.$router.push({path: 'workOrderDetails'});
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
        let photoMsg = {
          taskId: this.taskId,  //任务ID
          images: []
        };
        photoMsg.images = [];
        photoMsg.images.push({
          imgType: 0,
          image: this.currentElectronicSignature
        });
        uploadRepairsTaskPhoto(photoMsg)
        .then((res) => {
          this.showLoadingHint = false;
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
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        console.log('sas1',this.currentElectronicSignature);
      },

      // 重写
      rewrite () {
        this.$refs.mychild.overwrite()
      },

      // 更改任务状态为已完成
      updateTaskComplete () {
        completeRepairsTaskFinal({
          proId: this.proId,
          taskId: this.taskId
        })
        .then((res) => {
          if (res && res.data.code == 200) {
            this.clearPhotoList();
            this.clearStoragePhoto();
            this.$toast(`${res.data.msg}`);
            this.$router.push({path: 'repairsWorkOrder'});
            this.changeTitleTxt({tit:'报修工单'});
            setStore('currentTitle','报修工单')
          } else {
            this.$toast(`${res.data.msg}`);
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

      // 取消
      cancel () {
        this.$refs.mychild.overwrite();
        this.$router.push({path: 'workOrderDetails'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
      },

      // 清除上传成功后存储的照片
      clearPhotoList () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let echoIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
        if (echoIndex == -1) { return };
        let temporaryPhotoList = deepClone(this.isCompleteRepairsWorkOrderPhotoList);
        let temporaryPhotoId = [];
        temporaryPhotoList[echoIndex]['completePhototList'] = temporaryPhotoId;
        temporaryPhotoList[echoIndex]['issuePhototList'] = temporaryPhotoId;
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
      },

      // 清除该任务存储的照片信息
      clearStoragePhoto () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
      },

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
        margin-top: 20px;
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
