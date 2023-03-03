<template>
  <div class="content-wrapper">
   <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <div class="loading">
      <loading :isShow="showLoadingHint" textContent="加载中,请稍候····" textColor="#2895ea"></loading>
    </div>
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <div class="content-top-userName">
          <p class="content-top-userName-img">
            <img :src="defaultPersonPng" alt="">
          </p>
          <p class="content-top-userName-msg">
            <span class="real-name-one">{{name}}</span>
            <span class="real-name-two">{{proName}}&emsp;&emsp;{{userType}}</span>
          </p>
        </div>
      </div>
      <div class="content-middle-task-message">
        <p class="content-middle-title">任务看板</p>
        <ul class="content-middle-task-name">
          <li v-for="(item,index) in taskList" :key="index" @click="taskClickEvent(item,index)">
            <span class="task-length" :class="{daskListSignStyle:index == 0 && isExist(item.tit)}" v-show="index == 0 && repairsWorkerOrderCount != 0">{{repairsWorkerOrderCount}}</span>
            <span class="task-length" :class="{daskListSignStyle:index == 1 && isExist(item.tit)}" v-show="index == 1 && deviceServiceCount != 0">{{deviceServiceCount}}</span>
            <span class="task-length" :class="{daskListSignStyle:index == 2 && isExist(item.tit)}" v-show="index == 2 && departmentServieCount != 0">{{departmentServieCount}}</span>
            <p class="task-button-wrapper">
              <img :src="btnTaskWrapperPng" alt="">
            </p>
            <p class="task-btn-img">
              <span>
                <img :src="item.imgUrl" alt="">
              </span>
            </p>
            <p  class="task-btn-tit">{{item.tit}}</p>
          </li>
        </ul>
      </div>
      <div class="content-bottom">
        <div class="btn-left" v-for="(item,index) in btnList" :key="index" @click="bottomBtnClickEvent(item,index)">
          <p :class="{pStyle: btnIndex == index}">
            <van-icon :name="`${item.icon}`" />
          </p>
          <p :class="{pStyle: btnIndex == index}">{{item.name}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import HeaderTop from '../components/HeaderTop'
  import FooterBottom from '../components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import departmentServiceOnePng from '@/common/images/home/department-service-one.png'
  import dispatchingManagementPng from '@/common/images/home/dispatching-management.png'
  import deviceServiceOnePng from '@/common/images/home/device-service-one.png'
  import repairsWorkOrderOnePng from '@/common/images/home/repairs-work-order-one.png'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import {queryTaskCount,getNewWork} from '@/api/worker.js'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, repeArray } from '@/common/js/utils'
  let windowTimer
  export default {
    name: 'Home',
    components:{
      HeaderTop,
      NoData,
      Loading,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        btnIndex: 0,
        noDataShow: false,
        showLoadingHint: false,
        repairsWorkerOrderCount: '',
        temporaryNumList: [],
        deviceServiceCount: '',
        departmentServieCount: '',
        isTimeoutContinue: true,
        taskList: [
          {tit:'报修工单', imgUrl: repairsWorkOrderOnePng},
          {tit:'设备巡检', imgUrl: deviceServiceOnePng},
          {tit:'区域巡检', imgUrl: departmentServiceOnePng},
          {tit:'调度管理', imgUrl: dispatchingManagementPng}
        ],
        btnList: [
          {name: '主页', icon: 'wap-home-o'},
          {name: '我的', icon: 'contact'}
        ],
        defaultPersonPng: require('@/common/images/home/default-person.jpg'),
        btnTaskWrapperPng: require('@/common/images/home/btn-background.png'),
      }
    },

    mounted() {
      this.changeTitleTxt({tit:'工程管理系统'});
      setStore('currentTitle','工程管理系统');
      // 控制设备物理返回按键
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
        })
      };
      // this.temporaryNumList = this.newTaskName;
      // 获取任务数量
      if (!this.globalTimer) {
        windowTimer = window.setInterval(() => {
          if (this.isTimeoutContinue) {
            setTimeout(this.queryNewWork(this.proId, this.workerId), 0);
            this.changeGlobalTimer(windowTimer)
          } else {
            this.changeGlobalTimer(null)
          }
        }, 3000)
      };
      this.getTaskCount(this.proId,this.workerId)
    },

    watch: {
    },

    computed:{
      ...mapGetters([
        'navTopTitle',
        'userInfo',
        'globalTimer',
        'newTaskName'
      ]),
      userName () {
       return this.userInfo.userName
      },
      userTypeId () {
        return this.userInfo.extendData.user_type_id
      },
      userType () {
        return this.userInfo.extendData.userType
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
      }
    },

    beforeRouteEnter (to, from, next) {
      next()
    },

    beforeRouteLeave (to, from, next) {
      next()
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeIsFreshRepairsWorkOrderPage',
        'changeIsFreshDepartmentServicePage',
        'changeIsFreshDeviceServicePage',
        'changeGlobalTimer',
        'changeNewTaskList'
      ]),

      juddgeIspc () {
        return IsPC()
      },

      // 排序测试
      // test (arrOne,arrTwo) {
      //   let arrOne = [1,8,10],arrTwo = [2,4,6,9];
      //   let i = 0, j = 0;
      //   let temporaryArray = []; 
      //   while (i < arrOne.length && j < arrTwo.length) {
      //     if (arrOne[i] < arrTwo[j]) {
      //       temporaryArray.push(arrOne[i]);
      //       i++
      //     } else {
      //       temporaryArray.push(arrTwo[j]);
      //       j++
      //     }
      //   };
      //   if (i == arrOne.length) {
      //     temporaryArray.concat(arrTwo.splice(j))
      //   };
      //   if (j == arrTwo.length) {
      //     temporaryArray.concat(arrOne.splice(i))
      //   };
      //   return temporaryArray
      // },

      // 查询是否有新任务
      queryNewWork (proId,workerId) {
        this.isTimeoutContinue = false;
        let audio = new Audio();
        audio.preloadc = "auto";
        process.env.NODE_ENV == 'development' ? audio.src = "/static/audios/task-info-voice.wav" : audio.src = "/projectWeb/static/audios/task-info-voice.wav";
        getNewWork(proId,workerId).then((res) => {
          // token过期,清除定时器
          if (!res['headers']['token']) {
            if(windowTimer) {window.clearInterval(windowTimer)}
          };
          if (res && res.data.code == 200) {
            this.isTimeoutContinue = true;
            Object.keys(res.data.data).forEach((item) => {
              if (item != "all" && res.data.data[item] == true) {
                this.temporaryNumList = this.newTaskName;
                this.temporaryNumList.push(item);
                // 新任务存入vuex中
                this.changeNewTaskList(repeArray(this.temporaryNumList));
                // 新任务存入localStore中
                setStore('newTaskList',{taskName:repeArray(this.temporaryNumList)});
                //更新任务数量
                this.getTaskCount(this.proId,this.workerId);
                //进行播放
                let playPromiser = audio.play();
                audio.onended = () => {
                }
              }
            })
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

      // 任务类型转换字母
      taskTypeTransferLetter (type) {
        switch(type) {
          case '报修工单' :
            return 'bx'
            break;
          case '区域巡检' :
            return 'kx'
            break;
          case '设备巡检' :
            return 'sx'
            break
        }
      },

      // 是否存在指定任务
      isExist (item) {
        let flag;
        if (this.newTaskName.indexOf(this.taskTypeTransferLetter(item))!= -1) {
          flag = true
        } else {
          flag = false
        }
        return flag
      },

      // 查询任务数量
      getTaskCount (proId,workerId) {
        queryTaskCount(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            const {bxTask, sxTask, kxTask} = res.data.data;
            this.repairsWorkerOrderCount = bxTask;
            this.deviceServiceCount = sxTask;
            this.departmentServieCount = kxTask
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

      // 任务类型点击事件
      taskClickEvent (item,index) {
        let currentIndex = this.newTaskName.indexOf(this.taskTypeTransferLetter(item.tit));
        this.temporaryNumList = this.newTaskName;
        if (item.tit == '报修工单') {
          if (currentIndex != -1) {
            this.temporaryNumList.splice(index,1);
            this.changeNewTaskList(this.temporaryNumList);
            setStore('newTaskList',{taskName:this.temporaryNumList})
          };
          this.changeIsFreshRepairsWorkOrderPage(true);
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        } else if (item.tit == '设备巡检') {
          if (currentIndex != -1) {
            this.temporaryNumList.splice(index,1);
            this.changeNewTaskList(this.temporaryNumList);
            setStore('newTaskList',{taskName:this.temporaryNumList})
          };
          this.changeIsFreshDeviceServicePage(true);
          this.$router.push({path: 'deviceService'});
          this.changeTitleTxt({tit:'设备巡检'});
          setStore('currentTitle','设备巡检')
        } else if (item.tit == '区域巡检') {
          if (currentIndex != -1) {
            this.temporaryNumList.splice(index,1);
            this.changeNewTaskList(this.temporaryNumList);
            setStore('newTaskList',{taskName:this.temporaryNumList})
          };
          this.changeIsFreshDepartmentServicePage(true);
          this.$router.push({path: 'departmentService'});
          this.changeTitleTxt({tit:'区域巡检'});
          setStore('currentTitle','区域巡检')
        } else if (item.tit == '调度管理') {
          this.changeIsFreshDepartmentServicePage(true);
          this.$router.push({path: 'engineeringTaskManagement'});
          this.changeTitleTxt({tit:'工程维保任务管理'});
          setStore('currentTitle','工程维保任务管理')
        }
      },

      // 底部菜单点击事件
      bottomBtnClickEvent (item,index) {
        this.btnIndex = index;
        if (item.name == '我的') {
          this.$router.push({path: 'myInfo'});
          this.changeTitleTxt({tit:'个人资料'});
          setStore('currentTitle','个人资料')
        }
      },

      // 判断每种任务是否收集完成
      judgeTaskComplete () {
        // 重新存入用户信息
        if (getStore('userInfo')) {
          this.$store.commit('storeUserInfo',JSON.parse(getStore('userInfo')));
        };
        if (getStore('userType')) {
          this.$store.commit('changeUserType',getStore('userType'));
        };
        // 重新存入当前标题
        if (getStore('currentTitle')) {
          this.$store.commit('changeTitleTxt', {tit: getStore('currentTitle')});
        };
        // 重新存入请求token
        if (getStore('questToken')) {
          this.$store.commit('changeToken', getStore('questToken'));
        };
        // 重新存入新任务列表
        if (getStore('newTaskList')) {
          this.$store.commit('changeNewTaskList',JSON.parse(getStore('newTaskList'))['taskName']);
        };
        // 重新存入当前报修工单信息
        if (getStore('repairsWorkOrderMsg')) {
          this.$store.commit('changeRepairsWorkOrderMsg', JSON.parse(getStore('repairsWorkOrderMsg')));
        };
        // 重新存入当前报修工单上传的图片
        if (getStore('completPhotoInfo')) {
          this.$store.commit('changeIsCompletePhotoList', JSON.parse(getStore('completPhotoInfo'))['photoInfo']);
        };
        // 重新存入当前是否填写过耗材
        if (getStore('isFillMaterialList')) {
          this.$store.commit('changeisFillMaterialList', JSON.parse(getStore('isFillMaterialList'))['number']);
        };
        // 重新存入科室巡检信息
        if (getStore('departmentServiceMsg')) {
          this.$store.commit('changeDepartmentServiceMsg', JSON.parse(getStore('departmentServiceMsg')));
        };
        // 重新存入设备巡检信息
        if (getStore('deviceServiceMsg')) {
          this.$store.commit('changeDeviceServiceMsg', JSON.parse(getStore('deviceServiceMsg')));
        };
        // 重新存入科室巡检扫码校验通过的科室编号
        if (getStore('isDepartmentServiceVerifySweepCode')) {
          this.$store.commit('changeIsDepartmentServiceVerifySweepCode', JSON.parse(getStore('isDepartmentServiceVerifySweepCode'))['sweepCodeInfo']);
        };
        // 重新存入当前科室巡检扫码校验通过的科室编号
        if (getStore('isCurrentDepartmentServiceVerifySweepCode')) {
          this.$store.commit('changeIsCurrentDepartmentServiceVerifySweepCode', JSON.parse(getStore('isCurrentDepartmentServiceVerifySweepCode'))['number']);
        };
        // 重新存入当前进行巡检的科室id
        if (getStore('departmentServiceId')) {
          this.$store.commit('changeDepartmentServiceOfficeId',getStore('departmentServiceId'))
        };
        // 重新存入完成巡检任务的科室编号
        if (getStore('isCompleteDepartmentServiceOfficeInfo')) {
          this.$store.commit('changeCompleteDepartmentServiceOfficeInfo',JSON.parse(getStore('isCompleteDepartmentServiceOfficeInfo'))['sweepCodeInfo'])
        };
        // 重新存入科室巡检当前点击的检查项id
        if (getStore('checkedItemId')) {
          this.$store.commit('changeCurrentDepartmentServiceCheckedItemId', JSON.parse(getStore('checkedItemId')));
        };
        // 重新存入完成巡检任务中检查项上报的id
        if (getStore('isCompleteDepartmentServiceCheckedItemList')) {
          this.$store.commit('changeCompleteDepartmentServiceCheckedItemList',JSON.parse(getStore('isCompleteDepartmentServiceCheckedItemList'))['sweepCodeInfo'])
        };
        // 重新存入设备巡检中能耗录入扫码校验通过的当前科室id
        if (getStore('isCurrentDeviceCopyServiceVerifySweepCode')) {
          this.$store.commit('changeIsCurrentDeviceCopyServiceVerifySweepCode', JSON.parse(getStore('isCurrentDeviceCopyServiceVerifySweepCode'))['number']);
        };
        // 重新存入设备巡检中能耗录入扫码校验通过的当前科室编号
        if (getStore('energyDepartmentService')) {
          this.$store.commit('changeCurrentDeviceCopyVerifySweepCodeDepNumber', getStore('energyDepartmentService'));
        };
        // 重新存入当前科室设备能耗记录信息列表
        if (getStore('energyRecordList')) {
          this.$store.commit('changeEnergyRecordList',JSON.parse(getStore('energyRecordList'))['energyRecord'])
        };
        // 重新存入完成能耗录入的科室编号信息
        if (getStore('isCompleteDeviceEnergyRecordServiceOfficeInfo')) {
          this.$store.commit('changeCompleteDeviceEnergyRecordServiceOfficeInfo',JSON.parse(getStore('isCompleteDeviceEnergyRecordServiceOfficeInfo'))['sweepCodeInfo'])
        };
      }
    }
  }
</script>
<style lang='less' scoped>
  @import "../common/stylus/variable.less";
  @import "../common/stylus/mixin.less";
  @import "../common/stylus/modifyUi.less";
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
      left: 13%;
      width: 100%;
      height: 100px;
      text-align: center;
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-top {
        padding: 15px 10px;
        height: 75px;
        font-size: 14px;
        background: #fff;
        .content-top-userName {
          height: 100%;
          display: flex;
          flex-flow: row nowrap;
         > p {
            display: inline-block;
            height: 100%;
         }
          .content-top-userName-img {
            width: 75px;
            vertical-align: top;
            margin-right: 8px;
            border-radius: 50%;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .content-top-userName-msg {
            flex: 1;
            font-size: 13px;
            vertical-align: top;
            position: relative;
            >span {
              display: block;
              word-break: break-all;
              position: absolute;
              left: 0
            };
            .real-name-one {
              top: 10px;
              color: #271010;
              line-height: 14px;
              font-weight: bold
            };
            .real-name-two {
              bottom: 10px;
              line-height: 14px;
              color: #bbbaba
            }
          }
        };
      };
      .content-middle-task-message {
        flex:1;
        overflow: scroll;
        padding: 0 10px 0 10px;
        background: #f7f7f7;
        display: flex;
        height: 0;
        flex-direction: column;
        font-size: 13px;
        .content-middle-title {
          height: 45px;
          font-size: 16px;
          line-height: 45px;
          color: #271010;
          font-weight: bold
        };
        .content-middle-task-name {
          flex:1;
          overflow: scroll;
          box-sizing: border-box;
          li {
            background: #fff;
            width:47%;
            height: 160px;
            border-radius: 4px;
            display:inline-block;
            text-align: center;
            padding-top: 20px;
            box-sizing: border-box;
            position: relative;
            .task-length {
              position: absolute;
              width: 15px;
              height: 15px;
              line-height: 15px;
              font-size: 10px;
              top: 14px;
              right: 14px;
              background: orange;
              color: #fff;
              border-radius: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap
            };
            .daskListSignStyle {
              background: #eb0000
            };
            .task-button-wrapper {
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
              z-index: -1;
              img {
                width: 100%;
                height: 100%;
              }
            };
            .task-btn-img {
              width: 56px;
              height: 56px;
              line-height: 60px;
              margin: 0 auto;
              border-radius: 4px;
              position: relative;
              span {
                display: inline-block;
                width: 56px;
                height: 56px;
                margin: 0 auto;
                position: absolute;
                top: 50%;
                left: 50%;
                margin-top: -28px;
                margin-left: -28px;
                img {
                  width: 100%;
                  height: 100%;
                };
              }
            };
            .task-btn-tit {
              color: #271010;
              font-weight: bold;
              margin-top: 30px;
            }
            &:nth-child(3) {
              margin-top: 6%
            };
            &:nth-child(4) {
              margin-top: 10px
            };
            &:nth-child(odd) {
              margin-right: 6%
            }
          }
        }
      }
      .content-bottom {
        height: 60px;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        position: relative;
        > div {
          width: 50%;
          height: 60px;
          position: absolute;
          top: 0;
          text-align: center;
          line-height: 60px;
          .pStyle {
            color: @color-theme!important
          }
          > p {
            height: 30px;
            line-height: 30px;
            &:first-child {
              color: #333;
              font-size: 26px;
              padding-top: 8px;
              box-sizing: border-box;
              /deep/ .van-icon {
                margin-top: -2px
              }
            };
            &:last-child {
              letter-spacing: 5px;
              text-indent: 5px;
              color: #271010;
              font-weight: bold;
            }
          };
          &:first-child {
            left: 0
          };
          &:last-child {
             right: 0
          }
        }
      }
    }
  }
</style>
