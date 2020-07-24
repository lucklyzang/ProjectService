<template>
  <div id="LoginBox">
    <div class="bg-icon-wrapper" ref="bgIconWrapper">
      <div class="bg-icon">
        <h3>登录</h3>
      </div>
    </div>
    <div class="input-box"  ref="inputBox">
      <div>
        <p>
          账号
        </p>
        <p>
          <van-field type="text"  placeholder="请输入用户名" v-model="username"></van-field>
        </p>
      </div>
      <div>
        <p>
          密码
        </p>
        <p>
          <van-field type="password" placeholder="请输入密码" v-model="password"></van-field>
        </p>
      </div>
    </div>
    <div class="btn-box" @click="loginEvent">
      <img :src="loginBtnPng" alt="">
    </div>
    <div class="loading-btn">
      <loading :isShow="showLoadingHint" :textContent="loadingText" textColor="#2895ea"></loading>
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
  name: 'login',
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
    window.onresize = ()=>{
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
              resolve(res.data.data.proId)
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
      const resultTwo = await this.queryDepartmentMsg(resultOne);
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
      box-sizing: border-box;
      > div {
        width: 85%;
        margin: 0 auto;
        height: 50px;
        margin-bottom: 20px;
        position: relative;
        > p {
          font-size: 18px;
          position: absolute;
          top: 0;
          display: inline-block;
          height: 50px;
          &:first-child {
            left: 0;
            line-height: 50px;
            width: 20%
          };
          &:last-child {
            right: 0;
            width: 80%;
            /deep/ .van-cell {
              border: 1px solid #cdcdcd;
              height: 100%;
              padding: 0;
              .van-cell__value {
                .van-field__body {
                  height: 100%;
                  padding-left: 8px
                }
              }
            }
          }
        }
      }
    }
    .loading-btn {
      width: 100%;
      height: 50px;
    }
   .btn-box {
      width: 85%;
      height: 140px;
      margin: 0 auto;
      img {
        width: 100%;
        height: 60px
      }
   }
  .bg-icon-wrapper {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .bg-icon {
        width: 100%;
        height: 100%;
        h3 {
          font-size: 20px;
          font-weight: bold;
          line-height: 50px;
          text-align: center
        }
      }
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
          color: #2895ea
        }
      } 
    }
  }
</style>