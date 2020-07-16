<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
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
              <img width="100" height="130" :src="item"/>
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
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>从图库中选择
        </div>
        <div class="photo-graph">
          <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera"/>拍照
        </div>
      </div>
    </div>
    <van-popup v-model="endTimePop" title="" position="bottom" :overlay="true"> 
      <van-datetime-picker  v-model="currentDateStart" type="datetime"  :min-date="minDateEnd"
      @cancel="endTimePop = false"  @confirm="endTimePop = false"  @change="timeChange"/>
    </van-popup>
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
    name: 'DepartmentServiceIssueReport',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        photoBox: false,
        endTimePop: false,
        currentDateStart: new Date(),
        minDateEnd: new Date(2020, 0, 1),
        issueName: '',
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
        if(e.target.className!='van-icon van-icon-plus'){
          this.photoBox = false;
        }
      });
      this.initDate()
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
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
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
        this.photoBox = true
      },

      // 问题照片删除
      issueDelete (index) {
        this.issueImageList.splice(index,1)
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
            _this.issueImageList.push(reader.result)
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
          _this.issueImageList.push(reader.result)
          // 存储上传的照片
          // _this.storePhoto(reader.result)
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      // 取消
      cancel () {
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
      },

      // 完成工单
      completeTask () {
        this.$router.push({path: 'departmentServiceBill'});
        this.changeTitleTxt({tit:'科室巡检单'});
        setStore('currentTitle','科室巡检单')
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
              color: #2c65f7;
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
              color: #2c65f7;
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
              color: #fff;
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
              color: #2c65f7;
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
          color: #2c65f7;
          font-weight: bold;
          text-align: center;
          outline: 1px solid #2c65f7
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
