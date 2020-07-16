<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
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
  export default {
    name: 'DepartmentServiceSignature',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker,
      ElectronicSignature
    },
    data() {
      return {
      }
    },
    
    mounted() {
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
        'currentElectronicSignature'
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
        'changeTitleTxt'
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
        console.log('sas1',this.currentElectronicSignature);
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
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
      left: 13%;
      width: 100%;
      height: 100px;
      text-align: center;
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
        height: 300px;
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
            background: #2c65f7;
            color: #fff;
            top: 55px
          };
          &:nth-child(2) {
            border: 1px solid #7198fa;
            color: #7198fa;
            bottom: 105px
          }
          &:last-child {
            background: #999ea1;
            color: #fff;
            bottom: 10px
          }
        }
      }
    }
  }
</style>
