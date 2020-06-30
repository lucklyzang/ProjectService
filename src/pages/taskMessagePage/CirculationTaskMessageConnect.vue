<template>
   <div class="content-wrapper">
    <div class="no-data" v-show="noDataShow">
      <NoData></NoData>
    </div>
    <div class="loading">
      <loading :isShow="showLoadingHint" textContent="加载中,请稍候····" textColor="#2895ea"></loading>
    </div>
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
      <h3>采集信息交接</h3>
    </div>
    <div class="sweep-code-area" v-show="connectMessageArea">
      <div class="sample-type-list" v-for="(item,index) in manageSampleDataList" :key="`${item}-${index}`">
        <div class="sample-type-title-wrapper">
          <!-- <div class="sample-type-stepper">
            <van-stepper @change="stepperEvent" v-model="item.sampleNumber" min="1"  :max="`${item.sampleTotal}`"/>
          </div> -->
          <div class="sample-type-check">
            <van-checkbox v-model="item.check" @click="checkBoxEvent"></van-checkbox>
          </div>
          <div class="sample-type-title">{{item.sampleTypeName}}</div>
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
    <div class="btn-area">
      <span>
        <img :src="taskSurePng" alt=""  @click="ConnectSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="ConnectCancel">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
import FooterBottom from '@/components/FooterBottom'
import {queryCollectSampleMessage, updateCirculationTask} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import Loading from '@/components/Loading'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, repeArray, deepClone, removeBlock, arrayDiff} from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'circulationTaskMessageConnect',
  data () {
    return {
      showLoadingHint: false,
      noDataShow: false,
      noConnectSampleShow: false,
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      connectMessageArea: false,
      liIndex: null,
      originCollectSampleMessageList: [],
      allSampleTypeList: [],
      manageSampleDataList: [],
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png'),
    };
  },

  components:{
    VanFieldSelectPicker,
    HeaderTop,
    NoData,
    Loading,
    FooterBottom
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      pushHistory();
      this.gotoURL(() => {
        pushHistory();
        if (this.noConnectSampleShow) {
          this.noConnectSampleInfo();
          return
        };
        this.$router.push({'path':'/circulationDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情');
      })
    };
    this.getCollectSampleMessage(this.proId,this.circulationTaskId)
  },

  activated () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      pushHistory();
      this.gotoURL(() => {
        pushHistory();
        if (this.noConnectSampleShow) {
          this.noConnectSampleInfo();
          return
        };
        this.$router.push({'path':'/circulationDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情');
      })
    };
    if (this.isrefreshCirculationConnectPage) {
      this.getCollectSampleMessage(this.proId,this.circulationTaskId)
    }
  },

  computed:{
    ...mapGetters([
      'navTopTitle',
      'isrefreshCirculationConnectPage',
      'circulationTaskId',
      'storeNoConnectSample',
      'storeAlreadyConnectSample',
      'completeDeparnmentInfo',
      'circulationDetails'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeCirculationConnectMessageList',
      'changeIsStoreNoConnectSample',
      'changeCompleteDeparnmentInfo',
      'changeIsFreshCirculationTaskPage'
    ]),

    // 计数器变化回调
    stepperEvent (value) {
      let emptyArr = [];
      },

    // 右边下拉框菜单点击
    leftLiCLick (index) {
      this.liIndex = index;
      localStorage.clear();
      this.$router.push({path:'/'})
    },

    // 跳转到我的页
    skipMyInfo () {
      this.leftDownShow = !this.leftDownShow;
    },

    // 没有交接标本提示提示
    noConnectSampleInfo () {
      this.noConnectSampleShow = true;
      if (this.circulationDetails['spaces'].every((item) => item.check) == true ) {
        this.$dialog.alert({
          message: '该条循环任务没有需要交接的标本,确定后将更新该循环任务状态为已完成',
          closeOnPopstate: false
        }).then(() => {
          this.dealNoSampleMessage()
        })
      } else {
        this.$toast('当前没有需要交接的标本');
        this.$router.push({'path':'/circulationDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情')
      }
    },

    // 返回上一页
    backTo () {
      this.$router.push({'path':'/circulationDetails'});
      this.changeTitleTxt({tit:'任务详情'});
      setStore('currentTitle','任务详情');
    },

    // 没有需要交接的标本操作
    dealNoSampleMessage () {
      updateCirculationTask({
        proId: this.proId,
        id: this.circulationTaskId,
        state: 7
      }).then((res) => {
        if (res && res.data.code == 200) {
          this.$toast('该条任务已完成');
          this.noConnectSampleShow = false;
          this.noDataShow = false;
          // 清空store已完成科室信息
          let temporaryCompleteInfo = deepClone(this.completeDeparnmentInfo);
          temporaryCompleteInfo = temporaryCompleteInfo.filter((item) => { return item.taskId != this.circulationTaskId});
          this.changeCompleteDeparnmentInfo({DtMsg: temporaryCompleteInfo});
          // 清空Localstorage的已完成科室信息
          setStore('completeDepartmentMessage', {"sureInfo": temporaryCompleteInfo});
          this.$router.push({path:'/circulationTask'});
          this.changeTitleTxt({tit:'循环任务'});
          setStore('currentTitle','循环任务');
          this.changeIsFreshCirculationTaskPage(true)
        } else {
          this.$dialog.alert({
            message: `${res.data.data}`,
            closeOnPopstate: false
          }).then(() => {
          });
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
        });
      })
    },

    // 查询收集的标本信息
    getCollectSampleMessage (proId, taskId) {
      this.showLoadingHint = true;
      queryCollectSampleMessage(proId, taskId).then((res) => {
         if (res && res.data.code == 200) {
          if (res.data.data.length == 0) {
            this.connectMessageArea = false;
            this.noDataShow = true;
            this.noConnectSampleInfo();
            return
          };
          this.connectMessageArea = true;
          this.noDataShow = false;
          this.originCollectSampleMessageList = res.data.data;
          this.allSampleTypeList = [];
          for (let item of this.originCollectSampleMessageList) {
            for (let currentItem in item) {
              if (currentItem === 'specimenName') {
                this.allSampleTypeList.push(item[currentItem])
              }
            }
          };
          this.manageSampleDataList = [];
          let filterSampleMessage = [];
          let sameSampleTypeNumber = '';
          let sameSampleNumberList = [];
          for (let i = 0, len = repeArray(this.allSampleTypeList).length; i < len; i++) {
            sameSampleTypeNumber = '';
            sameSampleNumberList = [];
            // 过滤标本为同一类型的数据
            filterSampleMessage =  this.originCollectSampleMessageList.filter((itemInfo) => {return itemInfo['specimenName'] == repeArray(this.allSampleTypeList)[i]});
            // 提取同一类型标本里的数量字段
            for (let numberFiel of filterSampleMessage) {
              for (let currentNumberFiel in numberFiel) {
                if (currentNumberFiel === 'quantity') {
                  sameSampleNumberList.push(numberFiel[currentNumberFiel])
                }
              }
            };
            let temporaryManageSampleDataList = [],
            // 对同一标本类型的数量进行求和
            sameSampleTypeNumber = sameSampleNumberList.reduce((last, before, index, array) => last + before);
            // 生成符合页面展示要求的数据结构
            this.manageSampleDataList.push(
              {
                sampleTypeName: repeArray(this.allSampleTypeList)[i],
                check: false,
                sampleTotal: sameSampleTypeNumber,
                sampleList: deepClone(filterSampleMessage),
                sampleNumber: 0
              }
            );
            let manageCheckArray = [];
            let manageCheckArrayCheck = [];
            // 格式换标本项里的检查项字段
            // for (let j = 0, innerLen = this.manageSampleDataList[i].sampleList.length; j < innerLen; j++) {
            //   manageCheckArray = [];
            //   manageCheckArrayCheck = [];
            //   let removeBraceArray = this.manageSampleDataList[i].sampleList[j]['collectionItem'].split(",");
            //   for (let currentCheckEntry of removeBraceArray) {
            //     let transferArray = removeBlock(currentCheckEntry.replace(/\"/g, "")).split(":");
            //     manageCheckArray.push({
            //       itemName: transferArray[1],
            //       id: transferArray[0]
            //     });
            //     manageCheckArrayCheck.push(JSON.stringify({
            //       itemName: transferArray[1],
            //       id: transferArray[0]
            //     }))
            //   };
            //   this.manageSampleDataList[i]['sampleList'][j]['collectionItem'] = manageCheckArray;
            //   this.manageSampleDataList[i]['sampleList'][j]['checkEntryList'] = manageCheckArrayCheck
            // }
          };
          // 去除已经交接过的标本
          this.manageSampleDataList = arrayDiff(this.manageSampleDataList, this.storeAlreadyConnectSample);
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: false
          }).then(() => {
            this.connectMessageArea = false;
            this.noDataShow = true;
          });
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: false
        }).then(() => {
          this.connectMessageArea = false;
          this.noDataShow = true;
        });
      });
      this.showLoadingHint = false;
    },

    // 复选框点击事件
    checkBoxEvent () {
      console.log(this.manageSampleDataList)
    },

    // 交接信息确认事件
    ConnectSure () {
      let circulationMessageListSure = this.manageSampleDataList.filter((item) => { return item.check == true});
      // 存储没有交接的标本
      this.changeIsStoreNoConnectSample(this.manageSampleDataList.filter((item) => { return item.check == false}));
      if (circulationMessageListSure.length == 0) {
        this.$dialog.alert({
          message: '请选择要交接的标本',
          closeOnPopstate: true
        }).then(() => {
        });
        return
      };
      this.changeCirculationConnectMessageList({DtMsg: circulationMessageListSure});
      setStore('currentCirculationConnectMessage',{innerMessage: circulationMessageListSure});
      this.$router.push({path:'/circulationTaskConnectMessageSure'})
      this.changeTitleTxt({tit:'交接信息确认'});
      setStore('currentTitle','交接信息确认')
    },

    // 交接信息取消事件
    ConnectCancel () {
      this.$router.push({'path':'/circulationDetails'});
      this.changeTitleTxt({tit:'任务详情'});
      setStore('currentTitle','任务详情');
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
    position: relative;
    .left-dropDown {
      .rightDropDown
    }
    .no-data {
      position: absolute;
      top: 200px;
      left: 0;
      width: 100%;
      text-align: center;
    }
    .loading {
      position: absolute;
      top: 260px;
      left: 0;
      width: 100%;
      height: 50px;
      text-align: center;
    }
    .sweep-code-title {
      height: 30px;
      line-height: 30px;
      padding-left: 10px;
      h3 {
        font-size: 14px;
        color: #1699e8
      }
    };
    .sweep-code-area {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .sample-type-list {
        max-height: 80%;
        position: relative;
        overflow: auto;
        .sample-type-title-wrapper {
          position: relative;
          height: 40px;
          background: #f7f7f7;
          line-height: 40px;
          color: #2895ea;
          .sample-type-check {
            position: absolute;
            top: 12px;
            left: 10px
          }
          .sample-type-title {
            position: absolute;
            top: 0;
            left: 40px;
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