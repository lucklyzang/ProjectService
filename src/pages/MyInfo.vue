<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <p class="content-top-name">
          <span>头像</span>
          <span>
            <img :src="defaultPersonPng" alt="">
          </span>
        </p>
        <p class="content-top-other">
          <span>姓名</span>
          <span>
            {{userInfo.name}}
          </span>
        </p>
        <p class="content-top-other">
          <span>手机号码</span>
          <span>
            无
          </span>
        </p>
        <p class="content-top-other">
          <span>公司部门</span>
          <span>
            {{userInfo.extendData.proName}}
          </span>
        </p>
        <p class="content-top-other">
          <span>职位</span>
          <span>
            {{userInfo.extendData.userType}}
          </span>
        </p>
      </div>
      <div class="content-bottom">
        <p class="app-version">
          <span>当前版本</span>
          <span>
            {{versionNumber}}
          </span>
        </p>
        <p class="back-home"  @click="backTo">返回主页</p>
        <p class="quit-account" @click="isLoginOut">退出账号</p>
      </div>
    </div>
  </div>
</template>
<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage } from '@/common/js/utils'
  import {userSignOut} from '@/api/login.js'
  export default {
    name: 'MyInfo',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        versionNumber: '',
        defaultPersonPng: require('@/common/images/home/default-person.jpg')
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'home'});
          this.changeTitleTxt({tit:'工程管理系统'});
          setStore('currentTitle','工程管理系统')
        });
        this.getVersionNumber()
      }
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'userInfo',
        'globalTimer'
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

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeOverDueWay'
      ]),

      // 是否签退
      isLoginOut () {
        this.$dialog.alert({
          message: '确定签退?',
          closeOnPopstate: true,
          showCancelButton: true
        }).then(() => {
          this.userLoginOut(this.proId, this.userInfo.userName)
        })
        .catch(() => {
        })
      },

       // 获取版本号
      getVersionNumber () {
        this.versionNumber = window.android.getVersion()
      },
        
      // 用户签退
      userLoginOut (proId,workerId) {
        this.changeOverDueWay(true);
        setStore('storeOverDueWay',true);
        userSignOut(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            if(this.globalTimer) {window.clearInterval(this.globalTimer)};
            removeAllLocalStorage();
            this.$router.push({path:'/'})
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
            this.changeOverDueWay(false);
            setStore('storeOverDueWay',false);
          }
        }).
        catch((err) => {
          this.changeOverDueWay(false);
          setStore('storeOverDueWay',false);
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      },

      //返回上一页
      backTo () {
        this.$router.push({path: 'home'});
        this.changeTitleTxt({tit:'工程管理系统'});
        setStore('currentTitle','工程管理系统')
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
      left: 13%;
      width: 100%;
      height: 100px;
      text-align: center;
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-top {
        height: auto;
        font-size: 14px;
        background: #fff;
        .content-top-name {
          height: 90px;
          padding: 10px;
          box-sizing: border-box;
          position: relative;
          .bottom-border-1px(#dadada);
          > span {
            position: absolute;
            display: inline-block;
            &:first-child {
              left: 0;
              top: 38px;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #271010;
              font-weight: bold;
              right: 10px;
              top: 10px;
              width: 65px;
              height: 65px;
              border-radius: 50%;
              img {
                width: 100%;
                height: 100%
              }
            }
          }
        };
        .content-top-other {
          height: 45px;
          line-height: 45px;
          box-sizing: border-box;
          position: relative;
          .bottom-border-1px(#dadada);
          &:last-child {
            .bottom-border-1px(#fff)
          }
          > span {
            position: absolute;
            display: inline-block;
            &:first-child {
              left: 0;
              top: 0;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #271010;
              font-weight: bold;
              right: 10px;
              top: 0
            }
          }
        }
      };
      .content-bottom {
        flex: 1;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        background: #f7f7f7;
        position: relative;
        .app-version {
          position: relative;
          top: 14px;
          left: 0;
          height: 45px;
          background: #fff;
          line-height: 45px;
          box-sizing: border-box;
          > span {
            position: absolute;
            display: inline-block;
            &:first-child {
              left: 0;
              top: 0;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #271010;
              font-weight: bold;
              right: 10px;
              top: 0
            }
          }
        };
        .back-home {
          height: 45px;
          width: 300px;
          margin: 0 auto;
          line-height: 45px;
          left: 50%;
          margin-left: -150px;
          position: absolute;
          bottom: 100px;
          background: #fff;
          color: #271010;
          font-weight: bold;
          text-align: center
        };
        .quit-account {
          height: 45px;
          width: 300px;
          margin: 0 auto;
          line-height: 45px;
          left: 50%;
          margin-left: -150px;
          position: absolute;
          bottom: 30px;
          background: #ff0000;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      }
    }
  }
</style>
