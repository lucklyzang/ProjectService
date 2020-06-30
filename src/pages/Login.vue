<template>
  <div id="LoginBox">
    <div class="bg-icon-wrapper" ref="bgIconWrapper">
      <div class="bg-icon">
        <img :src="logoTopPng" alt="">
      </div>
    </div>
    <div class="input-box"  ref="inputBox">
      <van-cell-group>
        <van-field label="用户名"  left-icon="contact" placeholder="请输入用户名" type="text" v-model="username"></van-field>
        <van-field label="密码" left-icon="bag-o" placeholder="请输入密码" type="password" v-model="password"></van-field>
      </van-cell-group>
    </div>
    <div class="btn-box" @click="login">
      <img :src="loginBtnPng" alt="">
    </div>
    <div class="loading-btn">
      <loading :isShow="showLoadingHint" textContent="登录中,请稍候····" textColor="#2895ea"></loading>
    </div>
  </div>
</template>

<script>
import {logIn, getDictionaryData, getdepartmentList, getdepartmentListNo,registerChannel} from '@/api/login.js'
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
      showAccountLogin: true,
      showSweepLogin: false,
      showLoadingHint: false,
      sweepMsg: null,
      proId: '',
      barCodeScannerShow: false,
      logoTopPng: require('@/components/images/logo-top.png'),
      loginBtnPng: require('@/components/images/login-btn.png'),
    };
  },

  watch: {
  },

  computed: {
    loginName () {
      return getStore('userName') ? getStore('userName') : ''
    },
    loginPassword () {
      return getStore('userPassword') ? getStore('userPassword') : ''
    },
    ...mapGetters([
    ])
  },

  mounted () {
    this.username = getStore('userName') ? getStore('userName') : '';
    this.password = getStore('userPassword') ? getStore('userPassword') : '';
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory()
      that.gotoURL(() => { 
        pushHistory();
        this.$router.push({path: '/'});  //输入要返回的上一级路由地址
      });
      this.changeRouterFlag(false)
    };

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
      'changeRouterFlag',
      'changeLoginMethod',
      'changeUserType',
      'changeOverDueWay'
    ]),

    // 并行获取科室字典值(编号和字典)
     parallelFunction () {
        Promise.all([this.queryDepartmentList(),this.queryDepartmentListNo()])
        .then((res) => {
          if (res && res.length > 0) {
            this.destinationList = [];
            this.vehicleOperationList = [];
            this.destinationList.push({text: '无', value: 0});
            let [item1,item2] = res;
            if (item1) {
             setStore('departmentInfo', item1);
            };
            if (item2) {
             setStore('departmentInfoNo', item2);
             window.location.reload()
            };
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {})
        })
      },

    // 获取科室字典id
    queryDepartmentList () {
      return new Promise((resolve,reject) => {
        getdepartmentList(this.proId).then((res) => {
          if (res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
      })
    },

    // 获取科室字典编号
    queryDepartmentListNo () {
      return new Promise((resolve,reject) => {
        getdepartmentListNo(this.proId).then((res) => {
          if (res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
      })
    },

    // 注册channel
    getChannel (data) {
      registerChannel(data)
      .then((res) => {
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {})
      })
    },

    // 账号密码登录方法
    login () {
      let loginMessage;
      this.showLoadingHint = true;
      if (this.showAccountLogin) {
        loginMessage = {
          username: this.username,
          password: this.password,
          rememberMe: 1
        };
      } else {
        loginMessage = {
          username: this.sweepMsg,
          flag: 1,
        }
      };
      logIn(loginMessage).then((res)=>{
        if (res) {
          if (res.data.code == 200) {
            // 重置过期方式
            this.changeOverDueWay(false);
            setStore('storeOverDueWay',false);
            if (this.showAccountLogin) {
              setStore('userName', this.username);
              setStore('userPassword', this.password);
            };
            // 登录用户名密码及用户信息存入Locastorage
            setStore('userInfo', res.data.data);
            setStore('isLogin', true);
            // 用户身份类别存入store和Locastorage
            this.changeUserType(res.data.data["extendData"]['user_type_id']);
            setStore('userType', res.data.data["extendData"]['user_type_id']);
            this.storeUserInfo(JSON.parse(getStore('userInfo')));
            this.$router.push({path:'/home'});
            this.changeTitleTxt({tit:'中央运送'});
            this.proId = res.data.data['proId'];
            // 注册channel
            try {
              this.getChannel({proId:res.data.data.proId,workerId:res.data.data.id,type:res.data.data["extendData"]['user_type_id'],channelId:window.android.getChannelId()});
            } catch (err) {
              this.$dialog.alert({
                message: `${err}`,
                closeOnPopstate: true
              }).then(() => {
              })
            };
            // 获取科室字典数据
            this.parallelFunction()
          } else {
             this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
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
    }
    .loading-btn {
      width: 100%;
      height: 50px;
    }
   .btn-box {
      width: 80%;
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
        display: inline-block;
        img {
          width: 100%;
          height: 100%
        }
      }
    }
    .van-hairline--top-bottom::after {
      display: none
    }
    .van-cell-group {
      width: 80%;
      margin: 0 auto;
      font-size: 14px;
      .van-cell {
        border-bottom: 1px solid #e8e8e8;
        padding-left: 0;
        .van-cell__title {
          .van-field__label {
            color: #6a6a6a
          }
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