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
    <div class="loading">
      <loading :isShow="showLoadingHint" :textContent="currentTextContent" textColor="#2895ea"></loading>
    </div>
    <div class="sweep-code-area">
      <div class="point-area" v-show="appointAreaShow">
        <p class="task-start-point">
          <span>任务起点:</span>
          <span>{{dispatchTaskMessage.setOutPlaceName}}</span>
        </p>
        <p class="task-end-point" style="line-height:30px">
          <span>已扫任务目的地:</span>
          <span style="margin-right:8px" v-for="(item,index) in dispatchTaskMessage.distName" :key="index">{{`${item}`}}</span>
        </p>
        <p class="task-end-point">
          <span>任务终点:</span>
          <span>{{dispatchTaskMessage.destinationName}}</span>
        </p>
      </div>
      <div class="photo-area-box" v-show="photoAreaBoxShow">
        <div class="photo-preview">
          <img width="100" height="130" id="preview1" :src="upImgUrl"/>
        </div>
        <div class="choose-photo-box">
          <div class="choose-photo">
            <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>上传照片
          </div>
          <div class="photo-graph">
            <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera"/>拍照
          </div>
        </div>
      </div>
      <div class="electronic-signature" v-if="showSignature">
        <ElectronicSignature></ElectronicSignature>
      </div>
    </div>
    <div class="btn-area">
      <span v-show="photoAreaBoxShow == true || showSignature == true">
        <img :src="taskSurePng" alt=""  @click="submitPhoto">
      </span>
      <span v-show="photoAreaBoxShow == false && showSignature == false">
        <img :src="taskSweepCodePng" alt=""  @click="sweepCodeSure">
      </span>
      <span>
        <img :src="taskCancelPng" alt="" @click="cancelSweepCode">
      </span>
    </div>
  </div>
</template>

<script>
import HeaderTop from '@/components/HeaderTop'
import AfterSaleImage from '@/components/AfterSaleImage'
import ElectronicSignature from '@/components/ElectronicSignature'
import {judgeDispatchTaskDepartment,updateDispatchTask,dispatchTaskUploadMsg} from '@/api/workerPort.js'
import NoData from '@/components/NoData'
import Loading from '@/components/Loading'
import { mapGetters, mapMutations } from 'vuex'
import { formatTime, setStore, getStore, removeStore, IsPC, deepClone, repeArray, compressImg, Dictionary} from '@/common/js/utils'
import {getDictionaryData} from '@/api/login.js'
export default {
  name: 'dispatchTaskSweepCode',
  data () {
    return {
      temporaryUpImgUrl: '',
      currentTextContent: '',
      sweepCodeDestinationList: [],
      sweepCodeDestinationListOne: [],
      leftDropdownDataList: ['退出登录'],
      leftDownShow: false,
      showLoadingHint: false,
      photoAreaBoxShow: false,
      showSignature: false,
      appointAreaShow: true,
      srcUrl: '',
      headerImg: '',
      liIndex: null,
      departmentId: '',
      departmentNo: '',
      currentSiteId: '',
      compressImgUrl: '',
      currentDepartmentNum: '',
      upImgUrl: require('@/common/images/home/no-data-default.png'),
      taskSurePng: require('@/components/images/task-sure.png'),
      taskCancelPng: require('@/components/images/task-cancel.png'),
      taskSweepCodePng: require('@/components/images/task-sweep-code.png')
    };
  },

  components:{
    HeaderTop,
    NoData,
    Loading,
    AfterSaleImage,
    ElectronicSignature
  },

  mounted () {
    // 控制设备物理返回按键测试
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        this.$router.push({'path':'/dispatchDetails'});
        this.changeTitleTxt({tit:'任务详情'});
        setStore('currentTitle','任务详情');
      })
    };
    // 二维码回调方法绑定到window下面,提供给外部调用
    let me = this;
    window['scanQRcodeCallback'] = (code) => {
      me.scanQRcodeCallback(code);
    };
    window['scanQRcodeCallbackCanceled'] = () => {
      me.scanQRcodeCallbackCanceled();
    };
    if (this.dispatchTaskDepartmentType == 0) {
      this.currentSiteId = this.dispatchTaskMessage.setOutPlaceId
    } else if (this.dispatchTaskDepartmentType == 1) {
      this.currentSiteId = this.dispatchTaskMessage.destinationId
    };
    this.echoCurrentDepartmentNumber();
    // 调取摄像头
    this.sweepCodeSure()
  },

  computed:{
    ...mapGetters([
      'navTopTitle',
      'dispatchTaskMessage',
      'dispatchTaskState',
      'dispatchTaskDepartmentType',
      'isCoerceTakePhoto',
      'isCompleteSweepCode',
      'isDispatchTaskFirstSweepCode',
      'isCompletePhotoList',
      'currentElectronicSignature',
      'isBack',
      'isSign',
      'isSingleDestination',
      'isCompleteSweepCodeDestinationList',
      'departmentInfoList',
      'departmentInfoListNo',
      'currentDepartmentNumber'
    ]),
    proId () {
      return JSON.parse(getStore('userInfo')).extendData.proId
    },
    userId () {
      return JSON.parse(getStore('userInfo')).id
    },
    proName () {
      return JSON.parse(getStore('userInfo')).extendData.proName
    },
    taskId () {
      return this.dispatchTaskMessage.id
    }
  },

  methods:{
    ...mapMutations([
      'changeTitleTxt',
      'changeisCompleteSweepCode',
      'changeIsDispatchTaskFirstSweepCode',
      'changeIsCompletePhotoList',
      'changeCurrentElectronicSignature',
      'changeShowEndTaskBtn',
      'changeIsCompleteSweepCodeDestinationList',
      'changeCurrentDepartmentNumber'
    ]),

    // 扫描二维码方法
    sweepAstoffice () {
      window.android.scanQRcode()
    },

    // 根据科室编号获取科室名称(非单一目的地)
    getDepartmentName () {
      let temporarySweepCodeDestinationList = [];
      let temporarySweepCodeOficeList = [];
      let echoIndex = this.isCompleteSweepCodeDestinationList.indexOf(this.isCompleteSweepCodeDestinationList.filter((item) => {return item.taskId == this.taskId})[0]);
      if (echoIndex == -1) {return};
      temporarySweepCodeOficeList = this.isCompleteSweepCodeDestinationList.filter((item) => { return item.taskId == this.taskId})[0]['officeList'];
      for (let item of temporarySweepCodeOficeList) {
        temporarySweepCodeDestinationList.push(Dictionary(this.departmentInfoListNo,item.toString()))
      };
      this.sweepCodeDestinationList = temporarySweepCodeDestinationList;
    },

    // 图片上传预览
    previewFileOne() {
      let img = document.getElementById("preview1");
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
        img.src = reader.result;
        _this.upImgUrl = reader.result;
        _this.temporaryUpImgUrl = reader.result;
        // 存储上传的照片
        _this.storePhoto(reader.result)
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      };
    },

    //拍照预览
    previewFileTwo() {
      let img = document.getElementById("preview1");
      let file = document.getElementById("demo2").files[0];
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
        img.src = reader.result;
        _this.upImgUrl = reader.result;
        _this.temporaryUpImgUrl = reader.result;
        // 存储上传的照片
        _this.storePhoto(reader.result)
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      };
    },

    // 压缩回调
    compressCallback(data) {
      this.compressImgUrl = data;
      this.uploadPhoto(
        {
          taskId: this.taskId,  //任务ID必填
          proId: this.proId,  //项目ID必填
          proName: this.proName,//项目名称必填项
          depId: this.departmentId, //当前科室ID 必输
          depNo: this.currentDepartmentNum, //当前科室编号 必输
          type: this.dispatchTaskDepartmentType,  //'图片类型 0-出发地，1-目的地', 必填项
          taskType: 0,     //'任务类型 0-调度类，1-循环类，2-预约类' 必填项
          photo: this.compressImgUrl, //base64字符串必填
          flag: this.isSign == 0 ? 1 : 0
        }
      );
    },

    // 回显照片
    echoPhoto () {
      if (this.isCompletePhotoList.length == 0) { return };
      let echoIndex = this.isCompletePhotoList.indexOf(this.isCompletePhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
      if (echoIndex == -1) { return };
      this.upImgUrl = this.isCompletePhotoList[echoIndex]['phototList'][this.isCompletePhotoList[echoIndex]['phototList'].length-1];
      this.temporaryUpImgUrl = this.isCompletePhotoList[echoIndex]['phototList'][this.isCompletePhotoList[echoIndex]['phototList'].length-1]
    },

    echoCurrentDepartmentNumber () {
      if (this.currentDepartmentNumber.length == 0) { return };
      let echoIndex = this.currentDepartmentNumber.indexOf(this.currentDepartmentNumber.filter((item) => {return item.taskId == this.taskId})[0]);
      if (echoIndex == -1) { return };
      this.currentDepartmentNum = this.currentDepartmentNumber[echoIndex]['number'];
    },

    // 存储已经上传的照片
    storePhoto (photoId) {
      let temporaryPhotoList = [];
      let temporaryPhotoId = [];
      temporaryPhotoList = deepClone(this.isCompletePhotoList);
      if (this.isCompletePhotoList.length > 0 ) {
        let temporaryIndex = this.isCompletePhotoList.indexOf(this.isCompletePhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
        if (temporaryIndex != -1) {
          temporaryPhotoId = temporaryPhotoList[temporaryIndex]['phototList'];
          temporaryPhotoId.push(photoId);
          temporaryPhotoList[temporaryIndex]['phototList'] = repeArray(temporaryPhotoId)
        } else {
          temporaryPhotoId.push(photoId);
          temporaryPhotoList.push(
            { 
              phototList: repeArray(temporaryPhotoId),
              taskId: this.taskId
            }
          )
        };
      } else {
        temporaryPhotoId.push(photoId);
        temporaryPhotoList.push(
          { 
            phototList: repeArray(temporaryPhotoId),
            taskId: this.taskId
          }
        )
      };
      this.changeIsCompletePhotoList(temporaryPhotoList);
      setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
    },

    // 存储当前扫码校验通过的科室编号
    storeCurrentDepartmentNumber (departmentNumber) {
      let temporaryDepartmentNumber = [];
      temporaryDepartmentNumber = deepClone(this.currentDepartmentNumber);
      if (temporaryDepartmentNumber.length > 0 ) {
        let temporaryIndex = this.currentDepartmentNumber.indexOf(this.currentDepartmentNumber.filter((item) => {return item.taskId == this.taskId})[0]);
        if (temporaryIndex != -1) {
          temporaryDepartmentNumber[temporaryIndex]['number'] = departmentNumber
        } else {
          temporaryDepartmentNumber.push(
            { 
              number: departmentNumber,
              taskId: this.taskId
            }
          )
        };
      } else {
        temporaryDepartmentNumber.push(
          { 
            number:departmentNumber,
            taskId: this.taskId
          }
        )
      };
      this.changeCurrentDepartmentNumber(temporaryDepartmentNumber);
      setStore('completDepartmentNumber', {"number": temporaryDepartmentNumber});
    },
    
    // 上传图片
    uploadPhoto (data) {
      dispatchTaskUploadMsg(data).then((res) => {
        this.showLoadingHint = false;
        if (res && res.data.code == 200) {
          // 上传成功后,清除存储的照片
          if(this.photoAreaBoxShow) {
            let temporaryInfo = deepClone(this.isCompletePhotoList.filter((item) => {return item['taskId'] != this.taskId}));
            this.changeIsCompletePhotoList(temporaryInfo);
            setStore('completPhotoInfo', {"photoInfo": temporaryInfo});
            // 判断是否需要签字
            this.judgeIsSignature();
            this.photoAreaBoxShow = false
          } else {
            // 清除本次签名
            this.changeCurrentElectronicSignature({DtMsg: null});
            // 判断出发地或目的地子流程
            this.judgeSubProcess()
          }
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
        this.showLoadingHint = false;
      })
    },

    // 提交图片
    submitPhoto () {
      this.echoCurrentDepartmentNumber();
      if (this.photoAreaBoxShow) {
        if (this.temporaryUpImgUrl == '') {
          this.$dialog.alert({
            message: '请上传照片',
            closeOnPopstate: true
          }).then(() => {
          });
          return
        };
        this.currentTextContent = '上传中,请稍候···'
        this.showLoadingHint = true;
        // 压缩图片
        compressImg(this.upImgUrl,this.compressCallback)
      } else {
        if (!this.currentElectronicSignature) {
          this.$dialog.alert({
            message: '签名不能为空，请确认签名!',
            closeOnPopstate: false
          }).then(() => {
          });
          return
        };
        this.currentTextContent = '上传中,请稍候···'
        this.showLoadingHint = true;
        this.uploadPhoto(
          {
            taskId: this.taskId,  //任务ID必填
            proId: this.proId,  //项目ID必填
            proName: this.proName,//项目名称必填项
            type: this.dispatchTaskDepartmentType,  //'图片类型 0-出发地，1-目的地', 必填项
            taskType: 0,     //'任务类型 0-调度类，1-循环类，2-预约类' 必填项
            photo: this.currentElectronicSignature, //base64字符串必填
            depId: this.departmentId, //当前科室ID 必输
            depNo: this.currentDepartmentNum, //当前科室编号 必输
            flag: 1
          }
        );
      }
    },

    // 摄像头取消扫码后的回调
    scanQRcodeCallbackCanceled () {
      this.backTo()
    },

    // 摄像头扫码后的回调
    scanQRcodeCallback(code) {
      if (code) {
        let codeData = code.split('|');
        if (codeData.length > 0) {
          this.departmentId = codeData[0];
          this.departmentNo = codeData[1];
          this.juddgeCurrentDepartment({
            id: this.dispatchTaskMessage.id,  //任务ID
            proId: this.proId,  //项目ID
            departmentNo: this.departmentNo, //项目编号
            departmentId: this.departmentId,  //科室ID
            checkType: this.dispatchTaskDepartmentType,   //校验类型  出发地-0,目的地-1
            workerId: this.userId // 用户id
          });
          // 存储扫过的非单一目的地
          if (!this.isSingleDestination && this.dispatchTaskDepartmentType == 1) {
            let temporaryOfficeList = [];
            let temporaryDepartmentId = [];
            temporaryOfficeList = deepClone(this.isCompleteSweepCodeDestinationList);
            if (this.isCompleteSweepCodeDestinationList.length > 0 ) {
              let temporaryIndex = this.isCompleteSweepCodeDestinationList.indexOf(this.isCompleteSweepCodeDestinationList.filter((item) => {return item.taskId == this.taskId})[0]);
              if (temporaryIndex != -1) {
                temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
                temporaryDepartmentId.push(this.departmentNo);
                temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
              } else {
                temporaryDepartmentId.push(this.departmentNo);
                temporaryOfficeList.push(
                  { 
                    officeList: repeArray(temporaryDepartmentId),
                    taskId: this.taskId
                  }
                )
              };
            } else {
              temporaryDepartmentId.push(this.departmentNo);
              temporaryOfficeList.push(
                { 
                  officeList: repeArray(temporaryDepartmentId),
                  taskId: this.taskId
                }
              )
            };
            this.changeIsCompleteSweepCodeDestinationList(temporaryOfficeList);
            setStore('completeDispatchSweepCodeDestinationInfo', {"sweepCodeInfo": temporaryOfficeList})
          }
        }
      } else {
        this.$dialog.alert({
          message: '当前没有扫描到任何信息,请重新扫描'
        }).then(() => {
          this.sweepAstoffice()
        });
      }
    },

    // 重新扫码弹窗
    againSweepCode () {
      this.sweepAstoffice()
    },

    // 右边下拉框菜单点击
      leftLiCLick (index) {
        this.liIndex = index;
        localStorage.clear();
        this.$router.push({path:'/'})
      },

      // 判断是否需要要回到出发地 0不回 1回
      judgeIsGoDeparture () {
        if (this.isBack == 1) {
          // 需要回到出发地时更新任务状态为4未结束
          this.updateTaskState({
            proId: this.proId, //当前项目ID
            id: this.dispatchTaskMessage.id, //当前任务ID
            state: 4//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
          })
        } else {
          this.updateTaskState({
            proId: this.proId, //当前项目ID
            id: this.dispatchTaskMessage.id, //当前任务ID
            state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
          })
        }
      },

      // 跳转到我的页
      skipMyInfo () {
        this.leftDownShow = !this.leftDownShow;
      },

    // 判断扫码科室
    juddgeCurrentDepartment (data) {
      this.currentTextContent = '校验中,请稍候···'
      this.showLoadingHint = true;
      judgeDispatchTaskDepartment(data).then((res) => {
        if (res && res.data.code == 200) {
          // 存储当前扫码校验通过的科室编号
          this.storeCurrentDepartmentNumber(data.departmentNo);
          this.changeIsDispatchTaskFirstSweepCode(false);
          setStore("isDispatchFirstSweepCode",false);
          // 只存储出发地和单一目的地科室;
          if (this.dispatchTaskDepartmentType == 0 || (this.isSingleDestination && this.dispatchTaskDepartmentType == 1)) {
            // 存储已经扫码验证通过的科室id
            let temporaryOfficeList = [];
            let temporaryDepartmentId = [];
            temporaryOfficeList = deepClone(this.isCompleteSweepCode);
            // 存储已经扫码验证通过的科室id
            if (this.isCompleteSweepCode.length > 0 ) {
              let temporaryIndex = this.isCompleteSweepCode.indexOf(this.isCompleteSweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
              if (temporaryIndex != -1) {
                temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
                temporaryDepartmentId.push(this.currentSiteId);
                temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
              } else {
                temporaryDepartmentId.push(this.currentSiteId);
                temporaryOfficeList.push(
                  { 
                    officeList: repeArray(temporaryDepartmentId),
                    taskId: this.taskId
                  }
                )
              };
            } else {
              temporaryDepartmentId.push(this.currentSiteId);
              temporaryOfficeList.push(
                { 
                  officeList: repeArray(temporaryDepartmentId),
                  taskId: this.taskId
                }
              )
            };
            this.changeisCompleteSweepCode(temporaryOfficeList);
            setStore('completeDispatchSweepCodeInfo', {"sweepCodeInfo": temporaryOfficeList})
          };
          // 判断是否需要拍照0不拍照1拍照
          if (this.isCoerceTakePhoto == 0) {
            // 判断是否需要签字
            this.judgeIsSignature()
          } else {
            this.photoAreaBoxShow = true;
            this.appointAreaShow = false;
            this.showSignature = false
          }
        } else {
          this.backTo();
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: true,
          }).then(() => {
          }).catch((err) =>{
          })
        };
        this.showLoadingHint = false
      })
      .catch((err) => {
        this.backTo();
        this.showLoadingHint = false;
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
      })
    },

    // 判断出发地和目的地子流程方法
    judgeSubProcess () {
      // 判断是否是出发地0出发地1目的地
      if (this.dispatchTaskDepartmentType == 0) {
        this.updateTaskState({
          proId: this.proId, //当前项目ID
          id: this.dispatchTaskMessage.id, //当前任务ID
          state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
        })
      } else if (this.dispatchTaskDepartmentType == 1) {
        // 判断是否为单一目的地
        if (this.isSingleDestination) {
          // 判断是否回到出发地
          if (this.isBack == 1) {
            //重新执行扫码出发地时更新任务状态为未结束
            this.updateTaskState({
              proId: this.proId, //当前项目ID
              id: this.dispatchTaskMessage.id, //当前任务ID
              state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
            })
          } else {
            // 判断是否为单一目的地
            if (this.isSingleDestination) {
              // 结束派送
              this.updateTaskState({
                proId: this.proId, //当前项目ID
                id: this.dispatchTaskMessage.id, //当前任务ID
                state: this.dispatchTaskState//更新后的状态 {0: '未分配', 1: '未查阅', 2: '未开始', 3: '进行中', 4: '未结束', 5: '已延迟', 6: '已取消', 7: '已完成'
              })
            }
          }
        } else {
          this.$router.push({'path':'/dispatchDetails'});
          this.changeTitleTxt({tit:'任务详情'});
          setStore('currentTitle','任务详情');
        }
      }
    },

    // 判断是否需要签字0不签1签字
    judgeIsSignature () {
      if (this.isSign == 0) {
        this.judgeSubProcess()
      } else if (this.isSign == 1) {
        this.showSignature = true;
        this.photoAreaBoxShow = false;
        this.appointAreaShow = false
      }
    },

    // 更新任务状态
    updateTaskState (data) {
      updateDispatchTask(data).then((res) => {
        if (res && res.data.code == 200) {
          this.temporaryUpImgUrl = '';
          // 为单一类型目的地或第二次扫出发地时结束该任务
          if ((this.dispatchTaskDepartmentType == 1 && this.isSingleDestination && this.dispatchTaskState != 4) || (this.dispatchTaskState == 7)) {
            this.$toast('该条任务已完成');
            // 清空该完成任务存储的已扫过非单一目的地科室信息
            let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCodeDestinationList);
            temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
            this.changeIsCompleteSweepCodeDestinationList(temporarySweepCodeOficeList);
            setStore('completeDispatchSweepCodeDestinationInfo', {"sweepCodeInfo": temporarySweepCodeOficeList});

            // 清空该完成任务存储的已校验通过的当前科室编号
            let temporaryCurrentDepartmentNumber = deepClone(this.currentDepartmentNumber);
            temporaryCurrentDepartmentNumber = temporaryCurrentDepartmentNumber.filter((item) => { return item.taskId != this.taskId});
            this.changeCurrentDepartmentNumber(temporaryCurrentDepartmentNumber);
            setStore('completDepartmentNumber', {"number": temporaryCurrentDepartmentNumber});

            this.$router.push({path:'/dispatchTask'});
            this.changeTitleTxt({tit:'调度任务'});
            setStore('currentTitle','调度任务')
          } else {
            this.$router.push({'path':'/dispatchDetails'});
            this.changeTitleTxt({tit:'任务详情'});
            setStore('currentTitle','任务详情')
          }
          // 清空该完成任务存储的已扫过出发地和单一目的地科室信息
          let temporarySweepCodeOficeList = deepClone(this.isCompleteSweepCode);
          temporarySweepCodeOficeList = temporarySweepCodeOficeList.filter((item) => { return item.taskId != this.taskId});
          this.changeisCompleteSweepCode(temporarySweepCodeOficeList);
          setStore('completeDispatchSweepCodeInfo', {"sweepCodeInfo": temporarySweepCodeOficeList})
        } else {
          this.$dialog.alert({
            message: res.data.msg,
            closeOnPopstate: true
          }).then(() => {
          });
        }
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
      })
    },

    // 返回上一页
    backTo () {
      this.$router.push({'path':'/dispatchDetails'});
      this.changeTitleTxt({tit:'任务详情'});
      setStore('currentTitle','任务详情');
    },

     // 扫码确认事件
    sweepCodeSure () {
      if (this.isDispatchTaskFirstSweepCode) {
        this.sweepAstoffice()
      } else {
        let isExistTaskId = '',
        isExistOfficeId = '';
        isExistTaskId = this.isCompleteSweepCode.indexOf(this.isCompleteSweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
        if (isExistTaskId != -1) {
          isExistOfficeId = this.isCompleteSweepCode[isExistTaskId]['officeList'].indexOf(this.currentSiteId);
        };
        if (isExistTaskId !== -1 && isExistOfficeId !== -1 && isExistOfficeId !== '') {
          if (this.isCoerceTakePhoto == 1) {
            this.$dialog.alert({
              message: '该科室校验已验证通过,请拍照或上传照片',
              closeOnPopstate: true
            })
            .then(() => {
            });
            // 回显拍照照片
            this.echoPhoto();
            this.photoAreaBoxShow = true;
            this.appointAreaShow = false
          } else if (this.isSign == 1) {
            this.$dialog.alert({
              message: '该科室校验已验证通过,请签字',
              closeOnPopstate: true
            }).then(() => {
            });
            this.photoAreaBoxShow = false;
            this.appointAreaShow = false;
            this.showSignature = true
          } else {
            this.sweepAstoffice()
          }
        } else {
          this.sweepAstoffice()
        }
      }
    },

    // 取消扫码事件
    cancelSweepCode () {
      this.$router.push({'path':'/dispatchDetails'});
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
    position: relative;
    font-size: 14px;
    .left-dropDown {
      .rightDropDown
    }
    .loading {
      position: absolute;
      bottom: 80px;
      left: 0;
      width: 100%;
      height: 50px;
      text-align: center;
    };
    .sweep-code-title {
      margin-top: 10px;
      width: 100%;
      height: 50px;
      line-height: 30px;
      text-align: right;
      span {
        width: 80px;
        height: 45px;
        display: inline-block;
        line-height: 45px;
        background: #2895ea;
        font-size: 14px;
        border-radius: 4px;
        text-align: center;
        color: #fff;
        margin-right: 10px;
      }
    };
    .sweep-code-area {
      flex:1;
      overflow: auto;
      margin: 0 auto;
      width: 100%;
      .point-area {
        height: 75%;
        width: 80%;
        background: #fff;
        margin-left: 4%;
        margin-top: 10px;
        padding: 20px 10px 20px 20px;
        box-shadow: 0 2.5px 12px 4px #d1d1d1;
        border-radius: 8px;
        color: #313131;
        font-weight: bold;
        letter-spacing: 2px;
        p {
          margin-bottom: 40px;
          padding-left: 10px;
          font-size: 20px;
          span {
            &:first-child {
              color: #585858;
            }
          }
        }
      }
      .photo-area-box {
        .photo-preview {
          width: 70%;
          height: 250px;
          margin: 0 auto;
          margin-top: 50px;
          box-shadow: 0px 0px 8px 6px rgba(231, 231, 231, 0.8);
          img {
            width: 100%;
            height: 100%
          }
        }
        .choose-photo-box {
          margin-top: 30px;
          text-align: center;
          > div {
            display: inline-block;
            width: 100px
          }
          .choose-photo {
            padding: 8px 10px;
            height: 20px;
            line-height: 20px;
            position: relative;
            cursor: pointer;
            color: #888;
            background: #fafafa;
            border: 1px solid #ddd;
            border-radius: 4px;
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
            background: #D0EEFF;
            border: 1px solid #99D3F5;
            border-radius: 4px;
            padding: 8px 12px;
            overflow: hidden;
            color: #1E88C7;
            text-decoration: none;
            text-indent: 0;
            line-height: 20px;
            input {
              position: absolute;
              font-size: 100px;
              right: 0;
              top: 0;
              opacity: 0;
            }
          }
        }
      };
      .electronic-signature {
      height: 250px;
      margin-top: 150px;
      box-sizing: border-box
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