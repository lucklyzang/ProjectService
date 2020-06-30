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
            <span class="real-name-two">{{departmentName}}&emsp;&emsp;{{personType}}</span>
          </p>
        </div>
      </div>
      <div class="content-middle-task-message">
        <p class="content-middle-title">任务看板</p>
        <ul class="content-middle-task-name">
          <li v-for="(item,index) in taskList" :key="index" @click="taskClickEvent(item,index)">
            <p class="task-button-wrapper">
              <img :src="btnTaskWrapperPng" alt="">
            </p>
            <p class="task-btn-img">
              <img :src="item.imgUrl" alt="">
            </p>
            <p  class="task-btn-tit">{{item.tit}}</p>
          </li>
        </ul>
      </div>
      <div class="content-bottom">
        <div class="btn-left" :class="{btnStyle: btnIndex == index}" v-for="(item,index) in btnList" :key="index" @click="bottomBtnClickEvent(item,index)">
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
  import dispatchTaskPng from '@/common/images/home/dispatch-task.png'
  import circulationTaskPng from '@/common/images/home/circulation-task.png'
  import appointTaskPng from '@/common/images/home/appoint-task.png'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage } from '@/common/js/utils'
  export default {
    name: 'home',
    components:{
      HeaderTop,
      NoData,
      Loading,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        name: '杂行啊',
        btnIndex: 0,
        departmentName: '工程部',
        personType: '维修员',
        taskList: [
          {tit:'报修工单',imgUrl: dispatchTaskPng}, 
          {tit:'设备巡检',imgUrl: circulationTaskPng}, 
          {tit:'科室巡检',imgUrl: appointTaskPng}
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
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => { 
        })
      }
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
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
        'changeTitleTxt'
      ]),

      juddgeIspc () {
        return IsPC()
      },

      // 任务类型点击事件
      taskClickEvent (item,index) {
        if (item.tit == '报修工单') {
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        } else if (item.tit == '设备巡检') {
          this.$router.push({path: 'deviceService'});
          this.changeTitleTxt({tit:'设备巡检'});
          setStore('currentTitle','设备巡检')
        } else {
          this.$router.push({path: 'departmentService'});
          this.changeTitleTxt({tit:'科室巡检'});
          setStore('currentTitle','科室巡检')
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
        }
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
        padding: 15px 0 15px 10px;
        height: 75px;
        font-size: 14px;
        background: #fff;
        .content-top-userName {
          height: 100%;
         > p {
            display: inline-block;
            height: 75px;
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
            width: 200px;
            font-size: 13px;
            vertical-align: top;
            position: relative;
            span {
              display: block;
              position: absolute;
              left: 0
            };
            .real-name-one {
              top: 10px;
              color: #271010;
              font-weight: bold
            };
            .real-name-two {
              bottom: 10px;
              color: #bbbaba
            }
          }
        };
      };
      .content-middle-task-message {
        flex:1;
        overflow: auto;
        padding: 0 10px 0 10px;
        background: #f7f7f7;
        display: flex;
        height: 100%;
        flex-direction: column;
        font-size: 13px;
        .content-middle-title {
          height: 45px;
          line-height: 45px;
          color: #271010;
          font-weight: bold
        };
        .content-middle-task-name {
          flex:1;
          overflow: auto;
          height: 85%;
          box-sizing: border-box;
          li {
            background: #fff;
            width:47%;
            height: 140px;
            border-radius: 4px;
            display:inline-block;
            text-align: center;
            padding-top: 15px;
            box-sizing: border-box;
            position: relative;
            .task-button-wrapper {
              width: 100%;
              height: 120px;
              position: absolute;
              top: 0;
              left: 0;
              z-index: -1;
              img {
                width: 100%;
                height: 100%;
              }
            }
            .task-btn-img {
              width: 60px;
              height: 60px;
              margin: 0 auto;
              img {
                width: 100%;
                height: 100%;
              }
            };
            .task-btn-tit {
              color: #271010;
              font-weight: bold;
              margin-top: 30px;
            }
            &:nth-child(3) {
              margin-top: 10px
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
        .btnStyle {
          background: #298cf8;
        }
        > div {
          width: 50%;
          height: 60px;
          position: absolute;
          top: 0;
          text-align: center;
          line-height: 60px;
          .pStyle {
            color: #fff !important
          }
          > p {
            height: 30px;
            line-height: 30px;
            &:first-child {
              color: #4678f8;
              font-size: 24px;
              padding-top: 10px;
              box-sizing: border-box
            };
            &:last-child {
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
