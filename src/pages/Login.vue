<template>
  <div id="LoginBox">
    <div class="bg-icon-wrapper" ref="bgIconWrapper">
      <div class="bg-icon">
        <img :src="logoTopPng" alt="">
         <div class="bg-text">
          工程维修
        </div>
      </div>
    </div>
    <div class="input-box"  ref="inputBox">
      <van-cell-group>
        <van-field label="用户名"  left-icon="contact" placeholder="请输入用户名" type="text" v-model="username"></van-field>
        <van-field label="密码" left-icon="bag-o" placeholder="请输入密码" type="password" v-model="password"></van-field>
      </van-cell-group>
    </div>
    <div class="btn-box" @click="loginEvent">
      <span>
        <img :src="loginBtnPng" alt="">
      </span>
      <span>
        登 录
      </span>
    </div>
    <div class="loading-btn">
      <loading :isShow="showLoadingHint" textContent="登录中,请稍候····" textColor="#2895ea"></loading>
    </div>
  </div>
</template>

<script>
import {logIn, getDictionaryData, getdepartmentList, getdepartmentListNo,registerChannel,getDepartmentMsg} from '@/api/login.js'
import { mapGetters, mapMutations } from 'vuex'
import passwordPng from '@/components/images/password.png'
import userPng from '@/components/images/user.png'
import Loading from '@/components/Loading'
import { setStore, getStore, IsPC, scanCode } from '@/common/js/utils'
export default {
  name: 'Login',
  components: {
    Loading
  },
  data () {
    return {
      username: '',
      password: '',
      loadingText: '登录中,请稍候···',
      showAccountLogin: true,
      showLoadingHint: false,
      logoTopPng: require('@/components/images/logo-top.png'),
      loginBtnPng: require('@/components/images/login-btn.png')
    }
  },

  watch: {
  },

  computed: {
    ...mapGetters([
    ])
  },

  mounted () {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory()
      that.gotoURL(() => { 
        pushHistory();
        this.$router.push({path: '/'});  //输入要返回的上一级路由地址
      });
    };
    this.echoUserInfo();
    // 监控键盘弹起
    let originalHeight = document.documentElement.clientHeight || document.body.clientHeight;
    window.onresize = ()=> {
      let resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
      if (resizeHeight < originalHeight) {
        return (()=>{
          this.$refs['bgIconWrapper'].style.cssText='flex:none;height:220px' 
        })()
      } else {
        this.$refs['bgIconWrapper'].style.cssText='flex:1;height:0' 
      }
    };
  },

  methods: {
    ...mapMutations([
      'storeUserInfo',
      'changeTitleTxt',
      'changeOverDueWay'
    ]),

    // 回显用户名和密码
    echoUserInfo () {
      this.username = getStore('userName') ? getStore('userName') : '';
      this.password = getStore('userPassword') ? getStore('userPassword') : '';
    },

    
    // 注册channel
    getChannel (data) {
      return new Promise((resolve,reject) => {
        registerChannel(data)
        .then((res) => {
          resolve()
        })
        .catch((err) => {
         this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {})
        })
      })
    },

    // 登录验证方法
    login () {
      return new Promise((resolve,reject) => {
        this.showLoadingHint = true;
        let loginMessage = {
          username: this.username,
          password: this.password,
          rememberMe: 1
        };
        logIn(loginMessage).then((res)=>{
          if (res) {
            if (res.data.code == 200) {
              // 重置过期方式
              this.changeOverDueWay(false);
              setStore('storeOverDueWay',false);
              // 存储用户名和密码
              if (this.showAccountLogin) {
                setStore('userName', this.username);
                setStore('userPassword', this.password);
              };
              // 存储用户相关的登录后的信息和是否登录
              setStore('userInfo', res.data.data);
              setStore('isLogin', true);
              // 用户相关的登录后的信息存入store
              this.storeUserInfo(JSON.parse(getStore('userInfo')));
              resolve(res.data.data)
            } else {
              this.$toast(`${res.data.msg}`)
            }
          };
          this.showLoadingHint = false
        })
        .catch((err) => {
          this.showLoadingHint = false;
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      })
    },

    // 获取科室信息字典值
    queryDepartmentMsg (proId) {
      return new Promise((resolve,reject) => {
        getDepartmentMsg(proId).then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
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
        })
      })
    },

    async loginEvent () {
      const resultOne = await this.login();
      const resultTwo = await this.queryDepartmentMsg(resultOne.proId);
      if (!IsPC()) {
        // 注册channel
        if (window.android.getChannelId() == '' || (!window.android.getChannelId() && typeof(window.android.getChannelId()) != 'undefined' && window.android.getChannelId() != 0) || typeof(window.android.getChannelId()) == 'undefined') {
          this.$toast('未获取到channelId')
        } else {
          try {
            await this.getChannel({proId:resultOne.proId,workerId:resultOne.id,type:2,channelId:window.android.getChannelId()});
          } catch (err) {
            this.$dialog.alert({
              message: `${err.message}`,
              closeOnPopstate: true
            }).then(() => {})
          }
        }
      };
      this.$router.push({path:'/home'});
      this.changeTitleTxt({tit:'工程管理系统'});
      setStore('departmentMessage', resultTwo);
      window.location.reload()
    }
  } 
}
</script>
<style lang="less" scoped>
@import "../common/stylus/variable.less";
@import "../common/stylus/mixin.less";
@import "../common/stylus/modifyUi.less";
   #LoginBox {
    .content-wrapper();
    .input-box {
      width: 100%;
      height: 190px;
      padding-top: 50px;
      box-sizing: border-box;
        /deep/ .van-cell-group {
        width: 80%;
        margin: 0 auto;
        font-size: 14px;
        .van-cell {
          border-bottom: 1px solid #e8e8e8;
          padding-left: 0;
          margin-bottom: 10px;
          .van-field__label {
            font-size: 14px;
            color: #939393
          };
          .van-field__left-icon {
            .van-icon {
              font-size: 17px;
              color: #4ec6ff
            }
          }
          &:after {
            display: none
          } 
        }
      }
    };
    .loading-btn {
      width: 100%;
      height: 50px;
    }
   .btn-box {
      width: 80%;
      height: 140px;
      margin: 0 auto;
      position: relative;
      span {
        position: absolute;
        top: 10px;
        left: 0;
        width: 100%;
        height: 50px;
        img {
          width: 100%;
          height: 100%
        };
        &:last-child {
          text-align: center;
          line-height: 45px;
          color: #fff;
          font-size: 18px
        }
      };
   }
  .bg-icon-wrapper {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      background-image: linear-gradient(#20c4f8, #31abf8);
      position: relative;
      .bg-icon {
        width: 70%;
        height: 50%;
        margin: auto;  
        position: absolute;
        top: 0; 
        left: 0; 
        bottom: 0; 
        right: 0;
        img {
          width: 100%;
          height: 100%
        };
        .bg-text {
          position: absolute;
          width: 100%;
          height: 40px;
          line-height: 40px;
          left: 0;
          bottom: 5px;
          color: #fff;
          text-align: center;
          font-size: 24px
        }
      }
    }
    .van-hairline--top-bottom::after {
      display: none
    }
    .bottom-title {
      width: 100%;
      position: absolute;
      bottom: 20px;
      text-align: center;
      font-size: 12px;
      color: #fff
    }
    .loading-hint {
      /deep/.van-loading {
        top: 90%;
        .van-loading__text {
          color: #4ec6ff
        }
      } 
    }
  }
</style>