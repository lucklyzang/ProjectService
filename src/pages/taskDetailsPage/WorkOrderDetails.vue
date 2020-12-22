<template>
  <div class="content-wrapper">
    <van-overlay :show="overlayShow"/>
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
        <p class="content-top-other">
          <span>工单编号</span>
          <span>
            {{oneRepairsMsg.taskNumber}}
          </span>
        </p>
        <p class="content-top-other">
          <span>工单标题</span>
          <span>
            {{oneRepairsMsg.taskDesc}}
          </span>
        </p>
        <p class="content-top-other">
          <span>工单类型</span>
          <span>
            {{oneRepairsMsg.typeName}}
          </span>
        </p>
        <p class="content-top-other">
          <span>时间</span>
          <span>
            {{oneRepairsMsg.planStartTime}}
          </span>
        </p>
        <p class="content-top-other">
          <span>参与人员</span>
          <span v-if="oneRepairsMsg.present ? oneRepairsMsg.present.length > 0 : false">
            <b v-for="(item,index) in oneRepairsMsg.present" :key="`${item}-${index}`">
              {{item.name}}
            </b>
          </span>
          <span v-if="oneRepairsMsg.present ? oneRepairsMsg.present.length == 0 : false">
            <b>
              无
            </b>
          </span>
        </p>
        <p class="content-top-other">
          <span>地点</span>
          <span>
            {{oneRepairsMsg.depName}}
          </span>
        </p>
        <p class="content-top-name">
          <span>工单内容</span>
          <span>
            {{oneRepairsMsg.taskRemark ? oneRepairsMsg.taskRemark : '无'}}
          </span>
        </p>
      </div>
      <div class="content-middle" v-if="repairsWorkOrderMsg.state != 4">
        <p class="issue-photo">
          <span>问题拍照</span>
          <ul class="photo-list">
            <li v-for="(item,index) in issueImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state != 5">
              <img width="100" height="130" :src="item" @click="enlargeIssueImgEvent(item)" />
              <van-icon name="cross" @click="issueDelete(index)"/>
            </li>
            <li v-for="(item,index) in historyIssueImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state == 5">
              <img width="100" height="130" :src="Base64.decode(item)" @click="enlargeIssueImgEvent(Base64.decode(item))"/>
            </li>
          </ul>
          <span @click="issueClickEvent" class="icon-wrapper" v-show="repairsWorkOrderMsg.state !== 5">
            <van-icon name="plus"/>
          </span>
        </p>
        <p class="complete-photo">
          <span>完成拍照</span>
          <ul class="photo-list">
            <li v-for="(item,index) in completeImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state != 5">
              <img width="100" height="130" :src="item" @click="enlargeCompleteImgEvent(item)"/>
              <van-icon name="cross" @click="completeDelete(index)"/>
            </li>
            <li v-for="(item,index) in historyCompleteImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state == 5">
              <img width="100" height="130" :src="Base64.decode(item)" @click="enlargeCompleteImgEvent(Base64.decode(item))"/>
            </li>
          </ul>
          <span @click="completeClickEvent" class="icon-wrapper" v-show="repairsWorkOrderMsg.state !== 5">
            <van-icon name="plus"/>
          </span>
        </p>
      </div>
      <div class="content-bottom" ref="contentBottom" v-show="repairsWorkOrderMsg.state !== 5">
        <p class="back-home" @click="fillConsumable" v-show="repairsWorkOrderMsg.state !== 4 && isChangeConsumableShow">修改耗材</p>
        <p class="back-home"  @click="fillConsumable" v-show="repairsWorkOrderMsg.state !== 4 && !isChangeConsumableShow">填写耗材</p>
        <p class="quit-account" @click="completeTask">{{repairsWorkOrderMsg.state == 4 ? "签字" : "完成工单"}}</p>
      </div>
      <transition name="van-slide-up">
        <div class="choose-photo-box" v-show="photoBox">
          <div class="photo-graph">
            <van-icon name="photograph" />
            <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera"/>拍照
          </div>
          <div class="choose-photo">
            <van-icon name="photo" />
            <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>去相册选择
          </div>
          <div class="photo-cancel" @click="photoCancel">取消</div>
        </div>
      </transition>
    </div>
    <van-dialog v-model="enlargeImgShow" width="90%">
      <img :src="enlargeImgUrl">
    </van-dialog>
    <van-dialog v-model="isFinishShow"  title="确定完成?" show-cancel-button
        @confirm="isFinishSure" @cancel="isFinishCancel"
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
  import {queryOneRepairsProject,uploadRepairsTaskPhoto,queryRepairsTaskPhoto,completeRepairsTask} from '@/api/worker.js'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, deepClone, compress } from '@/common/js/utils'
  export default {
    name: 'WorkOrderDetails',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker,
      Loading
    },
    data() {
      return {
        photoBox: false,
        isFinishShow: false,
        isChangeConsumableShow: false,
        showLoadingHint: false,
        overlayShow: false,
        imgType: '',
        photoType: '',
        loadinText: '',
        clickIssue: false,
        clickComplete: false,
        issueImageList: [],
        completeImageList: [],
        historyIssueImageList: [],
        historyCompleteImageList: [],
        photonList: [],
        enlargeImgShow: false,
        oneRepairsMsg: '',
        enlargeImgUrl: ''
      }
    },

    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        if (this.isFinishShow)  {
          this.isFinishShow = true;
          return
        };
        if (this.repairsWorkOrderMsg.state == 5) {
          this.changeIsFreshRepairsWorkOrderPage(false)
        } else {
          this.changeIsFreshRepairsWorkOrderPage(true)
        };
        this.gotoURL(() => {
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        })
      };
      document.addEventListener('click', (e) => {
        if(e.target.className!='van-icon van-icon-plus' && e.target.className != 'back-home' && e.target.className != 'quit-account'){
          this.photoBox = false;
          this.overlayShow = false
        }
      });
      if (this.repairsWorkOrderMsg.state == 5) {
        this.getOneRepairsProjectNoComplete(this.taskId);
        this.parallelFunction()
      } else {
        this.echoPhoto();
        this.getOneRepairsProjectNoComplete(this.taskId)
      };
      this.echoIsMaterial();
      this.changeElementSite();
    },

    watch: {
      issueImageList: {
        handler(newValue,oldValue) {
          if (newValue.length == 0) {
            if (this.completeImageList.length == 0) {
            }
          } else {
          }
        },
        immediate: true,
        deep: true
      },
      completeImageList: {
        handler(newValue,oldValue) {
          if (newValue.length == 0) {
            if (this.issueImageList.length == 0) {
            }
          } else {
          }
        },
        immediate: true,
        deep: true
      }
    },

    computed:{
      ...mapGetters([
        'navTopTitle',
        'repairsWorkOrderMsg',
        'userInfo',
        'isCompleteRepairsWorkOrderPhotoList',
        'isFillMaterialList'
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
        return this.repairsWorkOrderMsg.id
      }
    },

    methods:{
      ...mapMutations([
        'changeTitleTxt',
        'changeIsFreshRepairsWorkOrderPage',
        'changeIsCompletePhotoList',
        'changeisFillMaterialList'
      ]),

      //返回上一页
      backTo () {
        if (this.repairsWorkOrderMsg.state == 5) {
          this.changeIsFreshRepairsWorkOrderPage(false)
        } else {
          this.changeIsFreshRepairsWorkOrderPage(true)
        };
        this.$router.push({path: 'repairsWorkOrder'});
        this.changeTitleTxt({tit:'报修工单'});
        setStore('currentTitle','报修工单')
      },

      // 改变元素位置
      changeElementSite () {
        if (this.repairsWorkOrderMsg.state == 4) {
          this.$refs.contentBottom.style.position = "absolute"
          this.$refs.contentBottom.style.bottom = 0;
          this.$refs.contentBottom.style.left = 0
        } else {
          this.$refs.contentBottom.style.position = "relative"
        };
      },

      // 回显当前是否填写过耗材
      echoIsMaterial () {
        try {
          if (this.isFillMaterialList.length == 0) { this.isChangeConsumableShow = false; return };
          let echoIndex = this.isFillMaterialList.indexOf(this.isFillMaterialList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (echoIndex == -1) { this.isChangeConsumableShow = false; return };
          this.isChangeConsumableShow = this.isFillMaterialList[echoIndex]['isFilledMaterial']
        } catch (err) {
          this.$toast(`${err}`)
        }
      },

      // 存储是否填写过耗材
      storageIsMaterial () {
        let temporaryDepartmentNumber = [];
        temporaryDepartmentNumber = deepClone(this.isFillMaterialList);
        if (temporaryDepartmentNumber.length > 0 ) {
          let temporaryIndex = this.isFillMaterialList.indexOf(this.isFillMaterialList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentNumber[temporaryIndex]['isFilledMaterial'] = true
          } else {
            temporaryDepartmentNumber.push(
              {
                isFilledMaterial: true,
                taskId: this.taskId
              }
            )
          };
        } else {
          temporaryDepartmentNumber.push(
            {
              isFilledMaterial:true,
              taskId: this.taskId
            }
          )
        };
        this.changeisFillMaterialList(temporaryDepartmentNumber);
        setStore('isFillMaterialList', {"number": temporaryDepartmentNumber})
      },

       // 清除该任务存储的是否填写耗材的状态
      clearStorageMaterial () {
        if (this.isFillMaterialList.length == 0) { return };
        let temporaryPhotoList = this.isFillMaterialList.filter((item) => {return item.taskId !== this.taskId});
        this.changeisFillMaterialList(temporaryPhotoList);
        setStore('isFillMaterialList', {"number": temporaryPhotoList});
      },

      // 放大问题图片点击事件
      enlargeIssueImgEvent (item) {
        this.enlargeImgShow = true;
        this.enlargeImgUrl = item
      },

      // 放大维修后图片点击事件
      enlargeCompleteImgEvent (item) {
        this.enlargeImgShow = true;
        this.enlargeImgUrl = item
      },

      // 并行查询工单信息和图片信息
      parallelFunction () {
        this.loadinText = '加载中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        Promise.all([this.getOneRepairsProjectPhoto()]).then((values) => {
          this.showLoadingHint = false;
          this.overlayShow = false;
          if (values.length > 0) {
            this.photonList = values[0];
            if (this.photonList.length > 0) {
              for (let i = 0, len = this.photonList.length; i < len; i++) {
                if (this.photonList[i].imgType == 1) {
                  this.historyIssueImageList.push(this.photonList[i].imgSign)
                } else if (this.photonList[i].imgType == 2) {
                  this.historyCompleteImageList.push(this.photonList[i].imgSign)
                }
              }
            };
          }
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

      // 查询单条工单信息
      getOneRepairsProjectNoComplete () {
        queryOneRepairsProject(this.taskId).then((res) => {
          if(res && res.data.code == 200) {
            this.oneRepairsMsg = res.data.data;
          }
        })
        .catch((err) => {
          this.$dialog.alert({
          message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

      // 查询任务下的图片
       getOneRepairsProjectPhoto () {
        return new Promise((resolve,reject) => {
          queryRepairsTaskPhoto({taskId:this.taskId,imgType:-1}).then((res) => {
            if(res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
        })
      },

      // 拍照问题照片点击
      issueClickEvent () {
        this.photoType = 1;
        this.photoBox = true;
        this.clickIssue = true;
        this.clickComplete = false;
        this.overlayShow = true
      },

      // 拍照完成照片点击
      completeClickEvent () {
        this.photoType = 2;
        this.photoBox = true;
        this.clickIssue = false;
        this.clickComplete = true;
        this.overlayShow = true
      },

      // 问题照片删除
      issueDelete (index) {
        this.photoType = 1;
        this.issueImageList.splice(index,1);
        this.storePhoto(this.issueImageList,this.photoType)
      },

      // 完成照片删除
      completeDelete (index) {
        this.photoType = 2;
        this.completeImageList.splice(index,1);
        this.storePhoto(this.completeImageList,this.photoType)
      },

      // 拍照取消
      photoCancel () {
        this.photoBox = false;
        this.overlayShow = false
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
            if (_this.clickIssue) {
              _this.issueImageList.push(src);
              // 存储上传的照片
              _this.storePhoto(_this.issueImageList,_this.photoType)
            } else {
              _this.completeImageList.push(src);
              // 存储上传的照片
              _this.storePhoto(_this.completeImageList,_this.photoType)
            }
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
            if (_this.clickIssue) {
              _this.issueImageList.push(src);
              // 存储上传的照片
              _this.storePhoto(_this.issueImageList,_this.photoType)
            } else {
              _this.completeImageList.push(src);
              // 存储上传的照片
              _this.storePhoto(_this.completeImageList,_this.photoType)
            }
          }
        }, false);
        if (file) {
          reader.readAsDataURL(file);
        };
      },

      // 存储已经上传的照片
      storePhoto (photoId,type) {
        let temporaryPhotoList = [];
        temporaryPhotoList = deepClone(this.isCompleteRepairsWorkOrderPhotoList);
        if (this.isCompleteRepairsWorkOrderPhotoList.length > 0 ) {
          let temporaryIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex !== -1) {
            if (type === 1) {
              temporaryPhotoList[temporaryIndex]['issuePhototList'] = photoId;
            } else if (type === 2) {
              temporaryPhotoList[temporaryIndex]['completePhototList'] = photoId
            }
          } else {
            if (type === 1) {
              temporaryPhotoList.push(
                {
                  issuePhototList: photoId,
                  taskId: this.taskId
                }
              )
            } else if (type === 2) {
               temporaryPhotoList.push(
                {
                  completePhototList: photoId,
                  taskId: this.taskId
                }
              )
            }
          };
        } else {
          if (type === 1) {
            temporaryPhotoList.push(
              {
                issuePhototList: photoId,
                taskId: this.taskId
              }
            )
          } else if (type === 2) {
            temporaryPhotoList.push(
              {
                completePhototList: photoId,
                taskId: this.taskId
              }
            )
          }
        };
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList})
      },

      // 清除该任务存储的照片信息
      clearStoragePhoto () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
      },

      // 回显照片
      echoPhoto () {
        this.historyIssueImageList = [];
        this.historyCompleteImageList = [];
        this.issueImageList = [];
        this.completeImageList = [];
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let echoIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
        if (echoIndex === -1) { return };
        if (this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['issuePhototList']) {
          this.issueImageList = deepClone(this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['issuePhototList'])
        };
        if (this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['completePhototList']) {
          this.completeImageList = deepClone(this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['completePhototList'])
        }
      },

      // 上传图片
      uploadPhoto () {
        this.loadinText = '上传中,请稍等···';
        this.overlayShow = true;
        this.showLoadingHint = true;
        let imageType;
        let photoMsg = {
          taskId: this.taskId,  //任务ID
          images: []
        };
        photoMsg.images = [];
        if (this.issueImageList.length > 0) {
          imageType = 1;
          for (let item of this.issueImageList) {
            photoMsg.images.push({
              imgType: imageType,
              image: item
            })
          }
        };
        if (this.completeImageList.length > 0) {
          imageType = 2;
          for (let item of this.completeImageList) {
            photoMsg.images.push({
              imgType: imageType,
              image: item
            })
          }
        };
        uploadRepairsTaskPhoto(photoMsg)
        .then((res) => {
          this.showLoadingHint = false;
          this.overlayShow = false;
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            if (this.issueImageList.length > 0) {
              this.issueImageList = []
            }
            if (this.completeImageList.length > 0) {
              this.completeImageList = []
            };
            this.clearStorageMaterial();
            this.clearPhotoList();
            this.isFinishShow = true
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
      },

      // 清除上传成功后存储的照片
      clearPhotoList () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let echoIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
        if (echoIndex == -1) { return };
        let temporaryPhotoList = deepClone(this.isCompleteRepairsWorkOrderPhotoList);
        let temporaryPhotoId = [];
        temporaryPhotoList[echoIndex]['completePhototList'] = temporaryPhotoId;
        temporaryPhotoList[echoIndex]['issuePhototList'] = temporaryPhotoId;
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
      },

      // 填写耗材
      fillConsumable () {
        this.storageIsMaterial();
        this.$router.push({path: 'fillConsumable'});
        this.changeTitleTxt({tit:'填写耗材'});
        setStore('currentTitle','填写耗材')
      },

      // 是否确定完成确认
      isFinishSure () {
        completeRepairsTask({
          proId: this.proId,
          taskId: this.taskId
        })
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            // 清除任务存储的照片
            this.clearStoragePhoto();
            this.$router.push({path: 'repairsWorkOrder'});
            this.changeTitleTxt({tit:'报修工单'});
            setStore('currentTitle','报修工单')
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
      },

      // 是否确定完成取消
      isFinishCancel () {
        this.$router.push({path: 'repairsWorkOrder'});
        this.changeTitleTxt({tit:'报修工单'});
        setStore('currentTitle','报修工单')
      },

      // 完成工单
      completeTask () {
        if (this.repairsWorkOrderMsg.state == 4) {
          this.$router.push({path: 'workOrderSignature'});
          this.changeTitleTxt({tit:'工单完成签名'});
          setStore('currentTitle','工单完成签名')
        } else {
          if (this.issueImageList.length == 0 || this.completeImageList.length == 0) {
            this.$toast('请上传问题照片或完成照片');
            return
          };
          if (!this.isChangeConsumableShow) {
            this.$toast('请填写耗材');
            return
          };
          this.uploadPhoto()
        }
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
              color: black;
              padding-left: 10px;
            };
            &:last-child {
              color: @color-theme;
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
              color: black;
              padding-left: 10px;
            };
            &:not(:first-child) {
              width: 70%;
              text-align: right;
              overflow: auto;
              color: @color-theme;
              font-weight: bold;
              right: 10px;
              top: 0;
              b {
                font-weight: bold;
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
        font-size: 13px;
        background: #f7f7f7;
        position: relative;
        .photo-list {
          position: absolute;
          left: 70px;
          width: 250px;
          top: 10px;
          height: 90px;
          overflow: auto;
          li {
            width: 80px;
            height: 80px;
            float: left;
            margin-right: 4px;
            margin-bottom: 4px;
            position: relative;
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
              color: black;
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
              color: black;
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
        }
      };
      .content-bottom {
        height: 100px;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        background: #f7f7f7;
        .back-home {
          height: 40px;
          width: 220px;
          margin: 0 auto;
          line-height: 40px;
          left: 50%;
          margin-left: -110px;
          position: absolute;
          bottom: 50px;
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
      .choose-photo-box {
        position: fixed;
        margin: auto;
        left: 0;
        bottom: 0;
        width: 100%;
        z-index: 1000;
        font-size: 0px;
        > div {
          width: 100%;
          text-align: center;
          font-size: 16px;
          background: #f6f6f6
        }
        .choose-photo {
          padding: 8px 10px;
          height: 30px;
          display: inline-block;
          .bottom-border-1px(#cbcbcb);
          line-height: 30px;
          position: relative;
          cursor: pointer;
          color: @color-theme;
          overflow: hidden;
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
          height: 50px;
          display: inline-block;
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
          width: 100%;
          display: inline-block;
          padding: 8px 0;
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
