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
      <div class="content-real">
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
          <div class="content-top-space">
            <span>目的空间</span>
            <p v-if="oneRepairsMsg && oneRepairsMsg.spaces && oneRepairsMsg.spaces.length > 0">
              {{ oneRepairsMsg.spaces.join(',') }}
            </p>
          </div>
          <p class="content-top-name">
            <span>工单内容</span>
            <span>
              {{oneRepairsMsg.taskRemark ? oneRepairsMsg.taskRemark : '无'}}
            </span>
          </p>
        </div>
        <div class="content-middle">
          <div class="issue-photo">
            <span>问题拍照</span>
            <ul class="photo-list">
              <li v-for="(item,index) in issueImageList" :key="`${item}-${index}`">
                <img width="100" height="130" :src="item" @click="enlargeIssueImgEvent(item,0)" />
              </li>
            </ul>
          </div>
          <div class="complete-photo">
            <span>完成拍照</span>
            <ul class="photo-list">
              <li v-for="(item,index) in completeImageList" :key="`${item}-${index}`">
                <img width="100" height="130" :src="item" @click="enlargeCompleteImgEvent(item,0)"/>
              </li>
            </ul>
          </div>
          <div class="manage-wrapper">
            <div class="mange-title">
              <span>耗材使用量</span>
            </div>
            <div class="circulation-area">
              <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
                <span>{{index+1}}</span>
                <span>
                  {{item.mateName}}-{{item.model}}
                </span>
                <span>
                 {{ `${item.number}${item.unit}` }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>  
      <div class="content-bottom" ref="contentBottom" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">
        <p class="complete-check" :class="{'completeCheckStyle' : !userInfo.extendData.projectAudit }" @click="completeTask">完成审核</p>
        <p class="reject-workorder" :class="{'rejectWorkorderStyle' : !userInfo.extendData.projectAudit }" @click="rejectWorkorderEvent">驳回工单</p>
      </div>
    </div>
    <div class="reject-reason-dialog">
        <van-dialog v-model="rejectReasonShow" show-cancel-button cancelButtonText="否" confirmButtonText="是"
          @cancel="rejectWorkorderCancelEvent" :before-close="rejectReasonDialogBeforeCloseEvent"
        >
            <div class="reject-reason-box">
                <div class="reject-title">
                    <span>是否驳回该工单?</span>
                    <van-icon name="cross" size="24" color="#101010" @click="closeRejectReasonDialogEvent" />
                </div>
                <div class="reject-content">
                    <div class="reject-left">驳回原因:</div>
                    <div class="reject-right">
                        <van-field
                            v-model="rejectReason"
                            rows="3"
                            autosize
                            type="textarea"
                            maxlength="50"
                            placeholder="请输入驳回原因"
                            show-word-limit
                            />
                    </div>
                </div>
            </div>
        </van-dialog>
    </div>
    <div class="infoDialog">
      <van-dialog class="infoDialog" v-model="enlargeImgShow" width="90%">
        <img :src="enlargeImgUrl">
      </van-dialog>
    </div>  
    <div class="infoDialog">
      <van-dialog v-model="isFinishShow"  title="确定完成?" show-cancel-button
          @confirm="isFinishSure" @cancel="isFinishCancel"
        >
      </van-dialog>
    </div>
    <div class="infoDialog">
      <van-dialog v-model="isDeleteShow"  title="是否删除该耗材?" show-cancel-button
          @confirm="isDeleteSure" @cancel="isDeleteCancel"
        >
      </van-dialog>
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
  import {queryOneRepairsProject,uploadRepairsTaskPhoto,queryAllMaterial,queryRepairsTaskPhoto,saveMate,completeRepairsTaskFinal,sureStartTask,queryMaterialById, dismissalTask} from '@/api/worker.js'
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
        rejectReasonShow: false,
        rejectReason: '',
        photoBox: false,
        toolShow: false,
        isDeleteShow: false,
        consumableIndex: null,
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
        inventoryMsgList: [],
        temporaryInventoryMsgList: [],
        historyIssueImageList: [],
        historyCompleteImageList: [],
        photonList: [],
        consumableMsgList: [],
        enlargeImgShow: false,
        oneRepairsMsg: '',
        enlargeImgUrl: '',
        storeId: '',
        systemId: ''
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
        this.gotoURL(() => {
          if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
            this.changeIsFreshRepairsWorkOrderPage(false)
          } else {
            this.changeIsFreshRepairsWorkOrderPage(true)
          };
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
      this.getOneRepairsProjectNoComplete(this.taskId);
      this.parallelFunction();
      this.echoIsMaterial();
      if (this.repairsWorkOrderMsg.state != 5 && this.repairsWorkOrderMsg.state != 6) {
        this.queryStoreId({proId: this.proId,state: 0});
      };
      this.getMaterialById(this.taskId)
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
        if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
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

      // 关闭拒绝弹框事件
      closeRejectReasonDialogEvent () {
        this.rejectReasonShow = false;
      },

      // 耗材名称点击事件
      mateNameEvent (name,index) {
        this.inventoryMsgList[index]['checked'] = !this.inventoryMsgList[index]['checked'];
      },

      // 是否删除耗材确定事件
      isDeleteSure () {
        this.consumableMsgList.splice(this.consumableIndex,1)
      },

      // 是否删除耗材取消事件
      isDeleteCancel () {
        this.consumableMsgList[this.consumableIndex]['number'] = 1
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
      enlargeIssueImgEvent (item,type) {
        this.enlargeImgShow = true;
        type === 0 ? this.enlargeImgUrl = item : this.enlargeImgUrl = item
      },

      // 放大维修后图片点击事件
      enlargeCompleteImgEvent (item,type) {
        this.enlargeImgShow = true;
        type === 0 ? this.enlargeImgUrl = item : this.enlargeImgUrl = item
      },

      // 并行查询工单信息和图片信息
      parallelFunction () {
        this.loadinText = '加载中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        Promise.all([this.getOneRepairsProjectPhoto()]).then((values) => {
          console.log('图片信息',values);
          this.showLoadingHint = false;
          this.overlayShow = false;
          if (values.length > 0) {
            this.photonList = values[0];
            if (this.photonList.length > 0) {
              for (let i = 0, len = this.photonList.length; i < len; i++) {
                if (this.photonList[i].imgType == 1) {
                  this.issueImageList.push(this.photonList[i].path);
                } else if (this.photonList[i].imgType == 2) {
                  this.completeImageList.push(this.photonList[i].path)
                }
              }
            };
          };
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

      // 查询单条工单信息
      getOneRepairsProjectNoComplete () {
        this.loadinText = '加载中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        queryOneRepairsProject(this.taskId).then((res) => {
          if(res && res.data.code == 200) {
            this.oneRepairsMsg = res.data.data;
            let temporaryArr = [];
            for (let item of this.oneRepairsMsg.spaces) {
              temporaryArr.push(item.name)
            };
            this.oneRepairsMsg['spaces'] = temporaryArr
          };
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.$dialog.alert({
          message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

      //查询任务关联的物料信息
      getMaterialById (taskId) {
        queryMaterialById(taskId)
        .then((res) => {
          if(res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.consumableMsgList = [];
              console.log('使用物料',res.data.data);
              this.consumableMsgList = res.data.data;
            } else {
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

      //查询查询所有物料信息
      queryStoreId (data) {
        queryAllMaterial(data)
        .then((res) => {
          if(res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.storeId = res.data.data[0]['storeId'];
              this.systemId = res.data.data[0]['systemId'];
            } else {
              this.$dialog.alert({
                message: '没有查询到对应的物料信息',
                closeOnPopstate: true
              }).then(() => {
              })
            }
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

      // 确认任务开始
      sureTask (data) {
        sureStartTask(data).then((res) => {
          if(res && res.data.code == 200) {
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
        };
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

      // 清除该任务存储的照片信息
      clearStoragePhoto () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
        this.changeIsCompletePhotoList(temporaryPhotoList);
        setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
      },

      // 是否确定完成确认
      isFinishSure () {
        this.loadinText = '完成中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        completeRepairsTask({
          proId: this.proId,
          taskId: this.taskId
        })
        .then((res) => {
          if (res && res.data.code == 200) {
            this.$toast(`${res.data.msg}`);
            if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
              this.changeIsFreshRepairsWorkOrderPage(false)
            } else {
              this.changeIsFreshRepairsWorkOrderPage(true)
            };
            this.$router.push({path: 'repairsWorkOrder'});
            this.changeTitleTxt({tit:'报修工单'});
            setStore('currentTitle','报修工单')
          } else {
            this.$toast(`${res.data.msg}`);
          };
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false;
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

        // 提交用到的耗材信息
        submitMaterials () {
          let mateMsg = {
            proId: this.proId,
            id: this.taskId,
            isApp: 1,
            materials: []
          };
          for (let item of this.consumableMsgList) {
            if (item.number > 0) {
              mateMsg.materials.push(
                {
                  proId: this.proId,
                  proName: item.mateName,
                  mateId: item.mateId,
                  number: item.number,
                  mateNumber: item.mateNumber,
                  mateName: item.mateName,
                  model: item.model,
                  storeId: this.storeId,
                  systemId: this.systemId
                }
              )
            }  
          };
          return new Promise((resolve,reject) => {
            saveMate(mateMsg).then((res) => {
              if (res && res.data.code == 200) {
                this.$toast('物料上传成功');
                resolve()
              } else {
                reject(`${res.data.msg}`)
              }
            })
          .catch((err) => {
            reject(err.message)
          })
        })
      },

      // 是否确定完成取消
      isFinishCancel () {
        if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
          this.changeIsFreshRepairsWorkOrderPage(false)
        } else {
          this.changeIsFreshRepairsWorkOrderPage(true)
        };
        this.$router.push({path: 'repairsWorkOrder'});
        this.changeTitleTxt({tit:'报修工单'});
        setStore('currentTitle','报修工单')
      },

      // 完成审核
      completeTask () {
        if (!this.userInfo.extendData.projectAudit) {
            this.$toast('你暂无此权限!');
            return
        };
        this.loadinText = '完成审核中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        completeRepairsTaskFinal({
          proId: this.proId,
          taskId: this.taskId
        })
        .then((res) => {
          this.clearStorageMaterial();  
          if (res && res.data.code == 200) {
            this.$router.push({path: 'repairsWorkOrder'});
            this.changeTitleTxt({tit:'报修工单'});
            setStore('currentTitle','报修工单')
          } else {
            this.$toast(`${res.data.msg}`);
          };
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },

    // 驳回工单事件
    rejectWorkorderSureEvent () {
        this.loadinText = '驳回中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        dismissalTask({
          proId: this.proId,
          taskId: this.taskId,
          reason: this.rejectReason,
          workerId: this.workerId
        })
        .then((res) => {
          this.clearStorageMaterial();  
          if (res && res.data.code == 200) {
            this.$router.push({path: 'repairsWorkOrder'});
            this.changeTitleTxt({tit:'报修工单'});
            setStore('currentTitle','报修工单')
          } else {
            this.$toast(`${res.data.msg}`);
          };
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
        .catch((err) => {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          });
          this.loadinText = '';
          this.showLoadingHint = false;
          this.overlayShow = false
        })
      },
      

      // 驳回工单显示驳回原因弹框事件
      rejectWorkorderEvent () {
        if (!this.userInfo.extendData.projectAudit) {
            this.$toast('你暂无此权限!');
            return
        };          
        this.rejectReason = '';  
        this.rejectReasonShow = true;
      },

      // 驳回工单关闭前事件
      rejectReasonDialogBeforeCloseEvent (action, done) {
        if (action == "confirm") {
            if (this.rejectReason === '') {
                this.$toast('请输入驳回原因!');
                done(false) 
            } else {
              this.rejectWorkorderSureEvent();  
              done() 
            }
        } else {
            done() 
        }
      },

      // 驳回工单取消事件
      rejectWorkorderCancelEvent () {}
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
    .reject-reason-dialog {
     /deep/ .van-dialog {
        width: 95% !important;
        top: 50% !important;
        border-radius: 8px;
        .van-dialog__content {
          padding: 20px 20px 0 20px;
          box-sizing: border-box;
          .reject-reason-box {
            .reject-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                >span {
                    font-size: 16px;
                    color: #101010;
                    font-weight: bold;
                }
            };
            .reject-content {
                display: flex;
                margin-top: 20px;
                .reject-left {
                    font-size: 14px;
                    color: #101010;
                };
                .reject-right {
                    flex: 1;
                    margin-left: 10px;
                    /deep/ .van-cell {
                        border: 1px solid #d9d9d9;
                    }
                }
            }    
          }
        };
        .van-dialog__footer {
            justify-content: center;
            height: 90px;
            align-items: center;
            .van-dialog__cancel {
                flex: none !important;
                width: 30%;
                margin-right: 60px;
                color: #fff;
                border-radius: 7px;
                color: #0A7AF5;
                height: 40px;
                border: 1px solid #0A7AF5;
            };
            .van-dialog__confirm {
                flex: none !important;
                width: 30%;
                height: 40px;
                color: #fff;
                border-radius: 7px;
                background: #0A7AF5;
            }
        }
      }
    };
    .infoDialog {
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
      }
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      .content-real {
        flex: 1;
        margin: 0 auto;
        width: 100%;
        overflow: auto;
        font-size: 13px;
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
            min-height: 45px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 10px;
            .bottom-border-1px(#dadada);
            &:last-child {
              .bottom-border-1px(#fff)
            }
            > span {
              display: inline-block;
              &:first-child {
                color: black;
              };
              &:not(:first-child) {
                width: 70%;
                text-align: right;
                word-break: break-all;
                color: @color-theme;
                font-weight: bold;
                line-height: 18px;
                b {
                  font-weight: bold;
                }
              }
            }
          };
           .content-top-space {
            min-height: 45px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 10px;
            .bottom-border-1px(#dadada);
            >span {
              display: inline-block;
            };
            p {
              width: 70%;
              text-align: right;
              color: @color-theme;
              font-weight: bold;
              word-break: break-all;
              line-height: 18px;
              >span {
                font-size: 14px
              }
            }
          }
        };
        .content-middle {
          position: relative;
          background: #f7f7f7;
          padding: 20px 0;
          box-sizing: border-box;
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
            margin: 20px 0;
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
          .manage-wrapper {
            background: #fff;
            .mange-title {
              height: 50px;
              .bottom-border-1px(#dadada);
              span {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                &:first-child {
                  left: 10px;
                }
              }
            };
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
                > span {
                  height: 50px;
                  line-height: 50px;
                  font-size: 16px;
                  display: inline-block;
                  text-align: center;
                  &:first-child {
                    width: 15%;
                    .no-wrap()
                  };
                  &:nth-child(2) {
                    width: 55%;
                    .no-wrap();
                    text-align: left;
                    /deep/ .van-cell {
                      .van-cell__value--alone {
                        .van-field__control {
                          text-align: center
                        }
                      }
                    }
                  };
                  &:last-child {
                    position: absolute;
                    top:0;
                    right: 4px;
                    width: 30%;
                    text-align: center;
                    span {
                      display: inline-block;
                      position: absolute;
                      top: 0;
                      right: 2px;
                      font-size: 22px;
                      color: @color-theme;
                      /deep/ .van-icon {
                        top: 2px
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }  
      .content-bottom {
        height: 60px;
        margin: 0 auto;
        width: 100%;
        font-size: 13px;
        background: #f7f7f7;
        display: flex;
        justify-content: center;
        align-items: center;
        .complete-check {
          height: 40px;
          width: 35%;
          line-height: 40px;
          border-radius: 4px;
          background: @color-theme;
          color: #fff;
          font-weight: bold;
          text-align: center;
          margin-right: 25px;
        };
        .completeCheckStyle {
           opacity: .4 !important;
        };
        .reject-workorder {
          height: 40px;
          width: 35%;
          line-height: 40px;
          background: #FF0000;
          border-radius: 4px;
          color: #fff;
          font-weight: bold;
          text-align: center
        };
        .rejectWorkorderStyle {
            opacity: .4 !important;
        }
      }
    }
  }
</style>
