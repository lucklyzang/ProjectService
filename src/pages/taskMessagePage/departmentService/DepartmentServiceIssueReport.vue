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
      <div class="content-top">
        <div class="content-top-other">
          <p>问题名称</p>
          <p>
            <van-field
              placeholder="请输入问题名称"
              v-model="issueName"
            />
          </p>
        </div>
        <div class="content-top-other">
          <p>地点</p>
          <p>
            <van-field
              placeholder="请输入地点"
              v-model="pointName"
            />
          </p>
        </div>
        <div class="content-top-other-last">
          <p>时间</p>
          <p>
            <van-field v-model="currentTime" placeholder="请选择时间" readonly="readonly" @click="endTimePop = true"/>
          </p>
        </div>
      </div>
      <div class="content-middle">
        <p class="issue-photo">
          <span>问题拍照</span>
          <ul class="photo-list">
            <li v-for="(item,index) in issueImageList" :key="`${item}-${index}`">
              <img width="100" height="130" :src="item" @click="enlargeCompleteImgEvent(item)"/>
              <van-icon name="cross" @click="issueDelete(index)"/>
            </li>
          </ul>
          <span @click="issueClickEvent" class="icon-wrapper">
            <van-icon name="plus"/>
          </span>
        </p>
        <div class="content-top-name">
          <p>问题描述</p>
          <p>
            <van-field
              v-model="issueMessage"
              rows="1"
              autosize
              type="textarea"
              placeholder="请输入问题描述"
            />
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="cancel">取消</p>
        <p class="quit-account" @click="completeTask">确认上报</p>
      </div>
      <transition name="van-slide-up">
        <div class="choose-photo-box" v-show="photoBox">
          <div class="choose-photo">
            <van-icon name="photo" />
            <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>从图库中选择
          </div>
          <div class="photo-graph">
            <van-icon name="photograph" />
            <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera"/>拍照
          </div>
          <div class="photo-cancel" @click="photoCancel">取消</div>
        </div>
      </transition>
    </div>
    <van-popup v-model="endTimePop" title="" position="bottom" :overlay="true"> 
      <van-datetime-picker  v-model="currentDateStart" type="datetime"  :min-date="minDateEnd"
      @cancel="endTimePop = false"  @confirm="endTimePop = false"  @change="timeChange"/>
    </van-popup>
    <van-dialog v-model="enlargeImgShow" width="90%">
      <img :src="enlargeImgUrl">
    </van-dialog>
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, deepClone, repeArray, compress } from '@/common/js/utils'
  import {reportProblem} from '@/api/worker.js'
  export default {
    name: 'DepartmentServiceIssueReport',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker,
      Loading
    },
    data() {
      return {
        photoBox: false,
        endTimePop: false,
        enlargeImgShow: false,
        loadinText: '',
        overlayShow: false,
        currentDepartmentId: '',
        enlargeImgUrl: '',
        currentDateStart: new Date(),
        minDateEnd: new Date(2020, 0, 1),
        issueName: '',
        showLoadingHint: false,
        pointName: '',
        currentTime: '',
        issueImageList: [],
        issueMessage: ''
      }
    },
    
    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          this.$router.push({path: 'departmentServiceBill'});
          this.changeTitleTxt({tit:'科室巡检单'});
          setStore('currentTitle','科室巡检单')
        })
      };
      document.addEventListener('click', (e) => {
        if(e.target.className !='van-icon van-icon-plus' && e.target.className != 'quit-account'){
          this.photoBox = false;
          this.overlayShow = false
        }
      });
      this.initDate();
      this.echoCurrentDepartmentId()
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'userInfo',
        'departmentServiceMsg',
        'isCurrentDepartmentServiceVerifySweepCode',
        'currentDepartmentServiceCheckedItemId',
        'completeDepartmentServiceCheckedItemList'
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
        'changeCompleteDepartmentServiceCheckedItemList',
        'changeCurrentDepartmentServiceCheckedItemId'
      ]),

      // 回显当前检修科室名称
      echoCurrentDepartmentId () {
        if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
        let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
        if (echoIndex == -1) { return };
        this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
      },

      //返回上一页
      backTo () {
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
      },

      // 放大维修后图片点击事件
      enlargeCompleteImgEvent (item) {
        this.enlargeImgShow = true;
        this.enlargeImgUrl = item
      },

      // 时间框改变事件
      timeChange (e) {
        let endTimeArr = e.getValues();
        this.currentTime = `${endTimeArr[0]}-${endTimeArr[1]}-${endTimeArr[2]} ${endTimeArr[3]}:${endTimeArr[4]}`
      },

      // 初始化时间显示框
      initDate () {
        let currentDateList = formatTime('YYYY-MM-DD hh:mm').split('-');
        this.currentTime = `${currentDateList[0]}-${currentDateList[1]}-${currentDateList[2]}`
      },

      // 拍照问题照片点击
      issueClickEvent () {
        this.photoBox = true;
        this.overlayShow = true
      },

      // 问题照片删除
      issueDelete (index) {
        this.issueImageList.splice(index,1)
      },

      // 图片上传预览
      previewFileOne() {
        let Orientation;
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
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img,Orientation);
             _this.issueImageList.push(src)
          }
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      //拍照预览
      previewFileTwo() {
        let Orientation;
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
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img,Orientation);
            _this.issueImageList.push(src)
          }
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      // 拍照取消
      photoCancel () {
        this.photoBox = false;
        this.overlayShow = false
      },

      // 取消
      cancel () {
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
      },

      // 存储完成问题上报的检查项信息
      storageCompleteCheckItemInfo () {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.completeDepartmentServiceCheckedItemList);
        if (this.completeDepartmentServiceCheckedItemList.length > 0 ) {
          let temporaryIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            // 存储问题的解决方式
            let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
            // 删除重复的id
            temporaryDepartmentId = temporaryDepartmentId.filter((item) => {return item.id !== this.currentDepartmentServiceCheckedItemId.id});
            temporaryCheckItemInfo['checkResult'] = 2;
            this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
            temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId);
            temporaryOfficeList[temporaryIndex]['depId'] = this.currentDepartmentId
          } else {
            // 存储问题的解决方式
            let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
            temporaryCheckItemInfo['checkResult'] = 2;
            this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
            temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
            temporaryOfficeList.push(
              { 
                officeList: repeArray(temporaryDepartmentId),
                taskId: this.taskId,
                depId: this.currentDepartmentId
              }
            )
          }
        } else {
          // 存储问题的解决方式
          let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
          temporaryCheckItemInfo['checkResult'] = 2;
          this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
          temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
          temporaryOfficeList.push(
            { 
              officeList: repeArray(temporaryDepartmentId),
              taskId: this.taskId,
              depId: this.currentDepartmentId
            }
          )
        };
        this.changeCompleteDepartmentServiceCheckedItemList(temporaryOfficeList);
        setStore('isCompleteDepartmentServiceCheckedItemList', {"sweepCodeInfo": temporaryOfficeList})
      },

      // 完成工单
      completeTask () {
        this.loadinText = '上报中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        let data = {
          taskDesc: this.issueName,    //问题描述  必填
          taskRemark: this.issueMessage,  //问题详情  非必输
          depId: this.currentDepartmentId,      //科室ID   必输
          workerId: this.workerId,   //上报人ID，及当前登录用户ID 必输
          workerName: "",  //当前登录用户名 非必输
          space: this.pointName,
          proId: this.proId,      //项目ID 必输
          images: this.issueImageList // 问题图片信息 非必输
        }
        reportProblem(data).then((res) => {
          this.showLoadingHint = false;
          this.overlayShow = false;
          if (res && res.data.code == 200) {
            this.$toast('上报成功');
            this.storageCompleteCheckItemInfo();
            this.$router.push({path: 'departmentServiceBill'});
            this.changeTitleTxt({tit:'科室巡检单'});
            setStore('currentTitle','科室巡检单')
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
    };
    /deep/ .van-dialog {
      width: 95% !important;
      top: 50% !important;
      .van-dialog__content {
        height: 90vh;
        img {
          width: 100%;
          height: 100%
        }
      }
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-top {
        background: #fff;
        font-size: 14px;
        .content-top-other {
          height: 55px;
          line-height: 55px;
          box-sizing: border-box;
          position: relative;
          border-bottom: 4px solid #f7f7f7;
          > p {
            position: absolute;
            height: 55px;
            &:first-child {
              left: 0;
              width: 20%;
              top: 0;
              color: #bbbaba;
              padding-left: 10px;
            };
            &:last-child {
              color: @color-theme;
              width: 80%;
              font-weight: bold;
              right: 0;
              top: 0;
              /deep/ .van-cell {
                padding: 0;
                height: 55px;
                line-height: 55px;
                box-sizing: border-box;
                border-bottom: 4px solid #f7f7f7;
                .van-field__value {
                }
              }
            }
          }
        };
        .content-top-other-last {
          height: 55px;
          line-height: 55px;
          box-sizing: border-box;
          position: relative;
          border-bottom: 4px solid #f7f7f7;
          > p {
            position: absolute;
            &:first-child {
              left: 0;
              width: 20%;
              top: 0;
              color: #bbbaba;
              padding-left: 10px
            };
            &:last-child {
              color: @color-theme;
              width: 80%;
              font-weight: bold;
              right: 0;
              top: 0;
              /deep/ .van-cell {
                padding: 10px 4px;
                .van-field__value {
                  margin-top: 5px
                }
              }
            }
          }
        }
      };
      .content-middle {
        flex: 1;
        margin: 0 auto;
        width: 100%;
        overflow: auto;
        font-size: 14px;
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
            margin-bottom: 4px;
            /deep/ .van-icon-cross {
              position: absolute;
              top: 0;
              right:0;
              color: @color-theme;
              font-size: 20px;
            };
            img {
              width: 100%;
              height: 100%
            };
            &:nth-of-type(3n+0)
            {
              margin-right: 0
            }
          }
        }
        .issue-photo {
          position: relative;
          margin-top: 15px;
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
              color: @color-theme;
              font-size: 34px;
              font-weight: bold;
              right: 10px;
              top: 4px
            }
          }
        };
        .content-top-name {
          height: auto;
          padding: 10px;
          box-sizing: border-box;
          position: relative;
          display: block;
          background: #fff;
          border-top: 15px solid #f7f7f7;
          > p {
            width: 100%;
            &:first-child {
              height: 26px;
              line-height: 26px;
              color: #bbbaba;
            
            };
            &:last-child {
              margin-top: 2px;
              color: black;
              /deep/ .van-cell {
                padding: 10px 4px;
                border: 1px solid #e3e3e3
              }
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
          color: @color-theme;
          font-weight: bold;
          text-align: center;
          outline: 1px solid @color-theme
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
          background: @color-theme;
          color: #fff;
          font-weight: bold;
          text-align: center
        }
      };
      .choose-photo-box {
        position: fixed;
        margin: auto;
        left: 0;
        bottom: 0;
        width: 100%;
        z-index: 1000;
        font-size: 0;
        > div {
          width: 100%;
          text-align: center;
          font-size: 16px;
          background: #f6f6f6
        }
        .choose-photo {
          padding: 8px 10px;
          height: 30px;
          .bottom-border-1px(#cbcbcb);
          line-height: 30px;
          position: relative;
          cursor: pointer;
          color: @color-theme;
          overflow: hidden;
          display: inline-block;
          *display: inline;
          *zoom: 1;
          /deep/ .van-icon {
            vertical-align: top;
            font-size: 20px;
            display: inline-block;
            line-height: 30px
          };
          input {
            position: absolute;
            font-size: 100px;
            right: 0;
            top: 0;
            height: 100%;
            opacity: 0;
            filter: alpha(opacity=0);
            cursor: pointer
          }
        };
        .photo-graph {
          position: relative;
          display: inline-block;
          height: 50px;
          overflow: hidden;
         .bottom-border-1px(#cbcbcb);
          color: @color-theme;
          text-decoration: none;
          text-indent: 0;
          line-height: 50px;
          /deep/ .van-icon {
            vertical-align: top;
            font-size: 20px;
            display: inline-block;
            line-height: 50px
          };
          input {
            position: absolute;
            font-size: 100px;
            right: 0;
            height: 100%;
            top: 0;
            opacity: 0;
          }
        };
        .photo-cancel {
          position: relative;
          display: inline-block;
          padding: 8px 12px;
          overflow: hidden;
          color: @color-theme;
          text-decoration: none;
          text-indent: 0;
          line-height: 30px;
          font-weight: bold
        }
      }
    }
  }
</style>
