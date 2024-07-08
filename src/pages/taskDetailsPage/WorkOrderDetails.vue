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
                <van-icon name="cross" @click="issueDelete(index)" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6" />
              </li>
              <!-- <li v-for="(item,index) in historyIssueImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state == 5">
                <img width="100" height="130" :src="item" @click="enlargeIssueImgEvent(item,1)"/>
              </li> -->
            </ul>
            <span @click="issueClickEvent" class="icon-wrapper" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">
              <van-icon name="plus"/>
            </span>
          </div>
          <div class="complete-photo">
            <span>完成拍照</span>
            <ul class="photo-list">
              <li v-for="(item,index) in completeImageList" :key="`${item}-${index}`">
                <img width="100" height="130" :src="item" @click="enlargeCompleteImgEvent(item,0)"/>
                <van-icon name="cross" @click="completeDelete(index)" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6"/>
              </li>
              <!-- <li v-for="(item,index) in historyCompleteImageList" :key="`${item}-${index}`" v-show="repairsWorkOrderMsg.state == 5">
                <img width="100" height="130" :src="item" @click="enlargeCompleteImgEvent(item,1)"/>
              </li> -->
            </ul>
            <span @click="completeClickEvent" class="icon-wrapper" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">
              <van-icon name="plus"/>
            </span>
          </div>
          <div class="manage-wrapper">
            <div class="mange-title">
              <span>{{repairsWorkOrderMsg.state == 5 || repairsWorkOrderMsg.state == 6? "消耗耗材" : "耗材管理"}}</span>
              <span @click="addConsumable" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">添加</span>
            </div>
            <div class="circulation-area">
              <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
                <span>{{index+1}}</span>
                <span>
                  {{item.mateName}}-{{item.model}}
                </span>
                <span>
                  <van-stepper @change="function(val){stepValueChange(item,index,val)}" theme="round" integer 
                  @focus="function(val){stepValueFocus(item,index,val)}"
                  :disabled="repairsWorkOrderMsg.state == 5 || repairsWorkOrderMsg.state == 6? true : false"
                  v-model="item.number" min="0"/>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>  
      <div class="content-bottom" ref="contentBottom" v-show="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">
        <!-- <p class="back-home" @click="fillConsumable" v-show="repairsWorkOrderMsg.state !== 4 && isChangeConsumableShow">修改耗材</p>
        <p class="back-home"  @click="fillConsumable" v-show="repairsWorkOrderMsg.state !== 4 && !isChangeConsumableShow">填写耗材</p> -->
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
    <div class="contentDialog">
      <van-dialog v-model="toolShow"  show-cancel-button width="92%"
            @confirm="toolSure" @cancel="toolCancel" confirmButtonText="添加"
          >
            <div class="tool-name-list">
              <div class="tool-name-list-title-innner">
                <van-field
                  v-model="searchValue"
                />
                <span class="icon-span">
                  <van-icon name="search" @click="searchEvent"/>
                </span>
              </div>
              <div class="tool-name-list-content">
                <p class="circulation-area-title">
                  <span>物料名称</span>
                  <span>单位</span>
                  <span>操作</span>
                </p>
                <p v-for="(item,index) in inventoryMsgList" :key="`${item}-${index}`" class="circulation-area-content">
                  <span @click="mateNameEvent(item,index)">
                    {{item.mateName}}-{{item.model}}
                  </span>
                  <span>
                    {{item.unit ? item.unit : '无'}}
                  </span>
                  <span>
                    <van-checkbox v-model="item.checked" shape="square" :disabled="item.disabled"></van-checkbox>
                  </span>
                </p>
              </div>
            </div>
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
  import {queryOneRepairsProject,uploadRepairsTaskPhoto,queryAllMaterial,queryRepairsTaskPhoto,saveMate,completeRepairsTask,sureStartTask,queryMaterialById} from '@/api/worker.js'
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
        searchValue: '',
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
      },
      searchValue:{
        handler(newVal, oldVal){
          console.log(newVal,oldVal);
          this.inventoryMsgList = [];
          this.inventoryMsgList = this.temporaryInventoryMsgList.filter((item) => {return item.mateName.indexOf(newVal) != -1})
        },
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

      // 添加确认
      toolSure () {
        let count = this.inventoryMsgList.some((item)=> {return item.checked == true});
        if (!count) {
          this.$toast('至少要选择一种耗材')
        } else {
          this.materialContentShow = true;
          let checkConsumableList = this.inventoryMsgList.filter((item) => {return item.checked == true});
          for (let item of checkConsumableList) {
            this.consumableMsgList.push({
              number: 0,
              mateName: item.mateName,
              mateNumber: item.mateNumber,
              unit: item.unit,
              mateId: item.id,
              model: item.model,
              quantity: item.quantity,
              storeId: this.storeId,
              systemId: this.systemId
            })
          };
        }
      },

      // 添加取消
      toolCancel () {

      },

      // 耗材名称点击事件
      mateNameEvent (name,index) {
        this.inventoryMsgList[index]['checked'] = !this.inventoryMsgList[index]['checked'];
      },

      // 添加物质
      addConsumable () {
        this.toolShow = true;
        this.searchValue = '';
        this.getAllMaterial({
	        proId: this.proId,
          state: 0
        })
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

      // 步进器值变化事件
      stepValueChange (item,index,val) {
        if (item.quantity == null) { return};
        if (val === "") {return};
        this.consumableIndex = index;
        if (val == 0) {
          if (!this.isDeleteShow) {
            this.isDeleteShow = true;
            return
          }
        };
        if (item.quantity > 0) {
          if (val > item.quantity) {
            this.$toast(`数量不能超过耗材库存数量${item.quantity}`);
            this.$nextTick(() => {
              this.$set(this.consumableMsgList[index],'number',item.quantity)
            });
            return
          }
        }  
      },

      // 步进器聚焦事件
      stepValueFocus (item,index,val) {
        if (val != 0) {
        }
      },

      // 步进器失去焦点事件
      stepValueBlur (item,index,val) {
        if (Number(item.number) > item.quantity && this.consumableMsgList[index]['number'] != 1) {
          this.consumableMsgList[index]['number'] = 1
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

      //查询所有物料信息
      getAllMaterial (data) {
        queryAllMaterial(data)
        .then((res) => {
          if(res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.inventoryMsgList = [];
              this.temporaryInventoryMsgList = [];
              for (let item of res.data.data) {
                item.checked = false;
                // 添加过的物料不允许再次添加,数量为0不容许选择操作
                let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
                if (isExist.length > 0) {
                  item['disabled'] = true
                } else {
                  if (item.quantity > 0) {
                    item['disabled'] = false
                  } else {
                    item['disabled'] = true
                  }
                }
              };
              this.inventoryMsgList = res.data.data;
              this.temporaryInventoryMsgList = res.data.data;
              this.storeId = this.inventoryMsgList[0]['storeId'];
              this.systemId = this.inventoryMsgList[0]['systemId'];
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

      // 搜索事件
      searchEvent () {
        if (this.searchValue == '') {
          this.getAllMaterial({
            proId: this.proId,
            state: 0
          });
          return
        };
        this.inventoryMsgList = [];
        this.inventoryMsgList = this.temporaryInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1})
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
              _this.storePhoto(_this.issueImageList,_this.photoType);
              // 确认任务开始
              _this.sureTask({
                proId: _this.proId,
                taskId: _this.taskId,
                workerId: _this.workerId
              })
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
              _this.storePhoto(_this.issueImageList,_this.photoType);
              // 确认任务开始
              _this.sureTask({
                proId: _this.proId,
                taskId: _this.taskId,
                workerId: _this.workerId
              })
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

      // 上传图片
      uploadPhoto () {
        let imageType;
        let photoMsg = {
          taskId: this.taskId,  //任务ID
          images: []
        };
        photoMsg.images = [];
        if (this.issueImageList.length > 0) {
          imageType = 1;
          for (let item of this.issueImageList) {
            // 上传过的图片不在进行上传
            if (item.indexOf('https') == -1 && item.indexOf('http') == -1) {
              photoMsg.images.push({
                imgType: imageType,
                image: item
              })
            } 
          }
        };
        if (this.completeImageList.length > 0) {
          imageType = 2;
          for (let item of this.completeImageList) {
            // 上传过的图片不在进行上传
             if (item.indexOf('https') == -1 && item.indexOf('http') == -1) {
              photoMsg.images.push({
                imgType: imageType,
                image: item
              })
            }  
          }
        };
        return new Promise((resolve,reject) => {
          uploadRepairsTaskPhoto(photoMsg)
          .then((res) => {
            if (res && res.data.code == 200) {
              this.issueImageList = [];
              this.completeImageList = [];
              this.$toast('图片上传成功');
              resolve()
            } else {
              reject(`${res.data.msg}`);
            }
          })
          .catch((err) => {
            reject(err.message)
          })
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

      // 清除该任务存储的照片信息
      clearStoragePhoto () {
        if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
        let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
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
          console.log('提交的物料信息',this.consumableMsgList);
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
                  unit: item.unit,
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

      // 完成工单
      completeTask () {
        if (this.issueImageList.length == 0 || this.completeImageList.length == 0) {
          this.$toast('请上传问题照片或完成照片');
          return
        };
        // if (this.consumableMsgList.length == 0) {
        //   this.$toast('请填写耗材');
        //   return
        // };
        this.loadinText = '数据上传中,请稍等···';
        this.showLoadingHint = true;
        this.overlayShow = true;
        // 并行提交图片和耗材数据
        Promise.all([this.submitMaterials(),this.uploadPhoto()]).then(() => {
          this.clearStorageMaterial();
          if (this.repairsWorkOrderMsg.state == 4) {
            this.changeIsFreshRepairsWorkOrderPage(true);
            this.$router.push({path: 'workOrderSignature'});
            this.changeTitleTxt({tit:'工单完成签名'});
            setStore('currentTitle','工单完成签名');
          } else {
            this.isFinishShow = true
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
    .contentDialog {
      /deep/ .van-dialog {
        top: 50%;
        .van-dialog__content {
          margin-bottom: 6px;
          /*height: 500px;*/
          margin: 10px 0;
          .tool-name-list {
            width: 94%;
            display: flex;
            flex-flow: column;
            overflow: auto;
            margin: 0 auto;
            padding: 0;
            max-height: 80vh;
            .tool-name-list-title-innner {
              padding: 10px;
              position: relative;
              /deep/ .van-cell {
                padding: 4px;
                border: 1px solid #333;
              };
              .icon-span {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                display: inline-block;
                right: 16px;
                .van-icon {
                  font-size: 23px
                }
              }
            }
            .tool-name-list-content {
              flex: 1;
              padding: 6px;
              overflow: auto;
              box-sizing: border-box;
              border-top: 1px solid #b2b2b2;
              width: 100%;
              .circulation-area-content {
                position: relative;
                display: flex;
                align-items: center;
                height: 40px;
                background: #fff;
                > span {
                  height: 40px;
                  line-height: 40px;
                  font-size: 16px;
                  display: inline-block;
                  &:first-child {
                    width: 60%;
                    overflow-x: auto;
                    white-space: nowrap;
                  };
                  &:nth-child(2) {
                    width: 20%;
                    text-align: center;
                  }
                  &:last-child {
                    width: 20%;
                    display: flex;
                    justify-content: center;
                  }
                }
              }
              .circulation-area-title {
                position: relative;
                font-size: 0;
                display: flex;
                align-items: center;
                span {
                  height: 40px;
                  line-height: 40px;
                  display: inline-block;
                  width: 20%;
                  font-size: 16px;
                  &:first-child {
                    width: 60%;
                  };
                  &:nth-child(2) {
                    width: 20%;
                    text-align: center;
                  }
                  &:last-child {
                    width: 20%;
                    text-align: center;
                  }
                }
              }
            }
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
                };
                &:last-child {
                  right: 10px;
                  width: 55px;
                  height: 30px;
                  text-align: center;
                  line-height: 30px;
                  border-radius: 6px;
                  background: #2db8f9;
                  color: #fff
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
                &:last-child {
                  margin-bottom:0
                }
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
                    overflow-x: auto;
                    white-space: nowrap;
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
                    text-align: right;
                    /deep/ .van-stepper--round {
                      .van-stepper__minus {
                        color: #fff;
                        background-color: @color-theme;
                        border: 1px solid @color-theme;
                        &:before {
                          height: 3px
                        }
                      };
                      .van-stepper__plus {
                        color: #fff;
                        background-color: @color-theme;
                        border: 1px solid @color-theme;
                        &:before {
                          height: 3px
                        };
                        &:after {
                          width: 3px
                        }
                      }
                    };
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
        height: 40px;
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
