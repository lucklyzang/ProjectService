<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon> 
      </HeaderTop>
      <!-- 内容部分 -->
      <div class="content-top">
        <div class="circulation-area-title">
          当前巡检科室: {{currentDepartmentName}}
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index + 1}}</span>
            <span>
              {{item.itemName}}
            </span>
            <span>
              <van-icon name="checked" :class="{styleRight: item.right || item.rightClicked}" @click="rightClick(item,index,'right')" />
              <van-icon name="clear" :class="{styleError: item.error || item.errorClicked}" @click="rightClick(item,index,'error')" />
            </span>
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="fillConsumable" v-show="showFillConsumable">填写耗材</p>
        <p class="quit-account" @click="sure">确认</p>
      </div>
    </div>
    <van-dialog v-model="issueShow" title="是否反馈该问题到调度中心" show-cancel-button  :close-on-click-overlay="true"
      confirm-button-text="不上报" cancel-button-text="上报问题"
      @confirm="noReportProblem"
      @cancel="reportProblem"
      >
    </van-dialog>
     <van-dialog v-model="isBackShow"  title="返回上级将不会保存本科室检查结果,确定返回?" show-cancel-button
        @confirm="isBackSure" @cancel="isBackCancel"
      >
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
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, Dictionary, deepClone, repeArray } from '@/common/js/utils'
  import {queryExamineItems,postCheckResult} from '@/api/worker.js'
  export default {
    name: 'DepartmentServiceBill',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        issueShow: false,
        isBackShow: false,
        showFillConsumable: false,
        currentDepartmentId: '',
        currentDepartmentName: '',
        consumableMsgList: []
      }
    },
    
    mounted () {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          pushHistory();
          this.issueShow = false;
          this.isBackShow = true;
          if (this.isBackShow)  {
            this.isBackShow = true;
            return
          };
          this.$router.push({path: 'departmentWorkOrderDeatils'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工程详情')
        })
      };
      this.echoCurrentDepartmentId();
      // 查询检查项
      this.getExamineItems({
        proId: this.proId,
		    depId: this.currentDepartmentId
      })
    },

    activated () {
      this.issueShow = false;
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          pushHistory();
          this.issueShow = false;
          this.isBackShow = true;
          if (this.isBackShow)  {
            this.isBackShow = true;
            return
          };
          this.$router.push({path: 'departmentWorkOrderDeatils'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工程详情')
        })
      };
      this.echoCurrentDepartmentId();
      this.getExamineItems({
        proId: this.proId,
		    depId: this.currentDepartmentId
      })
    },
    
    watch: {
    },
    
    computed:{
      ...mapGetters([
        'navTopTitle',
        'catch_components',
        'departmentServiceMsg',
        'userInfo',
        'isCurrentDepartmentServiceVerifySweepCode',
        'departmentServiceOfficeId',
        'completeDepartmentServiceOfficeInfo',
        'completeDepartmentServiceCheckedItemList',
        'currentDepartmentServiceCheckedItemId'
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
        'changeCatchComponent',
        'changeCompleteDepartmentServiceOfficeInfo',
        'changeCurrentDepartmentServiceCheckedItemId',
        'changeCompleteDepartmentServiceCheckedItemList'
      ]),

      //返回上一页
      backTo () {
        this.issueShow = false;
        this.isBackShow = true;
        if (this.isBackShow)  {
          this.isBackShow = true;
          return
        };
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工程详情')
      },

      // 确定返回
      isBackSure () {
        this.clearCheckedInfo();
        this.$router.push({path: 'departmentWorkOrderDeatils'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工程详情')
      },

      // 取消返回
      isBackCancel () {
        this.isBackShow = false
      },

      // 回显当前检修科室名称
      echoCurrentDepartmentId () {
        try {
          if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
          let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
          if (echoIndex == -1) { return };
          this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
          // 获取科室名称
          this.currentDepartmentName = Dictionary(JSON.parse(getStore('departmentMessage')),this.currentDepartmentId)
        } catch (err) {
          this.$toast(`${err}`)
        }
      },

       // 填写耗材
      fillConsumable () {
        this.$router.push({path: 'departmentServiceFillConsumable'});
        this.changeTitleTxt({tit:'填写耗材'});
        setStore('currentTitle','填写耗材')
      },
      
      // 查询检查项
      getExamineItems (data) {
        queryExamineItems(data).then((res) => {
          if (res && res.data.code == 200) {
            this.consumableMsgList = [];
            if (res.data.data.length > 0) {
              for (let item of res.data.data) {
                this.consumableMsgList.push({
                  depId: item.depId,  //科室ID
                  depName: item.depName,   //科室名称
                  typeName: item.typeName,  //检测类型
                  itemName: item.itemName,  //检测项
                  itemId: item.itemId,    //检测项ID
                  right: false,
                  error: false,
                  rightClicked: false,
                  errorClicked: false,
                  checkResult: 0
                })
              };
              // 为完成问题上报的巡检项增加标记
              if (this.completeDepartmentServiceCheckedItemList.length > 0) {
                let echoIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
                if (echoIndex == -1) { return };
                if (this.completeDepartmentServiceCheckedItemList[echoIndex]['depId'] != this.currentDepartmentId) {
                  this.clearCheckedInfo();
                  return
                };
                if (this.consumableMsgList.length > 0) {
                  for (let n = 0, nLen = this.consumableMsgList.length; n < nLen; n++) {
                    if (this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'].length > 0) {
                      for (let i = 0, len1 = this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'].length; i < len1; i++) {
                        if (this.consumableMsgList[n]['itemId'] == this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['id']) {
                          if (this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['type'] == "error") {
                            this.consumableMsgList[n]['errorClicked'] = true;
                            this.consumableMsgList[n]['rightClicked'] = false;
                            this.consumableMsgList[n]['right'] = false;
                            this.consumableMsgList[n]['error'] = true;
                            this.consumableMsgList[n]['checkResult'] = this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['checkResult']
                          } else {
                            this.consumableMsgList[n]['errorClicked'] = false;
                            this.consumableMsgList[n]['rightClicked'] = true;
                            this.consumableMsgList[n]['right'] = true;
                            this.consumableMsgList[n]['error'] = false;
                            this.consumableMsgList[n]['checkResult'] = 0
                          }
                        }
                      }
                    }
                  }
                }
              };
              console.log('变',this.consumableMsgList)
            } else {
              this.$dialog.alert({
                message: '没有查询到检查项',
                  closeOnPopstate: true
                }).then(() => {
              })
            }
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
                closeOnPopstate: true
              }).then(() => {
            })
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err.message}`,
              closeOnPopstate: true
            }).then(() => {
          })
        })
      },

      // 存储完成问题上报的检查项信息
      storageCompleteCheckItemInfo (number) {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.completeDepartmentServiceCheckedItemList);
        if (this.completeDepartmentServiceCheckedItemList.length > 0 ) {
          let temporaryIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            // 存储问题的解决方式
            let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
            // 删除重复存的id
            temporaryDepartmentId = temporaryDepartmentId.filter((item) => {return item.id !== this.currentDepartmentServiceCheckedItemId.id});
            temporaryCheckItemInfo['checkResult'] = number;
            this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
            temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId);
            temporaryOfficeList[temporaryIndex]['depId'] = this.currentDepartmentId
          } else {
            // 存储问题的解决方式
            let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
            temporaryCheckItemInfo['checkResult'] = number;
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
          temporaryCheckItemInfo['checkResult'] = number;
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

      //对号图标点击
      rightClick(item,index,type) {
        if (item.errorClicked) {
          this.$toast('检查结果已上报,不能更改')
          return
        };
        if (type == 'right') {
          this.changeCurrentDepartmentServiceCheckedItemId({id: item.itemId,type:'right'});
          setStore("checkedItemId",{id: item.itemId,type:'right'});
          this.storageCompleteCheckItemInfo(0);
          this.consumableMsgList[index].right = !this.consumableMsgList[index].right;
          if (this.consumableMsgList[index].error == true) {
            this.consumableMsgList[index].error = false
          }
        } else {
          this.changeCurrentDepartmentServiceCheckedItemId({id: item.itemId,type:'error'});
          setStore("checkedItemId",{id: item.itemId,type:'error'});
          this.consumableMsgList[index].error = !this.consumableMsgList[index].error;
          if (this.consumableMsgList[index].right == true) {
            this.consumableMsgList[index].right = false
          };
          this.issueShow = true
        };
        this.showFillConsumable = false;
        // 重新查询检查项并给相关字段赋值
        this.getExamineItems({
          proId: this.proId,
          depId: this.currentDepartmentId
        });
        console.log(this.consumableMsgList);
      },

      // 上报问题弹框
      reportProblem () {
        this.$router.push({path: 'departmentServiceIssueReport'});
        this.changeTitleTxt({tit:'巡检问题上报'});
        setStore('currentTitle','巡检问题上报')
      },

      // 不上报问题弹框
      noReportProblem () {
        this.storageCompleteCheckItemInfo(1);
        this.showFillConsumable = true;
        // 重新查询检查项并给相关字段赋值
        this.getExamineItems({
          proId: this.proId,
          depId: this.currentDepartmentId
        })
      },

      // 存储完成巡检的科室编号
      storeCompleteDepartmentNumber () {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.completeDepartmentServiceOfficeInfo);
        if (this.completeDepartmentServiceOfficeInfo.length > 0 ) {
          let temporaryIndex = this.completeDepartmentServiceOfficeInfo.indexOf(this.completeDepartmentServiceOfficeInfo.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            temporaryDepartmentId.push(this.departmentServiceOfficeId);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
          } else {
            temporaryDepartmentId.push(this.departmentServiceOfficeId);
            temporaryOfficeList.push(
              { 
                officeList: repeArray(temporaryDepartmentId),
                taskId: this.taskId
              }
            )
          }
        } else {
          temporaryDepartmentId.push(this.departmentServiceOfficeId);
          temporaryOfficeList.push(
            { 
              officeList: repeArray(temporaryDepartmentId),
              taskId: this.taskId
            }
          )
        };
        this.changeCompleteDepartmentServiceOfficeInfo(temporaryOfficeList);
        setStore('isCompleteDepartmentServiceOfficeInfo', {"sweepCodeInfo": temporaryOfficeList})
      },

      // 清除当前房间存储的检查项信息
      clearCheckedInfo () {
        let temporaryInfo = this.completeDepartmentServiceCheckedItemList.filter((item) => { return item.taskId !== this.taskId});
        this.changeCompleteDepartmentServiceCheckedItemList(temporaryInfo);
        setStore('isCompleteDepartmentServiceCheckedItemList', {"sweepCodeInfo": temporaryInfo});
      },

      // 确认
      sure () {
        let flag = this.consumableMsgList.every((item) => {  return item.rightClicked == true || item.errorClicked == true});
        if (!flag) {
          this.$toast('请完成所有的检查项');
          return
        };
        let temporaryCheckItems = [];
        for (let item of this.consumableMsgList) {
          temporaryCheckItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            checkResult: item.checkResult
          })
        };
        let data = {
          taskId: this.taskId,
          depId: this.currentDepartmentId,
          checkItems: temporaryCheckItems
        };
        postCheckResult(data).then((res) => {
          if (res && res.data.code == 200) {
            this.$toast('上报成功');
            this.clearCheckedInfo();
            this.storeCompleteDepartmentNumber();
            this.$router.push({path: 'departmentWorkOrderDeatils'});
            this.changeTitleTxt({tit:'工单详情'});
            setStore('currentTitle','工程详情')
          } else {
            this.$toast(`${res.data.msg}`);
          }
        })
        .catch((err) => {
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
<style lang='less' scoped>
  @import "~@/common/stylus/variable.less";
  @import "~@/common/stylus/mixin.less";
  @import "~@/common/stylus/modifyUi.less";
  .content-wrapper {
    .content-wrapper();
    /deep/ .van-dialog {
      .van-button--default {
        background-color: @color-theme;
        color: #fff;
        border: none
      }
    };
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
        height: auto;
        font-size: 14px;
        background: #f7f7f7;
        flex: 1;
        overflow: auto;
        .circulation-area {
          max-height: 90%;
          margin: 0 auto;
          overflow: auto;
          font-size: 0;
        > p {
          position: relative;
          height: 50px;
          background: #fff;
          margin-bottom: 6px;
          &:last-child {
            margin-bottom:0
          }
          span {
            height: 50px;
            line-height: 50px;
            width: 30%;
            font-size: 16px;
            display: inline-block;
            text-align: center;
            overflow: auto;
            &:first-child {
              width: 10%
            };
            &:nth-child(2) {
              width: 50%;
              text-align: center;
            };
            &:last-child {
              position: absolute;
              top:0;
              right: 0;
              font-size: 28px;
              /deep/ .van-icon {
                margin-top: 11px;
                color: #616060
              };
              .styleRight {
                color: #7fdc90
              };
              .styleError {
                color: red
              }
            }
          }
        }
      };
      .circulation-area-title {
        height: 10%;
        position: relative;
        padding-left: 4px;
        padding-top: 6%;
        box-sizing: border-box;
        font-size: 16px
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
          border: 1px solid @color-theme
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
    }
  }
</style>
