<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <p class="content-top-other">
          <span>工单编号</span>
          <span>
            2121212121
          </span>
        </p>
        <p class="content-top-other">
          <span>工单标题</span>
          <span>
            {{name}}
          </span>
        </p>
        <p class="content-top-other">
          <span>工单类型</span>
          <span>
            {{phoneNumber}}
          </span>
        </p>
        <p class="content-top-other">
          <span>时间</span>
          <span>
            {{departmentName}}
          </span>
        </p>
        <p class="content-top-other">
          <span>地点</span>
          <span>
            {{departmentName}}
          </span>
        </p>
        <p class="content-top-name">
          <span>工单内容</span>
          <span>
            飒飒撒飒飒下载下中选中下载下大师打死多所
          </span>
        </p>
      </div>
      <div class="content-middle">
        <p class="issue-photo">
          <span>问题拍照</span>
          <ul class="photo-list">
            <li v-for="(item,index) in issueImageList" :key="`${item}-${index}`">
              <img width="100" height="130" :src="item"/>
              <van-icon name="cross" @click="issueDelete(index)"/>
            </li>
          </ul>
          <span @click="issueClickEvent" class="icon-wrapper">
            <van-icon name="plus"/>
          </span>
        </p>
        <p class="complete-photo">
          <span>完成拍照</span>
          <ul class="photo-list">
            <li v-for="(item,index) in completeImageList" :key="`${item}-${index}`">
              <img width="100" height="130" :src="item"/>
              <van-icon name="cross" @click="completeDelete(index)"/>
            </li>
          </ul>
          <span @click="completeClickEvent" class="icon-wrapper">
            <van-icon name="plus"/>
          </span>
        </p>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="fillConsumable">填写耗材</p>
        <p class="quit-account" @click="completeTask">完成工单</p>
      </div>
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>从图库中选择
        </div>
        <div class="photo-graph">
          <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera"/>拍照
        </div>
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
  export default {
    name: 'WorkOrderDetails',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        photoBox: false,
        clickIssue: false,
        clickComplete: false,
        issueImageList: [],
        completeImageList: [],
        name: '撒飒飒',
        phoneNumber: '132212121',
        departmentName: '工程部',
        personPosition: '维修员'
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        })
      };
      document.addEventListener('click', (e) => {
        if(e.target.className!='van-icon van-icon-plus'){
          this.photoBox = false;
        }
      })
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

    methods:{
      ...mapMutations([
        'changeTitleTxt'
      ]),

      //返回上一页
      backTo () {
        this.$router.push({path: 'repairsWorkOrder'});
        this.changeTitleTxt({tit:'报修工单'});
        setStore('currentTitle','报修工单')
      },

      // 拍照问题照片点击
      issueClickEvent () {
        this.photoBox = true;
        this.clickIssue = true;
        this.clickComplete = false
      },

      // 拍照完成照片点击
      completeClickEvent () {
        this.photoBox = true;
        this.clickIssue = false;
        this.clickComplete = true
      },

      // 问题照片删除
      issueDelete (index) {
        this.issueImageList.splice(index,1)
      },

      // 问题照片删除
      completeDelete (index) {
        this.completeImageList.splice(index,1)
      },

      // 图片上传预览
      previewFileOne() {
        let file = document.getElementById("demo1").files[0];
        let _this = this;
        let reader = new FileReader();
        let isLt2M = file.size/1024/1024 < 16;
        if (!isLt2M) {
          this.$dialog.alert({
            message: '上传图片大小不能超过16MB!',
            closeOnPopstate: true
          }).then(() => {
          });
          return
        };  
        reader.addEventListener("load", function () {
          if (_this.clickIssue) {
            _this.issueImageList.push(reader.result)
          } else {
            _this.completeImageList.push(reader.result)
          };
          // _this.upImgUrl = reader.result;
          // 存储上传的照片
          // _this.storePhoto(reader.result)
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      //拍照预览
      previewFileTwo() {
        let file = document.getElementById("demo2").files[0];
        let _this = this;
        let reader = new FileReader();
        let isLt2M = file.size/1024/1024 < 16;
        if (!isLt2M) {
          _this.$dialog.alert({
            message: '上传图片大小不能超过16MB!',
            closeOnPopstate: true
          }).then(() => {
          });
          return
        };  
        reader.addEventListener("load", function () {
          if (this.clickIssue) {
            _this.issueImageList.push(reader.result)
          } else {
            _this.completeImageList.push(reader.result)
          };
          // 存储上传的照片
          // _this.storePhoto(reader.result)
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      // 填写耗材
      fillConsumable () {
        this.$router.push({path: 'fillConsumable'});
        this.changeTitleTxt({tit:'填写耗材'});
        setStore('currentTitle','填写耗材')
      },

      // 完成工单
      completeTask () {
        this.$router.push({path: 'workOrderSignature'});
        this.changeTitleTxt({tit:'工单完成签名'});
        setStore('currentTitle','工单完成签名')
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
              top: 16px;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: #2c65f7;
              font-weight: bold;
              right: 10px;
              top: 16px;
              width: 300px;
              padding-left: 50px;
              box-sizing: border-box;
              line-height: 18px;
              height: 65px;
              overflow: auto
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
              color: #2c65f7;
              font-weight: bold;
              right: 10px;
              top: 0
            }
          }
        }
      };
      .content-middle {
        flex: 1;
        margin: 0 auto;
        width: 100%;
        overflow: auto;
        font-size: 13px;
        background: #f7f7f7;
        position: relative;
        .photo-list {
          position: absolute;
          left: 70px;
          width: 250px;
          top: 10px;
          height: 100px;
          overflow: auto;
          li {
            width: 80px;
            height: 80px;
            float: left;
            margin-right: 4px;
            position: relative;
            /deep/ .van-icon-cross {
              position: absolute;
              top: 0;
              right:0;
              color: #fff;
              font-size: 20px;
            };
            img {
              width: 100%;
              height: 100%
            };
            &:last-child {
              margin-right: 0
            }
          }
        }
        .issue-photo {
          position: relative;
          top: 20px;
          left: 0;
          height: 100px;
          background: #fff;
          line-height: 100px;
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
              color: #2c65f7;
              font-size: 34px;
              font-weight: bold;
              right: 10px;
              top: 4px
            }
          }
        };
        .complete-photo {
          position: relative;
          margin-top: 20px;
          top: 20px;
          left: 0;
          height: 100px;
          background: #fff;
          line-height: 100px;
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
              color: #2c65f7;
              font-size: 34px;
              font-weight: bold;
              right: 10px;
              top: 4px
            }
          }
        }
      };
      .content-bottom {
        height: 100px;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        background: #f7f7f7;
        position: relative;
        .back-home {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          top: 5px;
          background: #fff;
          color: #2c65f7;
          font-weight: bold;
          text-align: center;
          border: 1px solid #2c65f7
        };
        .quit-account {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          bottom: 5px;
          background: #2c65f7;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      };
      .choose-photo-box {
        position: fixed;
        left: 0;
        bottom: 0;
        background: #fff;
        width: 100%;
        z-index: 1000;
        > div {
          width: 100%;
          text-align: center
        }
        .choose-photo {
          padding: 8px 10px;
          height: 30px;
          line-height: 30px;
          position: relative;
          cursor: pointer;
          color: #888;
          background: #fff;
          border-bottom: 1px solid #ddd;
          overflow: hidden;
          display: inline-block;
          *display: inline;
          *zoom: 1;
          input {
            position: absolute;
            font-size: 100px;
            right: 0;
            top: 0;
            opacity: 0;
            filter: alpha(opacity=0);
            cursor: pointer
          }
        };
        .photo-graph {
          position: relative;
          display: inline-block;
          background: #fff;
          padding: 8px 12px;
          overflow: hidden;
          color: #1E88C7;
          text-decoration: none;
          text-indent: 0;
          line-height: 30px;
          input {
            position: absolute;
            font-size: 100px;
            right: 0;
            top: 0;
            opacity: 0;
          }
        }
      }
    }
  }
</style>
