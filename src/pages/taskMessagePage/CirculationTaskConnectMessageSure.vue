<template>
   <div class="content-wrapper">
    <!-- 顶部导航栏 -->
    <HeaderTop :title="navTopTitle">
      <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      <!-- <van-icon name="manager-o" slot="right" @click="skipMyInfo"></van-icon>  -->
    </HeaderTop>
     <!-- 右边下拉框菜单 -->
    <ul class="left-dropDown" v-show="leftDownShow">
      <li v-for="(item, index) in leftDropdownDataList" :key="index" :class="{liStyle:liIndex == index}" @click="leftLiCLick(index)">{{item}}</li>
    </ul>
    <div class="sweep-code-title">
      <h3>交接信息确认</h3>
    </div>
     <div class="sweep-code-area">
      <div class="sample-type-list" v-for="(item,index) in manageSampleDataList" :key="`${item}-${index}`">
        <div class="sample-type-title-wrapper">
          <div class="sample-type-title">{{item.sampleTypeName}}</div>
          <!-- <div class="sample-type-stepper">
            <van-stepper  v-model="item.sampleNumber" min="0" disabled/>
          </div> -->
          <div class="sample-type-total">{{item.sampleTotal}}</div>
        </div>
        <div class="sample-type-message-wrapper">
          <div class="sample-type-message-list" v-for="(innerItem,innerIndex) in item.sampleList" :key="`${innerItem}-${innerIndex}`">
            <div class="sample-type-message-list-inner-erapper">
              <p>
                <span class="message-tit">科室:</span>
                <span class="message-tit-real">{{innerItem.spaceName}}</span>
              </p>
              <P>
                <span class="message-tit">收集时间:</span>
                <span class="message-tit-real">{{innerItem.collectionTime}}</span>
              </P>
            </div>
            <div class="sample-type-message-list-inner-erapper">
              <p>
                <span class="message-tit">病人姓名:</span>
                <span class="message-tit-real">{{innerItem.patientName}}</span>
              </p>
              <P>
                <span class="message-tit">病人床号:</span>
                <span class="message-tit-real">{{innerItem.bedNumber}}</span>
              </P>
            </div>
            <div class="sample-type-message-list-inner-erapper">
              <p>
                <span class="message-tit">标本数量:</span>
                <span class="message-tit-real">{{innerItem.quantity}}</span>
              </p>
              <!-- <P>
                <span class="message-tit">检查项:</span>
                <span class="message-tit-real">
                    <van-checkbox-group  v-model="innerItem.checkEntryList" direction="horizontal">
                      <van-checkbox
                        shape="quare"
                        disabled
                        v-for="(item,index) in innerItem.collectionItem"
                        :key="`${item}-${index}`"
                        :name='`{"itemName":"${item.itemName}","id":"${item.id}"}`'
                      >
                        {{ item.itemName }}
                      </van-checkbox>
                    </van-checkbox-group>
                </span>
              </P> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="electronic-signature" v-if="showSignature">
      <ElectronicSignature></ElectronicSignature>
    </div>
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="connectMessageSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="connectMessageCancel">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import ElectronicSignature from '@/components/ElectronicSignature'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import FooterBottom from '@/components/FooterBottom'
import {sampleDelivery, updateCirculationTask} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, deepClone } from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'circulationTaskConnectMessageSure',
  data () {
    return {
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      showSignature: false,
      isDialogShow: false,
      isClickCancelBtn: false,
      showSignatureBox: false,
      liIndex: null,
      manageSampleDataList: [],
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png')
    };
  },

  components:{
    VanFieldSelectPicker,
    HeaderTop,
    NoData,
    FooterBottom,
    ElectronicSignature
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      pushHistory();
      this.gotoURL(() => {
        pushHistory();
        if (!this.isDialogShow) {
          this.loseDataInfo();
          return
        }
      })
    };
    this.echoConectMessage()
  },

  computed:{
    ...mapGetters([
      'navTopTitle',
      'currentElectronicSignature',
      'circulationConnectMessageList',
      'circulationTaskMessage',
      'storeArriveDeparnmentId',
      'storeAlreadyConnectSample',
      'storeNoConnectSample',
      'completeDeparnmentInfo',
      'circulationTaskId',
      'circulationDetails'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeIsrefreshCirculationConnectPage',
      'changeCirculationConnectMessageList',
      'changeCompleteDeparnmentInfo',
      'changeCurrentElectronicSignature',
      'changeIsstoreAlreadyConnectSample',
      'changeIsStoreNoConnectSample',
      'changeIsFreshCirculationTaskPage'
    ]),

      // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
      },

      // 丢失数据提示
      loseDataInfo () {
        this.isDialogShow = false;
        this.showSignatureBox = true;
        this.$dialog.alert({
          message: '返回上级后,将丢失本页数据!',
          closeOnPopstate: false,
          showCancelButton: true   
        }).then(() => {
          this.changeCurrentElectronicSignature({DtMsg: null});
          this.changeIsrefreshCirculationConnectPage(false);
          this.$router.push({path:'/circulationTaskMessageConnect'});
          this.changeTitleTxt({tit:'信息交接'});
          setStore('currentTitle','信息交接');
          this.isDialogShow = true;
          this.showSignatureBox = true
        })
        .catch(() => {
          this.isDialogShow = false;
          this.showSignatureBox = true;
        })
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

      // 显示签名框点击
      controlSignatureEvent () {
        this.showSignature = !this.showSignature
      },

    // 回显交接信息
    echoConectMessage () {
      this.manageSampleDataList = deepClone(this.circulationConnectMessageList)
    },

    // 返回上一页
    backTo () {
      this.loseDataInfo()
    },

    // 还有要交接的标本
    connectSure () {
      this.$toast('交接成功');
      // 当前页面回显数据
      this.manageSampleDataList = [];
      // 清空本页面store的签名数据
      this.changeCurrentElectronicSignature({DtMsg: null});
      // 清空上一页面store的已选择标本
      this.changeCirculationConnectMessageList({DtMsg:[]});
      // 清空上一页面Localstorage已选择标本
      removeStore('currentCirculationConnectMessage');
      this.$router.push({'path':'/circulationDetails'});
      this.changeTitleTxt({tit:'任务详情'});
      setStore('currentTitle','任务详情');
    },

    // 没有要交接的标本
    connectCancel () {
      this.updateCirculationtaskState({
        proId: this.proId,		 //当前项目ID
        id: this.circulationTaskId, //当前任务ID
        state: 7 //更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'}
      });
    },

    // 提交标本交接信息
    postSampleConnectMessage(data) {
      sampleDelivery(data).then((res) => {
        if (res && res.data.code == 200) {
          // 存储已经交接的标本信息
          let temporarySampleArrayOne = [];
          let temporarySampleArrayTwo = [];
          // store存的交接标本信息赋值
          temporarySampleArrayOne = deepClone(this.storeAlreadyConnectSample);
          // 将本次交接的标本信息和之前存的已交接标本信息合并
          temporarySampleArrayTwo = temporarySampleArrayOne.concat(this.circulationConnectMessageList);
          // 新的已交接标本信息重新存入store
          this.changeIsstoreAlreadyConnectSample(temporarySampleArrayTwo);
          this.changeCurrentElectronicSignature({DtMsg: null});
          // 删除本次locaStorage的交接科室id
          removeStore('currentDepartmentId');
          // 如果未交接的标本信息数量为0并且所有科室都已采集完成,则结束本次循环任务,更新该条任务状态为已完成
          if (this.storeNoConnectSample.length == 0) {
            if (this.circulationDetails['spaces'].every((item) => item.check) == true ) {
              this.connectCancel()
            } else {
              this.connectSure()
            }
          } else {
            this.connectSure()
          }
        } else {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: false
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
        })
      })
    },

    // 更新循环任务状态
    updateCirculationtaskState (data) {
      updateCirculationTask(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$toast('该条任务已完成');
          // 清空当前页面回显数据
          this.manageSampleDataList = [];
          // 清空本页store的签名信息
          this.changeCurrentElectronicSignature({DtMsg: null});
          // 清空上一页面store的标本选择信息
          this.changeCirculationConnectMessageList({DtMsg:[]});
          // 清空store已完成科室信息
          let temporaryCompleteInfo = deepClone(this.completeDeparnmentInfo);
          temporaryCompleteInfo = temporaryCompleteInfo.filter((item) => { return item.taskId != this.circulationTaskId});
          this.changeCompleteDeparnmentInfo({DtMsg: temporaryCompleteInfo});
          // 清空Localstorage的已完成科室信息
          setStore('completeDepartmentMessage', {"sureInfo": temporaryCompleteInfo});
          // 清空store没有完成交接的标本信息
          this.changeIsStoreNoConnectSample([]);
          // 清空store存储的已交接标本信息
          this.changeIsstoreAlreadyConnectSample([]);
          // 清空上一页面Localstorage标本选择信息
          removeStore('currentCirculationConnectMessage');
          this.$router.push({path:'/circulationTask'});
          this.changeTitleTxt({tit:'循环任务'});
          setStore('currentTitle','循环任务');
          this.changeIsFreshCirculationTaskPage(true)
        } else {
          this.$dialog.alert({
            message: `${res.data.data}`,
            closeOnPopstate: false
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
        })
      })
    },

     // 交接信息确认事件
    connectMessageSure () {
      // if (!this.showSignature) {
      //   this.showSignature = true;
      //   return
      // };
      // if (!this.currentElectronicSignature) {
      //   this.$dialog.alert({
      //     message: '签名不能为空，请确认签名!',
      //     closeOnPopstate: false
      //   }).then(() => {
      //   });
      //   return;
      // };
      let connectSampleId = [];
      // 获取需要交接的标本id
      for (let item of this.manageSampleDataList) {
        for (let innerItem in item) {
          if (innerItem == 'sampleList') {
            for (let currentItem of item['sampleList']) {
              for (let idFieId in currentItem) {
                if (idFieId == 'id') {
                  connectSampleId.push(currentItem[idFieId]);
                }
              }
            }
          }
        }
      };
      console.log('交接标本id',connectSampleId);
      this.postSampleConnectMessage({
        proId: this.proId,  //项目ID
        departmentId: this.storeArriveDeparnmentId,  //送达科室ID
        singImg: '',   //送达签名图片信息this.currentElectronicSignature
        ids: connectSampleId   //送达选择的标本ID
      })
    },

    // 交接信息取消事件
    connectMessageCancel () {
      this.$dialog.alert({
        message: '返回上页后,将丢失本页数据!',
        closeOnPopstate: false,
        showCancelButton: true   
        }).then(() => {
          this.changeCurrentElectronicSignature({DtMsg: null});
          this.changeCirculationConnectMessageList({DtMsg:[]});
          this.changeIsrefreshCirculationConnectPage(false);
          this.$router.push({path:'/circulationTaskMessageConnect'});
          this.changeTitleTxt({tit:'信息交接'});
          setStore('currentTitle','信息交接')}
        )
      .catch(() => {})
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
    font-size: 14px;
      .left-dropDown {
      .rightDropDown
    }
    .sweep-code-title {
      height: 30px;
      padding-left: 10px;
      position: relative;
      h3 {
        width: auto;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #1699e8;
        position: absolute;
        top: 0;
        left: 8px      
        };
      .control-signature {
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        color: #1699e8;
        display: inline-block;
        position: absolute;
        top: 0;
        right: 8px
      }
    };
    .sweep-code-area {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .sample-type-list {
        max-height: 80%;
        overflow: auto;
        position: relative;
        .sample-type-title-wrapper {
          position: relative;
          height: 40px;
          background: #e4e4e4;
          line-height: 40px;
          color: #2895ea;
          .sample-type-check {
            position: absolute;
            top: 5px;
            left: 10px
          }
          .sample-type-title {
            position: absolute;
            top: 0;
            left: 10px;
          };
          .sample-type-total {
            position: absolute;
            top: 0;
            right: 10px;
          };
          .sample-type-stepper {
            position: absolute;
            top: 0;
            left: 150px;
          }
        }
        .sample-type-message-wrapper{
          box-sizing: border-box;
          padding: 10px;
          .sample-type-message-list {
            width: 100%;
            border-bottom: 1px solid #d5d5d5;
            padding: 4px 0;
            box-sizing: border-box;
            .sample-type-message-list-inner-erapper {
              p {
                height: 46px;
                vertical-align: top;
                overflow: auto;
                display: inline-block;
                line-height: 20px;
                width: 47%;
                .message-tit {
                  color: #7f7d7d
                };
                .message-tit-real {
                  color: black
                }
              }
            }
          }
        }
      }
    };
    .electronic-signature {
      height: 250px
    }
    .btn-area {
      height: 80px;
      text-align: center;
      line-height: 80px;
      span {
        .bottomButton;
        display: inline-block;
        margin-top: 15px;
        img {
          width: 100%;
          height: 100%
        }
      }
    }
  }
</style>