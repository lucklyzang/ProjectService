<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
    <!-- <NavBar path="/AutoRepairCreate" title="工单完成签名" :leftArrow="false" :leftText="null" /> -->
    </div>
    <div class="content">
      <div class="content-left">
        <ElectronicSignature ref="mychild"></ElectronicSignature>
        <div class="btn-area">
          <div class="cancel-btn" @click="cancel">
            <span>取</span>
            <span>消</span>
          </div>
          <div class="overwrite-btn" @click="rewrite">
            <span>重</span>
            <span>写</span>
          </div>
          <div class="sure-btn" @click="sure">
            <span>确</span>
            <span>认</span>
          </div>
        </div> 
      </div>
      <div class="content-right">
        <span>工</span>
        <span>单</span>
        <span>完</span>
        <span>成</span>
        <span>签</span>
        <span>名</span>
      </div>
    </div>
  </div>
</template>
<script>
import ElectronicSignature from '@/components/ElectronicSignature'
import { mapGetters, mapMutations } from "vuex";
// import { taskComplete } from '@/api/escortManagement.js'
import {getAliyunSign} from '@/api/login.js'
import { base64ImgtoFile } from '@/common/js/utils'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import axios from 'axios'
export default {
  name: "AutoRepairTaskSignature",
  components: {
    ElectronicSignature
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      loadingShow: false,
      isExpire: false,
      isAllTaskComplete: true,
      loadText: '提交中',
      fromPathSource: '',
      imgOnlinePathArr: [],
      currentTaskSetId: '',
      timeTabIndex: 0,
      taskSetTime: '',
      taskSetName: '',
      taskSetNameIndex: 0,
      allPatrolTaskDetailsData: [],
      timeList: []
    }
  },

  mounted() {
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      vm.fromPathSource = from.path
	  });
    next() 
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","submitAutoRepairTaskMessage","currentElectronicSignature","createAutoRepairTaskMessage","patrolTaskListMessage","ossMessage","timeMessage","originalSignature","devicePatrolDetailsSelectMessage"])
  },

  methods: {
    ...mapMutations(["changeOssMessage","changeTimeMessage","changePatrolTaskListMessage","changeCreateAutoRepairTaskMessage"]),


    resizeScreen() {
      const _this = this;
      // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
      const detectOrient = function() {
        console.log('静茹了');
        let width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        $wrapper = _this.$refs.wrapper, // 页面最外层元素
          style = "";
        if (width >= height) {
          // 横屏
          style += "width:" + width + "px;"; // 注意旋转后的宽高切换
          style += "height:" + height + "px;";
          style += "-webkit-transform: rotate(0); transform: rotate(0);";
          style += "-webkit-transform-origin: 0 0;";
          style += "transform-origin: 0 0;";
        } else {
          // 竖屏
          console.log('竖屏了');
          style += "width:" + height + "px;";
          style += "height:" + width + "px;";
          style += "min-height:auto;";
          style +=
            "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
          // 注意旋转中点的处理
          style +=
            "-webkit-transform-origin: " +
            width / 2 +
            "px " +
            width / 2 +
            "px;";
          style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        }
        $wrapper.style.cssText = style;
      };
      window.onresize = detectOrient;
      detectOrient()
    },

    // 签名重写
    rewrite () {
      this.$refs.mychild.overwrite()
    },

    // 签名确认
    async sure () {
      this.$refs.mychild.commitSure();
      if (this.currentElectronicSignature == this.originalSignature || !this.currentElectronicSignature) {
        this.$toast('签名不能为空');
        return
      };
      // 上传图片到阿里云服务器
      this.loadText ='提交中';
      this.overlayShow = true;
      this.loadingShow = true;
      if (Object.keys(this.timeMessage).length > 0) {
        // 判断签名信息是否过期
        if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
          await this.getSign();
          await this.uploadImageToOss(this.currentElectronicSignature)
        } else {
          await this.uploadImageToOss(this.currentElectronicSignature)
        }
      } else {
        await this.getSign();
        await this.uploadImageToOss(this.currentElectronicSignature)
      };
      // 完成任务接口
      taskComplete({
        taskId: this.$route.query.taskId, // 当前任务id
        signImage: this.imgOnlinePathArr[0], // 签名路径
        workerName: this.userInfo.name // 当前登陆员工
      }).then((res) => {
      if (res && res.data.code == 200) {
        this.loadingShow = false;
        this.overlayShow = false;
        this.addSuccessSign();
        this.judgeCurrentDateTaskIsAllComplete();
        if (this.isAllTaskComplete) {
          this.deleteCompleteEntiretyTask()
        };
        this.$router.push({path: '/equipmentPatrolDetails'})
      } else {
        this.imgOnlinePathArr = [];
        this.$toast({
          type: 'fail',
          message: res.data.msg
        })
      }
    })
    .catch((err) => {
      this.imgOnlinePathArr = [];
      this.loadingShow = false;
      this.overlayShow = false;
      this.$toast({
        type: 'fail',
        message: err
      })
    });
    console.log('签名',this.currentElectronicSignature)
  },

  // 判断当前日期的任务是否全部完成
  judgeCurrentDateTaskIsAllComplete () {
    let temporaryPatrolTaskListMessage = _.cloneDeep(this.patrolTaskListMessage);
    let temporaryIndex = temporaryPatrolTaskListMessage.findIndex((item) => { return item.date == (JSON.stringify(this.devicePatrolDetailsSelectMessage) == '{}' ? this.getNowFormatDate(new Date(),'day') : this.devicePatrolDetailsSelectMessage.showDate)});
    // 从store中取存储过的当前巡检任务信息
    this.allPatrolTaskDetailsData = temporaryPatrolTaskListMessage[temporaryIndex]['content'];
    for (let i = 0,len = this.allPatrolTaskDetailsData.length;i<len;i++) {
      Object.keys(this.allPatrolTaskDetailsData[i]['deviceListByTime']).forEach((item) => {
        Object.keys(this.allPatrolTaskDetailsData[i]['deviceListByTime'][item]).forEach((itemTwo) => {
          for (let innerI = 0,innerLen = this.allPatrolTaskDetailsData[i]['deviceListByTime'][item][itemTwo].length;innerI<innerLen;innerI++) {
            if (!this.allPatrolTaskDetailsData[i]['deviceListByTime'][item][itemTwo][innerI]['isTaskComplete']) {
              this.isAllTaskComplete = false;
              break
            }
          }
        })
      })
    };
    console.log('sa',this.isAllTaskComplete);
  },

  // 删除所有任务集的任务都完成的存储的所属日期的任务
  deleteCompleteEntiretyTask () {
    let currentDate = JSON.stringify(this.devicePatrolDetailsSelectMessage) == '{}' ? this.getNowFormatDate(new Date(),'day') : this.devicePatrolDetailsSelectMessage.showDate;
    let temporaryData = _.cloneDeep(this.patrolTaskListMessage);
    temporaryData = temporaryData.filter((item) => { return item.date != currentDate });
    this.changePatrolTaskListMessage(temporaryData)
  },

    // 获取阿里云签名接口
    getSign (filePath = '') {
      return new Promise((resolve, reject) => {
        getAliyunSign().then((res) => {
          if (res && res.data.code == 200) {
            // 存储签名信息
            this.changeOssMessage(res.data.data);
            let temporaryTimeInfo = {};
            temporaryTimeInfo['expire'] = Number(res.data.data.expire);
            // 存储过期时间信息
            this.changeTimeMessage(temporaryTimeInfo);
            if (this.isExpire) {
              this.uploadImageToOss(filePath)
            };
            this.isExpire = false;
            resolve()
          } else {
            this.overlayShow = false;
            this.loadingShow = false;
            this.$toast({
              message: `${res.data.msg}`,
              type: 'fail'
            });
            reject()
          }
        })
        .catch((err) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.$toast({
            message: `${err}`,
            type: 'fail'
          });
          reject()
        })
      })	
    },
    
    // 上传图片到阿里云服务器
    uploadImageToOss (filePath) {
      return new Promise((resolve, reject) => {
      // OSS地址
      const aliyunServerURL = this.ossMessage.host;
      // 存储路径(后台固定位置+随即数+文件格式)
      const aliyunFileKey = this.ossMessage.dir + new Date().getTime() + Math.floor(Math.random() * 100) + base64ImgtoFile(filePath).name;
      // 临时AccessKeyID0
      const OSSAccessKeyId = this.ossMessage.accessid;
      // 加密策略
      const policy = this.ossMessage.policy;
      // 签名
      const signature = this.ossMessage.signature;
      let formData = new FormData();
      formData.append('key',aliyunFileKey);
      formData.append('policy',policy);
      formData.append('OSSAccessKeyId',OSSAccessKeyId);
      formData.append('success_action_status','200');
      formData.append('Signature',signature);
      formData.append('file',base64ImgtoFile(filePath));
      axios({
          url: aliyunServerURL,
          method: 'post',
          data: formData,
          headers: {'Content-Type': 'multipart/form-data'}
      }).then((res) => {
          this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
          resolve()
      })
      .catch((err) => {
        this.overlayShow = false;
        this.loadingShow = false;
        this.$toast({
          message: `${err}`,
          type: 'fail'
        });
        reject()
      })
      })
    },

    // 获取当前日期(-)
    getNowFormatDate(currentDate,type) {
        let currentdate;
        let strDate;
        let seperator1 = "-";
        let month = currentDate.getMonth() + 1;
        strDate = currentDate.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        };
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        };
        if ( type == 'month') {
            currentdate = currentDate.getFullYear() + seperator1 + month
        } else {
            currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate
        };
        return currentdate
    },

    // 拼接完整时间
    getFullDate(hourTime) {
      let currentdate;
      let strDate;
      let seperator1 = "-";
      let month = new Date().getMonth() + 1;
      strDate = new Date().getDate();
      if (month >= 1 && month <= 9) {
          month = "0" + month;
      };
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      };
      currentdate = new Date().getFullYear() + seperator1 + month + seperator1 + strDate
      return currentdate + ' ' + hourTime
    },

    // 获取当前离任务开始时间最近的时间点
    disposeTime (item) {
      if (Object.prototype.toString.call(item) === '[object Array]') {
        if (item.length > 0) {
          let temporaryArr = [];
          if (item.length == 1) { temporaryArr.push(item[item.length-1]);return temporaryArr.join(',') };
          // 当当前时间大于或等于开始时间集合里最大的时间(时间集合的最后一位)时,就显示开始时间集合里最大的时间
          if (new Date().getTime() >= new Date(this.getFullDate(item[item.length-1])).getTime()) {
            temporaryArr.push(item[item.length-1])
          } else {        
            for (let i=0, len = item.length; i<len; i++) {
              if (i > 0) {
                if (new Date().getTime() < new Date(this.getFullDate(item[i])).getTime()) {
                  temporaryArr.push(item[i-1])
                  break
                }
              }    
            }
          };
          return temporaryArr.join(',')
        }
      }
    },

    echoSelectMessage () {
      this.taskSetNameIndex = this.allPatrolTaskDetailsData.indexOf(this.allPatrolTaskDetailsData.filter((item) => { return item.configName == this.devicePatrolDetailsSelectMessage['selectTaskSet']})[0]);
      this.timeTabIndex = this.timeList.indexOf(this.devicePatrolDetailsSelectMessage['selectTime'])
    },

    // 为提交成功的任务添加成功标记
    addSuccessSign () {
        let temporaryPatrolTaskListMessage = _.cloneDeep(this.patrolTaskListMessage);
        let temporaryIndex = temporaryPatrolTaskListMessage.findIndex((item) => { return item.date == (JSON.stringify(this.devicePatrolDetailsSelectMessage) == '{}' ? this.getNowFormatDate(new Date(),'day') : this.devicePatrolDetailsSelectMessage.showDate)});
        // 从store中取存储过的当前巡检任务信息
        this.allPatrolTaskDetailsData = temporaryPatrolTaskListMessage[temporaryIndex]['content'];
        this.taskSetNameIndex = this.allPatrolTaskDetailsData.indexOf(this.allPatrolTaskDetailsData.filter((item) => { return item.configName == this.devicePatrolDetailsSelectMessage['selectTaskSet']})[0]);
        this.taskSetNameIndex =  this.taskSetNameIndex == -1 ? 0 : this.taskSetNameIndex;
        this.timeList = arrDateTimeSort(Object.keys(this.allPatrolTaskDetailsData[this.taskSetNameIndex]['deviceListByTime']));
        this.echoSelectMessage();
        this.taskSetNameIndex =  this.taskSetNameIndex == -1 ? 0 : this.taskSetNameIndex;
        this.currentTaskSetId = this.allPatrolTaskDetailsData[this.taskSetNameIndex]['configId'];
        this.taskSetName = this.allPatrolTaskDetailsData[this.taskSetNameIndex]['configName'];
        // 判断之前有没有存储选中的时间信息
        this.taskSetTime = this.timeTabIndex == -1 ? this.disposeTime(this.timeList) : this.timeList[this.timeTabIndex];
        this.timeTabIndex = this.timeList.indexOf(this.taskSetTime);
        let temporaryDataOne = temporaryPatrolTaskListMessage.filter((item) => { return item.date == (JSON.stringify(this.devicePatrolDetailsSelectMessage) == '{}' ? this.getNowFormatDate(new Date(),'day') : this.devicePatrolDetailsSelectMessage.showDate)})[0]['content'];
        let temporaryIndexOne = temporaryDataOne.findIndex((item) => { return item['configName'] == this.taskSetName});
        Object.keys(temporaryDataOne[temporaryIndexOne]['deviceListByTime'][this.taskSetTime]).forEach((item) => {
          temporaryDataOne[temporaryIndexOne]['deviceListByTime'][this.taskSetTime][item].forEach((item) => {
            item['isTaskComplete'] = true
          })
        });
        let storeIndex = temporaryPatrolTaskListMessage.findIndex((item) => { return item.date == (JSON.stringify(this.devicePatrolDetailsSelectMessage) == '{}' ? this.getNowFormatDate(new Date(),'day') : this.devicePatrolDetailsSelectMessage.showDate)});
        temporaryPatrolTaskListMessage[storeIndex]['content'] = temporaryDataOne;
        this.changePatrolTaskListMessage(temporaryPatrolTaskListMessage);
    },

    // 签名取消
    cancel () {
      this.$refs.mychild.overwrite();
      this.$router.push({path: '/autoRepairCreate'})
    },
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  height: 0;
  .van-overlay {
    z-index: 1000 !important
  };
  .van-loading {
    z-index: 10000 !important
  };
  .nav {
    width: 100%;
    height: 46px;
    /deep/ .van-nav-bar {
        .van-nav-bar__left {
        .van-nav-bar__text {
            color: #101010 !important;
            margin-left: 8px !important;
        }
        }
        .van-icon {
            color: #101010 !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
          color: #101010 !important;
          font-size: 16px !important;
          margin: 0 !important;
          margin-left: 2% !important
        }
    }
  };
  .content {
    width: 92%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: row;
    height: 0;
    .content-left {
      display: flex;
      flex: 1;
      flex-direction: column;
      .signature {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        /deep/ .signatureBox {
            width: 100% !important;
            flex: 1
        }
      };
      .btn-area {
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 150px;
        >div {
          font-size: 14px;
          border-radius: 4px;
          margin-right: 20px;
          width: 39px;
          height: 95px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          >span {
            transform: rotate(90deg);
            margin-bottom: 2px
          }
        }
        .cancel-btn {
            background: #1684FC;
            color: #fff

        };
        .overwrite-btn {
            border: 1px solid #1684FC;
            color: #1684FC
        };
        .sure-btn {
            background: #E86F50;
            color: #fff;
            margin-right: 0
        }
      }
    };
    .content-right {
      width: 50px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 20px;
      color: #101010;
      >span {
        transform: rotate(90deg)
      }
    }  
  }
}
</style>