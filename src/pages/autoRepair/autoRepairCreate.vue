<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
     <!-- 选择科室弹窗 -->
    <div class="choose-department">
      <van-popup
        v-model="departmentDialogShow"
        round
        closeable
        position="bottom"
        :style="{ height: '45%' }"
      >
        <div class="department-content-box">
          <div class="left-wrapper">
            <div class="left">
              <van-empty description="暂无楼栋" v-show="constructionList.length == 0" />
              <div class="construction-list" v-for="(item,index) in constructionList" :key="index" @click="constructionItemClickEvent(item,index)" :class="{'constructionListStyle': currentConstructionIndex === index}">
                {{ item['text'] }}
              </div>
            </div>
          </div>  
          <!-- <div class="center-wrapper">
            <div class="center">
              <div class="tier-list" v-for="(item,index) in tierList" :key="index" @click="tierItemClickEvent(item,index)" :class="{'tierListStyle': currentTierIndex == index}">
                {{ item }}
              </div>
            </div>
          </div> -->
          <div class="right-wrapper">
            <div class="right">
              <van-empty description="暂无科室" v-show="departmentList.length == 0" />
              <div class="department-list" v-for="(item,index) in departmentList" :key="index" @click="departmentItemClickEvent(item,index)" :class="{'departmentListStyle': currentDepartmentIndex == index}">
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>
      </van-popup>
    </div>
    <!-- 选择房间弹窗 -->
    <div class="choose-room">
      <van-popup
        v-model="roomDialogShow"
        round
        closeable
        position="bottom"
        :style="{ height: '45%' }"
      >
        <div class="room-content-box">
          <van-empty description="暂无房间" v-show="roomList.length == 0" />
          <div class="room-content" @click="roomItemClickEvent(item,index)" :class="{'roomContentStyle': currentRoomIndex == index}" v-for="(item,index) in roomList" :key="index">
            {{ item.text }}
          </div>
        </div>
      </van-popup>
    </div>
    <!-- 参与人弹窗 -->
    <div class="participation-person">
      <van-popup
        v-model="participationPersonDialogShow"
        round
        closeable
        @close="closeParticipationPersonDialogEvent"
        position="bottom"
        :style="{ height: '45%' }"
      >
        <div class="participation-person-box">
          <van-empty description="暂无参与人" v-show="participationPersonList.length == 0" />
          <div class="participation-person-content" v-for="(item,index) in participationPersonList" :key="index">
            <div class="participation-person-content-left">
              {{ item.text }}
            </div>
            <div class="participation-person-content-right">
              <van-checkbox v-model="item.checked"></van-checkbox>
            </div>
          </div>
        </div>
      </van-popup>
    </div>
    <!-- 图片放大弹框  -->
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
          <img :src="currentImgUrl" />
        </van-dialog> 
    </div>
    <!-- 退出提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="quitInfoShow"  show-cancel-button width="85%"
          @confirm="quitSure" @cancel="quitCancel" confirm-button-text="是"
          cancel-button-text="否"
        >
          <div class="delete-icon">
            <van-icon name="cross" size="24" @click="quitInfoShow = false" />
          </div>
          <div class="dialog-title">
            是否保留本次填写的内容?
          </div>
          <div class="dialog-center">
            你下次进入创建自主报修时,将恢复本次填写的内容。
          </div>
      </van-dialog>
    </div>
     <!-- 物料弹框  -->
    <div class="material-box">
      <van-dialog v-model="materialShow"  show-cancel-button width="100%"
          @confirm="materialSure" @cancel="materialCancel" confirm-button-text="添加"
          cancel-button-text="取消"
        >
          <div class="dialog-top">
            <div class="select-title">添加耗材</div>
            <van-icon name="cross" size="24" @click="closeScreenDialogEvent" />
          </div>
          <div class="tool-name-list">
            <div class="tool-name-list-title-innner">
                <div class="search-input">
                  <van-field
                    v-model="searchValue"
                    placeholder="物资"
                  />
                  <span class="icon-span">
                    <van-icon name="search" color="#B7B6B6" />
                  </span>
                </div>
                <div class="search-btn" @click="searchEvent">搜索</div>
            </div>
            <div class="tool-name-list-content">
              <van-row class="static-row">
                <div class="circulation-area-title-box">
                  <span>物资名称</span>
                  <span>单位</span>
                  <span>型号</span>
                  <span>规格</span>
                </div>
                <div class="circulation-area-content-box"> 
                  <p v-for="(item,index) in inventoryMsgList" :key="`${item}-${index}`" class="circulation-area-content">
                    <span @click="mateNameEvent(item,index)">
                      {{item.mateName}}
                    </span>
                    <span>
                      {{item.unit ? item.unit : '无'}}
                    </span>
                    <span>
                      {{ item.model ?  item.model : '无'}}
                    </span>
                    <span>
                      {{ item.norms ?  item.norms : '无' }}
                    </span>
                  </p>
                  <van-empty description="暂无数据" v-show="inventoryMsgList.length == 0" />
                </div>
              </van-row>
              <van-row class="absolute-row">
                <div class="absolute-title">
                  占位
                </div>
                <div class="absolute-operate">
                  <p v-for="(item,index) in inventoryMsgList" :key="`${item}-${index}`">
                    <span>
                      <van-checkbox v-model="item.checked" shape="square" :disabled="item.disabled"></van-checkbox>
                    </span>
                  </p>
                </div>
              </van-row>
              <div class="shadow-box"></div> 
            </div>
            <div class="page-area">
              <div class="page-left" @click="pageClickEvent('previous')" :class="{'pageSpanStyle' : currentPage == 1}">上一页</div>
              <div class="page-center">
                <span>{{ totalPage == 0 ? 0 : currentPage }}</span>
                <span>/</span>
                <span>{{ totalPage }}</span>
              </div>
              <div class="page-right" @click="pageClickEvent('next')" :class="{'pageSpanStyle' : currentPage == totalPage}">下一页</div>
            </div>
          </div>
      </van-dialog>
    </div>
    <!-- 物料删除提示框   -->
    <div class="material-delete-box">
       <van-dialog v-model="materialDeleteShow"  show-cancel-button width="90%"
          @confirm="materialDeleteSure" @cancel="materialDeleteCancel" confirm-button-text="确定"
          cancel-button-text="取消"
        >
          <div class="dialog-top">
            <img :src="deleteInfoPng" alt="">
          </div>
          <div class="dialog-center">
           {{`是否删除:${deleteMaterial}?`}}
          </div>
      </van-dialog>
    </div>
    <div class="nav">
       <van-nav-bar
        title="自主报修"
        left-text=""
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
    >
        <template #right>
           <van-icon name="scan" @click="onClickRight" />
        </template>
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
           <div class="problem-description-box">
               <div class="problem-description-tit">
                  问题描述
               </div>
               <div class="problem-description-content">
                  <div class="task-type">
                    <div class="problem-description-content-top">
                      <span>*</span>
                      <span>任务类型</span>
                    </div>
                    <div class="problem-description-content-bottom">
                      <span v-for="(item,index) in taskTypeOption" :key="index" @click="taskTypeClickEvent(index,item)" :class="{'taskTypeStyle': taskTypeIndex === index}">
                        {{ item.text }}
                      </span>
                    </div>
                  </div>
                  <div class="goal-department">
                    <div class="goal-department-left">
                      <span>*</span>
                      <span>目的科室</span>
                    </div>
                    <div class="goal-department-right" @click="goalDepartmentClickEvent">
                      <span>{{ currentDepartment.text }}</span>
                      <van-icon name="arrow" color="#989999" size="24" />
                    </div>
                  </div>
                  <div class="goal-department goal-room">
                    <div class="goal-department-left">
                      <span>目的房间</span>
                    </div>
                    <div class="goal-department-right" @click="goalRoomClickEvent">
                      <span>{{ currentRoom.text }}</span>
                      <van-icon name="arrow" color="#989999" size="24" />
                    </div>
                  </div>
                  <div class="list-line-image">
                    <div>
                      <span>*</span>
                      <span>问题图片</span>
                    </div>
                     <div class="image-list">
                        <div v-for="(item, index) in problemPicturesList" :key='index'>
                            <img :src="item" @click="enlareEvent(item)" />
                            <div class="icon-box" @click="issueDelete(index,item)">
                                <van-icon
                                name="cross"
                                color="#101010"
                                />
                            </div>
                        </div>
                        <div @click="issueClickEvent">
                          <van-icon name="plus" size="30" color="#101010" />
                        </div>
                    </div>
                  </div>
                  <div class="issue-content">
                    <div class="issue-left">
                      问题描述
                    </div>
                    <div class="issue-right">
                      <van-field
                        v-model="issueDescribe"
                        rows="3"
                        type="textarea"
                        maxlength="300"
                        placeholder="请输入问题描述"
                        show-word-limit
                      />
                    </div>
                  </div>
               </div>
           </div>
           <div class="maintenance-record-box">
            <div class="maintenance-record-tit">维修记录</div>
            <div class="maintenance-record-content">
              <div class="maintenance-man">
                <div class="maintenance-man-left">
                  <span>*</span>
                  <span>维修员</span>
                </div>
                <div class="maintenance-man-right">
                  <span>张三</span>
                </div>
              </div>
              <div class="participation-man">
                <div class="participation-man-left">
                  <span>参与人</span>
                </div>
                <div class="participation-man-right" @click="participationPersonClickEvent">
                  <span>{{ disposeTaskPresent(curretnParticipant) }}</span>
                  <van-icon name="arrow" color="#989999" size="24" />
                </div>
              </div>
               <div class="list-line-image">
                  <div>
                    <span>*</span>
                    <span>修复图片</span>
                  </div>
                    <div class="image-list">
                      <div v-for="(item, index) in repairPicturesList" :key='index'>
                          <img :src="item" @click="enlareRepairEvent(item)" />
                          <div class="icon-box" @click="repairDelete(index,item)">
                              <van-icon
                              name="cross"
                              color="#101010"
                              />
                          </div>
                      </div>
                      <div @click="repairClickEvent">
                        <van-icon name="plus" size="30" color="#101010" />
                      </div>
                  </div>
                </div>
            </div>
           </div>
           <div class="consumable-management-area">
              <div class="circulation-area-title">
                <span>使用物料</span>
                <span @click="materialShowEvent">添加</span>
              </div>
              <div class="circulation-area">
                <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
                  <span>{{index+1}}</span>
                  <span>
                    {{item.mateName}}-{{item.model}}
                  </span>
                  <span>
                    <van-stepper 
                    @change="(value,detail) => {stepperEvent(value,detail,item,index)}" 
                    @plus="stepperPlusEvent(item,index)"
                    v-model.number="item.number" min="0" :max="item.quantity+1" />
                  </span>
                  <span>
                    <van-icon name="delete" color="red" @click="deleteEvent(item,index)" />
                  </span>
                </p>
              </div>
            </div>
           <div class="operation-box">
             <span class="operate-one" @click="sureEvent">确认</span>
            <span class="operate-three" @click="cancelEvent">取消</span>
           </div>
        </div>
    </div>
    <!-- 问题图片删除 -->
    <van-dialog v-model="deleteInfoDialogShow" title="确定删除此图片?" 
      confirm-button-color="#218FFF" show-cancel-button
      @confirm="sureDeleteEvent"
      >
    </van-dialog>
    <!-- 修复图片删除 -->
    <van-dialog v-model="deleteRepairInfoDialogShow" title="确定删除此图片?" 
      confirm-button-color="#218FFF" show-cancel-button
      @confirm="sureRepairDeleteEvent"
      >
    </van-dialog>
    <transition name="van-slide-up">
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <van-icon name="photo" />
          <input name="uploadImg1" ref="inputFile" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>从图库中选择
        </div>
        <div class="photo-graph">
          <van-icon name="photograph" />
          <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera" capture="camera"/>拍照
        </div>
        <div class="photo-cancel" @click="photoCancel">取消</div>
      </div>
    </transition> 
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {getAliyunSign} from '@/api/login.js'
import { getTransporter, querySpace, queryDepartment, queryRepairsTaskTool, queryStructure, queryRepairsTaskMaterial, getRepairsTaskType} from '@/api/taskScheduling.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { setStore,removeAllLocalStorage } from '@/common/js/utils'
import SelectSearch from "@/components/SelectSearch";
import axios from 'axios'
import { compress, base64ImgtoFile } from '@/common/js/utils'
export default {
  name: "AutoRepairCreate",
  components: {
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      currentRoomIndex: null,
      deleteInfoPng: require('@/common/images/home/delete-info.png'),
      currentConstructionIndex: null,
      currentDepartmentIndex: null,
      currentTierIndex: null,
      isIssuePhoto: false,
      isRepairPhoto: false,
      loadingShow: false,
      roomDialogShow: false,
      participationPersonDialogShow: false,
      departmentDialogShow: false,
      deleteInfoDialogShow: false,
      deleteRepairInfoDialogShow: false,
      quitInfoShow: false,
      imgIndex: '',
      currentTaskType: {},
      currentConstruction: {
        text: '',
        value: ''
      },
      currentDepartment: {
        text: '',
        value: ''
      },
      currentRoom: {
        text: '',
        value: ''
      },
      curretnParticipant: [],
      taskTypeOption: [],
      imgOnlinePathArr: [],
      imgDeleteUrlArr: [],
      existOnlineImgPath: [],
      imgRepairOnlinePathArr: [],
      imgRepairDeleteUrlArr: [],
      existOnlineImgRepairPath: [],
      imgDeleteUrl: '',
      loadingText: '加载中',
      issueDescribe: '',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      moveInfo: {
        startX: ''
      },
      constructionList: [],
      tierList: ['一层','二层','三层','四层'],
      departmentList: [],
      roomList: [],
      participationPersonList: [],
      useToolOption: [],
      problemPicturesList: [],
      repairPicturesList: [],
      currentImgUrl: '',
      taskTypeIndex: null,
      photoBox: false,
      imgBoxShow: false,
      overlayShow: false,
      totalPage: '',
      pageSize: 6,
      currentPage: 1,
      inventoryMsgList: [],
      echoInventoryMsgList: [],
      temporaryInventoryMsgList: [],
      consumableMsgList: [],
      materialShow: false,
      materialDeleteShow: false,
      deleteMaterialIndex: '',
      deleteMaterial: '',
      searchValue: ''
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/autoRepairList');
    this.parallelFunction()
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","createAutoRepairTaskMessage"]),
    proId () {
      return this.userInfo.extendData.proId
    }
  },

  methods: {
    ...mapMutations(["changeCreateAutoRepairTaskMessage"]),

    onClickLeft() {
      this.quitInfoShow = true;
      this.$router.push({ path: "/autoRepairList"})
    },

    onClickRight() {

    },

    // 回显暂存的创建自主报修任务信息
    echoTemporaryStorageMessage () {
      let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
      this.taskTypeIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'];
      this.currentTaskType = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentTaskType'];
      this.currentConstructionIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'];
      this.currentConstruction = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstruction'];
      this.currentDepartment = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartment'];
      this.currentDepartmentIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'];
      this.currentRoom = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoom'];
      this.currentRoomIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoomIndex'];
      this.problemPicturesList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['problemPicturesList'];
      this.issueDescribe = casuallyTemporaryStorageCreateAutoRepairTaskMessage['issueDescribe'];
      this.curretnParticipant = casuallyTemporaryStorageCreateAutoRepairTaskMessage['curretnParticipant'];
      this.repairPicturesList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['repairPicturesList'];
      this.consumableMsgList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['consumableMsgList']
    },

    // 关闭参与人弹窗事件
    closeParticipationPersonDialogEvent () {
      this.curretnParticipant = this.participationPersonList.filter((item) => { return item.checked == true })
    },

    // 处理维修任务空间信息
    disposeCheckType (item) {
      if (!item) { return };
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.name)
      };
      return temporaryArray.join('、')
    },

    // 处理维修任务参与者
    disposeTaskPresent (item) {
      if (!item) { return };
      if (item.length == 0) { return };
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.text)
      };
      return temporaryArray.join('、')
    },

    // 计算已经历时间
    elapsedTime (planStartTme) {
      let currentTime = new Date().getTime();
      let transferPlanStartTme = new Date(planStartTme).getTime();
      if (transferPlanStartTme > currentTime) {
        return ''
      } else {
        return `${this.$moment(currentTime).diff(transferPlanStartTme, 'minutes')}分钟`
      }
    },

    // 任务类型点击事件
    taskTypeClickEvent (index,item) {
      this.taskTypeIndex = index;
      this.currentTaskType = item;
      this.taskTypeOption[index]['selected'] = !this.taskTypeOption[index]['selected']
    },

    // 楼栋名称点击事件
    constructionItemClickEvent (item,index) {
      this.currentConstruction['text'] = item['text'];
      this.currentConstruction['value'] = item['value'];
      this.currentConstructionIndex = index;
      // 根据楼栋建筑查询科室
      this.getDepartmentByStructureId(this.currentConstruction['value'],false)
    },

    // 楼层点击事件
    tierItemClickEvent (item,index) {
      this.currentTierIndex = index
    },

    // 房间名称点击事件
    roomItemClickEvent (item,index) {
      this.currentRoomIndex = index;
      this.currentRoom['text'] = item['text'];
      this.currentRoom['value'] = item['value']
    },

    // 科室名称点击事件
    departmentItemClickEvent (item,index) {
      this.currentDepartmentIndex = index;
      this.currentDepartment['text'] = item['text'];
      this.currentDepartment['value'] = item['value'];
      // 根据科室查询房间信息
      this.getSpacesByDepartmentId(this.currentDepartment['value'],true)
    },

    // 目的房间点击事件
    goalRoomClickEvent () {
      // 根据科室查询房间信息
      if (!this.currentDepartment['value'] && this.currentDepartment['value'] !== 0) { 
        this.$toast('请选择目的科室');
        return 
      };
      this.roomDialogShow = true
    },

    // 目的科室点击事件
    goalDepartmentClickEvent () {
      this.departmentDialogShow = true
    },

    // 参与人点击事件
    participationPersonClickEvent () {
      this.participationPersonDialogShow = true
    },

    // 获取阿里云签名接口
    getSign (filePath = '',text) {
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
              this.uploadImageToOss(filePath,text)
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
    uploadImageToOss (filePath,text) {
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
          if (text == "issue") {
            this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
          } else if (text == "repair") {
            this.imgRepairOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
          };
          resolve()
        })
        .catch((err) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.loadingText = '';
          this.$toast({
            message: `${err}`,
            type: 'fail'
          });
          reject()
        })
      })
    },

    // 确定退出(暂存)
    quitSure () {
      this.temporaryStorageEvent()
    },

    // 取消退出(不暂存)
    quitCancel () {
      this.$router.push({path: '/autoRepairList'})
    },

    // 并行查询任务类型、目的建筑、维修员、物料信息、维修工具
    parallelFunction (type) {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.overlayShow = true;
        Promise.all([this.getTaskType(), this.getStructure(), this.queryTransporter(), this.getRepairsTaskMaterial(), this.getRepairsTaskTool()])
        .then((res) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          if (res && res.length > 0) {
            this.constructionList = [];
            this.participationPersonList = [];
            this.taskTypeOption = [];
            this.useToolOption = [];
            let [item1,item2,item3,item4,item5] = res;
            if (item1) {
              // 任务类型
              for (let i = 0, len = item1.length; i < len; i++) {
                this.taskTypeOption.push({
                  text: item1[i].typeName,
                  value: item1[i].id,
                  id: i,
                  selected: false
                })
              };
              if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
                if (this.createAutoRepairTaskMessage['currentTaskType']['value'] || this.createAutoRepairTaskMessage['currentTaskType']['value'] === 0) {
                  let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
                  let TemporaryIndex = this.taskTypeOption.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentTaskType']['value']});
                  casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'] = TemporaryIndex;
                  this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
                }
              }  
            };
            if (item2) {
              // 目的建筑
              for (let i = 0, len = item2.length; i < len; i++) {
                this.constructionList.push({
                  text: item2[i].structName,
                  value: item2[i].id,
                  id: i
                })
              };
              if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
                if (this.createAutoRepairTaskMessage['currentConstruction']['value'] || this.createAutoRepairTaskMessage['currentConstruction']['value'] === 0) {
                  let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
                  let TemporaryIndex = this.constructionList.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentConstruction']['value']});
                  casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'] = TemporaryIndex;
                  this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
                  this.getDepartmentByStructureId(this.createAutoRepairTaskMessage['currentConstruction']['value'],true)
                }
              }
            };
            if (item3) {
              // 参与人
              for (let i = 0, len = item3.length; i < len; i++) {
                this.participationPersonList.push({
                  text: item3[i].workerName,
                  value: item3[i]['id'],
                  checked: false
                })
              }
            };
            // 物料信息
            if (item4) {
              this.inventoryMsgList = [];
              this.temporaryInventoryMsgList = [];
              this.echoInventoryMsgList = [];
              if (item4.length > 0) {
                for (let item of item4) {
                  item['checked'] = false
                };
                this.inventoryMsgList = item4;
                this.temporaryInventoryMsgList = item4;
                this.echoInventoryMsgList = item4;
                this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
                // 默认展示第一页的物料信息
                this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
                this.storeId = this.inventoryMsgList[0]['storeId'];
                this.systemId = this.inventoryMsgList[0]['systemId']
              }  
            };
            // 维修工具
            if (item5) {
              for (let i = 0, len = item5.length; i < len; i++) {
                this.useToolOption.push({
                  text: item5[i].toolName,
                  value: item5[i].id,
                  selected: false
                })
              }
            };
            //判断是否回显暂存的数据
            if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
              this.echoTemporaryStorageMessage()
            }
          }
        })
        .catch((err) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {})
        })
      },

      // 根据建筑查询科室信息
      getDepartmentByStructureId (structureId,isInitial) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.departmentList = [];
      this.currentDepartment = {};
      this.currentDepartmentIndex = null;
      this.roomList = [];
      this.currentRoom = {};
      this.currentRoomIndex = null;
      queryDepartment(this.proId,structureId)
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.departmentList.push({
                text: res.data.data[i].departmentName,
                value: res.data.data[i].id,
                id: i
              })
            };
            if (isInitial) {
              // 根据科室查询房间信息
              if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
                if (this.createAutoRepairTaskMessage['currentDepartment']['value'] || this.createAutoRepairTaskMessage['currentDepartment']['value'] === 0) {
                  let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
                  let TemporaryIndex = this.departmentList.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentDepartment']['value']});
                  casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'] = TemporaryIndex;
                  this.currentDepartmentIndex = TemporaryIndex;
                  this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
                  this.getSpacesByDepartmentId(this.createAutoRepairTaskMessage['currentDepartment']['value'],false)
                }
              }  
            }  
          }
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {})
      })
    },

    // 根据科室查询房间信息
    getSpacesByDepartmentId (depId,flag) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.roomList = [];
      if (flag) {
        this.currentRoom = {};
        this.currentRoomIndex = null;
      };
      querySpace(this.proId,depId)
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.roomList.push({
                text: res.data.data[i].spaceName,
                value: res.data.data[i].id,
                selected: false
              })
            };
            if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}' && !flag) {
              if (this.createAutoRepairTaskMessage['currentRoom']['value'] || this.createAutoRepairTaskMessage['currentRoom']['value'] === 0) {
                let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
                let TemporaryIndex = this.roomList.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentRoom']['value']});
                casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoomIndex'] = TemporaryIndex;
                this.currentDepartmentIndex = TemporaryIndex;
                this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage)
              }
            }  
          }
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {})
      })
    },

    // 查询维修工具
    getRepairsTaskTool () {
      return new Promise((resolve,reject) => {
        queryRepairsTaskTool(this.proId).then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

      // 查询物料信息
      getRepairsTaskMaterial () {
        return new Promise((resolve,reject) => {
          queryRepairsTaskMaterial(this.proId).then((res) => {
            if (res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
        })
      },

      // 查询目的建筑
      getStructure () {
        return new Promise((resolve,reject) => {
          queryStructure(this.proId).then((res) => {
            if (res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
        })
      },

    // 查询维修员
    queryTransporter () {
      return new Promise((resolve,reject) => {
        getTransporter(this.proId, this.workerId)
        .then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

    // 查询任务类型
    getTaskType () {
      return new Promise((resolve,reject) => {
        getRepairsTaskType(this.proId, this.workerId)
        .then((res) => {
          if (res && res.data.code == 200) {
            resolve(res.data.data)
          }
        })
        .catch((err) => {
          reject(err.message)
        })
      })
    },

    // 任务创建维修确认事件
    sureEvent () {
      this.$router.push({path: '/autoRepairTaskSignature'})
    },

    // 任务创建维修取消事件
    cancelEvent () {
      this.quitInfoShow = true
    },

    // 自主报修提交事件
    async sureEvent () {
      if (JSON.stringify(this.currentTaskType) == '{}') {
        this.$toast('任务类型不能为空');
        return
      };
      if (JSON.stringify(this.currentDepartment) == '{}') {
        this.$toast('目的科室不能为空');
        return
      };
      if (JSON.stringify(this.curretnParticipant) == '{}') {
        this.$toast('参与人不能为空');
        return
      };
      if (this.problemPicturesList.length == 0) {
        this.$toast('问题图片不能为空');
        return
      };
      if (this.repairPicturesList.length == 0) {
        this.$toast('修复图片不能为空');
        return
      };
      // 上传图片到阿里云服务器(问题图片)
      let temporaryProblemPicturesList = this.problemPicturesList.filter((item) => { return item.indexOf('https://') == -1});
      this.loadingText ='图片上传中...';
      this.overlayShow = true;
      this.loadingShow = true;
      for (let imgI of temporaryProblemPicturesList) {
          if (Object.keys(this.timeMessage).length > 0) {
          // 判断签名信息是否过期
          if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
              await this.getSign('repair');
              await this.uploadImageToOss(imgI,'issue')
          } else {
              await this.uploadImageToOss(imgI,'issue')
          }
          } else {
          await this.getSign('repair');
          await this.uploadImageToOss(imgI,'issue')
          }
      };
      // 上传图片到阿里云服务器(修复图片)
      let temporaryRepairPicturesList = this.repairPicturesList.filter((item) => { return item.indexOf('https://') == -1});
      this.loadingText ='图片上传中...';
      this.overlayShow = true;
      this.loadingShow = true;
      for (let imgI of temporaryRepairPicturesList) {
          if (Object.keys(this.timeMessage).length > 0) {
          // 判断签名信息是否过期
          if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
              await this.getSign('repair');
              await this.uploadImageToOss(imgI,'repair')
          } else {
              await this.uploadImageToOss(imgI,'repair')
          }
          } else {
          await this.getSign('repair');
          await this.uploadImageToOss(imgI,'repair')
          }
      };
      // 新增自主报修
      let temporaryMessage = {
        eventType: this.abnormalTypeOption.filter((item) => { return item.text == this.currentAbnormalType })[0]['value'],
        registerSeverity: this.severityLevelOption.filter((item) => { return item.text == this.currentSeverityLevel })[0]['id'],
        registerState: this.equipmentStatusOption.filter((item) => { return item.text == this.currentEquipmentStatus })[0]['id'],
        checkResultId: this.patrolTaskAbnormalCheckItemEventList.resultId,
        depId: this.patrolTaskDeviceChecklist.deviceId,
        depName: this.patrolTaskDeviceChecklist.deviceName,
        findTime: this.getNowFormatDate(this.currentFindTime),
        description: this.problemOverview,
        remark: this.taskDescribe,
        extendData: {
          colName: this.patrolTaskDeviceChecklist.configName,
          deviceId: this.patrolTaskDeviceChecklist.deviceId,
          deviceName: this.patrolTaskDeviceChecklist.deviceName,
          checkItemId: this.patrolTaskAbnormalCheckItemEventList.itemId,
          checkTypeId: this.patrolTaskAbnormalCheckItemEventList.typeId,
          deviceNorms: this.patrolTaskDeviceChecklist.norms,
          checkItemName: this.patrolTaskAbnormalCheckItemEventList.itemName,
          checkTypeName: this.patrolTaskAbnormalCheckItemEventList.typeName
        },
        images: this.imgOnlinePathArr.concat(this.problemPicturesList.filter((item) => { return item.indexOf('https://') != -1})),
        collect: this.devicePatrolDetailsSelectMessage.selectTaskSetId,
        proId: this.userInfo.proIds[0],
        system: 9,
        createName: this.userInfo.name,
        taskNumber: this.patrolTaskAbnormalCheckItemEventList.taskNumber
      };
      this.postGenerateRepairsTask(temporaryMessage)
    },

    // 新增自主报修
    postGenerateRepairsTask (data) {
      this.loadingText = '登记中...';
      this.loadingShow = true;
      this.overlayShow = true;
      saveDeviceAbnormalRecord(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$router.push({path: '/autoRepairTaskSignature'});
          this.$Alert({message:"新增成功",duration:3000,type:'success'});
        } else {
          // 防止任务生成失败后，再次生成时造成同一图片重复上传
          this.imgOnlinePathArr = [];
          this.imgRepairOnlinePathArr = [];
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        };
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false
      })
      .catch((err) => {
        this.imgOnlinePathArr = [];
        this.imgRepairOnlinePathArr = [];
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false
      })
    },

    // 问题图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 问题图片拍照点击
    issueClickEvent () {
      this.isIssuePhoto = true;
      this.isRepairPhoto = false;
      if (this.problemPicturesList.length >= 5) {
        this.$toast('至多只能上传5张图片!');
        return
      };
      this.photoBox = true;
      this.overlayShow = true
    },

    // 图片确定删除提示框确定事件(问题图片)
    sureDeleteEvent () {
      this.imgDeleteUrlArr.push(this.imgDeleteUrl);
      this.problemPicturesList.splice(this.imgIndex, 1);
      for (let item of this.imgDeleteUrlArr) {
        let temporaryIndex = this.existOnlineImgPath.indexOf(item);
        if (temporaryIndex > -1) {
          this.existOnlineImgPath.splice(this.existOnlineImgPath.indexOf(item),1)
        }
      }
    },

    // 图片确定删除提示框确定事件(修复图片)
    sureRepairDeleteEvent () {
      this.imgRepairDeleteUrlArr.push(this.imgDeleteUrl);
      this.repairPicturesList.splice(this.imgIndex, 1);
      for (let item of this.imgRepairDeleteUrlArr) {
        let temporaryIndex = this.existOnlineImgRepairPath.indexOf(item);
        if (temporaryIndex > -1) {
          this.existOnlineImgPath.splice(this.existOnlineImgRepairPath.indexOf(item),1)
        }
      }
    },

    // 问题拍照照片删除
    issueDelete (index,item) {
      this.deleteInfoDialogShow = true;
      this.imgIndex = index;
      this.imgDeleteUrl = item
    },

    // 修复图片放大事件
    enlareRepairEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 修复图片拍照点击
    repairClickEvent () {
      this.isIssuePhoto = false;
      this.isRepairPhoto = true;
      if (this.repairPicturesList.length >= 5) {
        this.$toast('至多只能上传5张图片!');
        return
      };
      this.photoBox = true;
      this.overlayShow = true
    },

    // 修复拍照照片删除
    repairDelete (index,item) {
      this.deleteRepairInfoDialogShow = true;
      this.imgIndex = index;
      this.imgDeleteUrl = item
    },

    // 图片上传预览
    previewFileOne() {
      let file = document.getElementById("demo1").files[0];
      this.temporaryFile = file;
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size/1024/1024 < 16;
      if (!isLt2M) {
        this.$dialog.alert({
          message: '上传图片大小不能超过16MB!',
          closeOnPopstate: true
        }).then(() => {
        });
        _this.$refs.inputFile.value = null;
        _this.photoBox = false;
        _this.overlayShow = false;
        return
      };  
      reader.addEventListener("load", function () {
        // 压缩图片
        let result = reader.result;
        let img = new Image();
        img.src = result;
        img.onload = function () {
          let src = compress(img);
          if (_this.isIssuePhoto) {
            _this.problemPicturesList.push(src)
          } else if (_this.isRepairPhoto) {
            _this.repairPicturesList.push(src)
          };
          _this.photoBox = false;
          _this.overlayShow = false
        };
        _this.$refs.inputFile.value = null;
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
        // 压缩图片
        let result = reader.result;
        let img = new Image();
        img.src = result;
        img.onload = function () {
          let src = compress(img);
          if (_this.isIssuePhoto) {
            _this.problemPicturesList.push(src)
          } else if (_this.isRepairPhoto) {
            _this.repairPicturesList.push(src)
          };
          _this.photoBox = false;
          _this.overlayShow = false
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

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 优先级转换
    taskPriotityTransition (state) {
      switch(state) {
        case 1 :
          return '正常'
          break;
        case 2 :
          return '紧急'
          break;
        case 3 :
          return '重要'
          break;
        case 4 :
          return '紧急重要'
          break
      }
    },

    // 任务状态转换
    taskStatusTransition (state) {
      switch(state) {
        case 0 :
          return '未分配'
          break;
        case 1 :
          return '未查阅'
          break;
        case 2 :
          return '未开始'
          break;
        case 3 :
          return '进行中'
          break;
        case 4 :
          return '待签字'
          break
      }
    },

    // 搜索物料事件
    searchEvent () {
      if (this.searchValue == '') {
        this.temporaryInventoryMsgList = this.echoInventoryMsgList;
        this.inventoryMsgList = this.echoInventoryMsgList;
        this.currentPage = 1;
        this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
        // 根据页码分割展示对应的数据
        this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
        return
      };
      this.inventoryMsgList = this.echoInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1});
      this.temporaryInventoryMsgList = this.inventoryMsgList;
      this.currentPage = 1;
      this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
      this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
    },

    // 删除物料弹框确定事件
    materialDeleteSure () {
      this.consumableMsgList.splice(this.deleteMaterialIndex,1)
    },

    // 删除物料弹框取消事件
    materialDeleteCancel () {
      
    },

    // 删除物料事件
    deleteEvent(item,index) {
      this.materialDeleteShow = true;
      this.deleteMaterial = `${item.mateName}-${item.model}`;
      this.deleteMaterialIndex = index
    },

    // 物料数量变化事件
    stepperEvent (value,detail,item,index) {
      if (item.number > item.quantity) {
        this.$nextTick(() => {
          this.$set(this.consumableMsgList[index],'number',item.quantity)
        });
        this.$toast('已超出库存数量')
      }
    },

    // 点击物料加事件
    stepperPlusEvent(item,index) {
      if (item.number  >= item.quantity) {
        this.$nextTick(() => {
          this.$set(this.consumableMsgList[index],'number',item.quantity)
        });
        this.$toast('已超出库存数量')
      }
    },

    // 耗材名称点击事件
    mateNameEvent (name,index) {
      this.inventoryMsgList[index]['checked'] = !this.inventoryMsgList[index]['checked'];
    },

    // 添加物料确认
    materialSure () {
      let count = this.echoInventoryMsgList.some((item)=> {return item.checked == true && !item.disabled});
      if (!count) {
        this.$toast('至少要选择一种耗材')
      } else {
        this.materialShow = false;
        this.materialContentShow = true;
        let checkConsumableList = this.echoInventoryMsgList.filter((item) => {return item.checked == true && !item.disabled });
        for (let item of checkConsumableList) {
          this.consumableMsgList.push({
            number: 0,
            mateName: item.mateName,
            mateNumber: item.mateNumber,
            unit: item.unit,
            mateId: item.id,
            quantity: item.quantity,
            model: item.model,
            storeId: this.storeId,
            systemId: this.systemId
          })
        }
      }
    },

    // 添加物料取消
    materialCancel () {
      this.currentPage = 1
    },


    // 打开耗材弹框事件
    materialShowEvent () {
      this.materialShow = true;
      this.searchValue = '';
      for (let item of this.echoInventoryMsgList) {
        // 添加过的物料不允许再次添加
        let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
        if (isExist.length > 0) {
          item['disabled'] = true;
          item['checked'] = true
        } else {
          item['disabled'] = false
          item['checked'] = false
        }
      };
      // 打开物料弹框就显示全部物料信息
      this.temporaryInventoryMsgList = this.echoInventoryMsgList;
      this.totalPage = Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
      this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize)
    },

    // 关闭耗材弹框
    closeScreenDialogEvent () {
      this.materialShow = false;
      this.currentPage = 1
    },

    // 物料分页点击事件
    pageClickEvent (text) {
      if (this.totalPage == 0) { return };
      if (text == 'previous') {
        if ( this.currentPage == 1) { return };
        this.currentPage--;
      } else if (text == 'next') {
        if ( this.currentPage == this.totalPage ) { return }
        this.currentPage++
      };
      // 根据页码分割展示对应的数据
      this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
    },

    // 暂存事件
    temporaryStorageEvent () {
      try {
        let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'] = this.taskTypeIndex;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentTaskType'] = this.currentTaskType;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'] = this.currentConstructionIndex;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstruction'] = this.currentConstruction;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartment'] = this.currentDepartment;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'] = this.currentDepartmentIndex;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoom'] = this.currentRoom;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoomIndex'] = this.currentRoomIndex;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['problemPicturesList'] = this.problemPicturesList;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['issueDescribe'] = this.issueDescribe;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['curretnParticipant'] = this.curretnParticipant;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['repairPicturesList'] = this.repairPicturesList;
        casuallyTemporaryStorageCreateAutoRepairTaskMessage['consumableMsgList'] = this.consumableMsgList;
        console.log('暂存信息',casuallyTemporaryStorageCreateAutoRepairTaskMessage,this.currentConstruction);
        this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
        this.$Alert({message:"暂存成功",duration:3000,type:'success'});
        this.$router.push({path: '/autoRepairList'})
      } catch (err) {
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {
        })
      }  
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  .choose-department {
    /deep/ .van-popup {
      padding: 40px 0 10px 0;
      box-sizing: border-box;
      .department-content-box {
        height: 100%;
        display: flex;
        >div {
          flex: 1;
          height: 100%;
          overflow: auto;
          font-size: 14px;
        };
        .left-wrapper {
          .left {
            display: flex;
            flex-direction: column;
            justify-content: center;
            .construction-list {
              width: 100%;
              flex-shrink: 0;
              .no-wrap();
              padding-left: 10px;
              box-sizing: border-box;
              height: 40px;
              line-height: 40px
            };
            .constructionListStyle {
              color: #3B9DF9 !important;
              background-color: rgba(0, 0, 0, 0.05) !important; 
            }
          }
        };
        .center-wrapper {  
          .center {
            display: flex;
            flex-direction: column;
            .tier-list {
              padding-left: 10px;
              .no-wrap();
              flex-shrink: 0;
              box-sizing: border-box;
              height: 40px;
              line-height: 40px
            };
            .tierListStyle {
              color: #3B9DF9 !important;
              background-color: rgba(0, 0, 0, 0.05) !important; 
            }
          }
        };
        .right-wrapper {  
          .right {
            display: flex;
            flex-direction: column;
            .department-list {
              padding-left: 10px;
              flex-shrink: 0;
              .no-wrap();
              box-sizing: border-box;
              height: 40px;
              line-height: 40px
            };
            .departmentListStyle {
              color: #3B9DF9 !important;
              background-color: rgba(0, 0, 0, 0.05) !important; 
            }
          }
        }  
      };
      .van-icon {
        top: 10px !important;
        color: #101010 !important
      }
    }  
  };
  .choose-room {
    /deep/ .van-popup {
      padding: 40px 0 10px 0;
      box-sizing: border-box;
      .room-content-box {
        height: 100%;
        overflow: auto;
        .room-content {
          padding-left: 10px;
          box-sizing: border-box;
          font-size: 14px;
          color: #101010;
          height: 40px;
          line-height: 40px
        };
        .roomContentStyle {
          background-color: rgba(0, 0, 0, 0.05); 
        }
      };
      .van-icon {
        top: 10px !important;
        color: #101010 !important
      }
    }
  };
  .participation-person {
    /deep/ .van-popup {
      padding: 40px 20px 10px 20px;
      box-sizing: border-box;
      .participation-person-box {
        height: 100%;
        overflow: auto;
        .participation-person-content {
          box-sizing: border-box;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #101010;
          height: 40px;
          line-height: 40px;
          .participation-person-content-left {
            flex: 1;
            text-align: center;
            padding-right: 8px;
            box-sizing: border-box;
            .no-wrap()
          };
          .participation-person-content-right {
            width: 30px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center
          }
        }
      }
    }
  };
  .quit-info-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 20px 0 20px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .delete-icon {
            text-align: right
          };
          .dialog-title {
            padding: 10px 0;
            box-sizing: border-box;
            color: #101010;
            font-size: 16px;
          };
          .dialog-center {
            line-height: 20px;
            padding: 20px 0;
            box-sizing: border-box;
            color: #101010;
            font-size: 12px
          }
        };
        .van-dialog__footer {
          padding: 10px 40px 20px 40px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
          height: 40px;
          color: #3B9DF9 !important;
          border: 1px solid #3B9DF9;
          border-radius: 8px;
          margin-right: 20px
        };
        .van-dialog__confirm {
           height: 40px;
            color: #fff;
            background: #3B9DF9;
            border-radius: 8px
        }
        };
        .van-hairline--top::after {
          border-top-width: 0 !important
        }
    }
  };
  .choose-photo-box {
    position: fixed;
    margin: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 200000;
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
  };
  .img-dislog-box {
    .van-dialog {
        .van-dialog__content {
            >img {
                width: 100%
            }
        }
    }
  };
  .material-box {
      /deep/ .van-dialog {
        top: auto !important;
        left: 0 !important;
        border-right: 1px solid #fff;
        bottom: 0 !important;
        border-top-left-radius: 20px !important;
        border-top-right-radius: 20px !important;
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        transform: translate3d(0,0,0) !important;
        .van-dialog__content {
            padding: 0 20px 0 20px !important;
            box-sizing: border-box;
            height: 60vh;
            display: flex;
            flex-direction: column;
            .dialog-top {
              height: 60px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              .select-title {
                font-size: 18px;
                color: #101010;
                text-align: center
              };
              .van-icon {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 0
              }
            };
            .tool-name-list {
              flex: 1;
              display: flex;
              height: 0;
              display: flex;
              position: relative;
              flex-direction: column;
              .tool-name-list-title-innner {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 52px;
                .search-input {
                  flex: 1;
                  padding: 10px;
                  position: relative;
                  .van-cell {
                    padding: 4px 4px 4px 30px;
                    background: #F7F7F9;
                    box-sizing: border;
                    border-radius: 10px;
                  };
                  .icon-span {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    display: inline-block;
                    left: 16px;
                    .van-icon {
                      font-size: 23px
                    }
                  }
                };
                .search-btn {
                  font-size: 14px;
                  color: #3B9DF9;
                  margin-left: 6px;
                }
              };
              .tool-name-list-content {
                width: 100%;
                position: relative;
                flex: 1;
                padding: 20px 6px 10px 6px;
                display: flex;
                flex-direction: column;
                height: 0;
                box-sizing: border-box;
                border-top: 1px solid #b2b2b2;
                .static-row {
                  &::-webkit-scrollbar {
                    height: 0;
                    display: none
                  };
                  width: 90%;
                  height: 100%;
                  overflow-x: auto;
                  white-space: nowrap;
                  .circulation-area-content-box {
                    flex: 1;
                    .circulation-area-content {
                      padding: 10px 0;
                      box-sizing: border-box;
                      font-size: 0;
                      background: #fff;
                      > span {
                        line-height: 20px;
                        font-size: 15px;
                        display: inline-block;
                        .no-wrap();
                        &:first-child {
                          width: 50%;
                        };
                        &:nth-child(2) {
                          width: 20%;
                          text-align: center
                        };
                        &:nth-child(3) {
                          width: 25%;
                          text-align: center
                        };
                        &:nth-child(4) {
                          width: 30%;
                          text-align: center
                        }
                      }
                    }
                  };  
                  .circulation-area-title-box {
                    font-size: 0;
                    span {
                      height: 40px;
                      line-height: 40px;
                      display: inline-block;
                      width: 20%;
                      font-size: 16px;
                      font-weight: bold;
                      &:first-child {
                        width: 50%;
                        text-align: center
                      };
                      &:nth-child(2) {
                        width: 20%;
                        text-align: center;
                      };
                      &:nth-child(3) {
                        width: 25%;
                        text-align: center;
                      };
                      &:nth-child(4) {
                        width: 30%;
                        text-align: center;
                      }
                    }
                  }
                };
                .absolute-row {
                  height: 90%;
                  width: 10%;
                  z-index: 100;
                  position: absolute;
                  top: 20px;
                  display: flex;
                  flex-direction: column;
                  right: 0;
                  background: #fff;
                  .absolute-title {
                    line-height: 20px;
                    width: 100%;
                    font-size: 0;
                    padding: 10px 0;
                    box-sizing: border-box;
                  };
                  .absolute-operate {
                    width: 100%;
                    flex: 1;
                    overflow-y: auto;
                    p {
                      padding: 10px 0;
                      box-sizing: border-box;
                      >span {
                        line-height: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        .van-checkbox {
                          .van-checkbox__icon {
                            .van-icon {
                              border-radius: 4px
                            }
                          }
                        }
                      }
                    }  
                  }
                };
                .shadow-box {
                  position: absolute;
                  background: #fff;
                  right: 0;
                  width: 10%;
                  height: 90%;
                  box-shadow: -3px 0 3px 0 #dddddd;
                }  
              };
              .page-area {
                height: 40px;
                width: 70%;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .page-left {
                  font-size: 14px;
                  padding: 4px 6px;
                  border-radius: 2px;
                  box-sizing: border-box;
                  border: 1px solid #d0d0d0

                };
                .page-center {
                  >span {
                    font-size: 12px;
                    color: #333;
                    &:nth-child(1) {
                      color: #3B9DF9
                    }
                  }
                };
                .page-right {
                  font-size: 14px;
                  border-radius: 2px;
                  padding: 4px 6px;
                  box-sizing: border-box;
                  border: 1px solid #d0d0d0
                };
                .pageSpanStyle {
                  color: #d0d0d0 !important
                }
              }
            }
        };
        .van-dialog__footer {
          padding: 10px 20px 20px 20px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            color: #1864FF;
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            background: #fff;
            border-radius: 30px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            color: #fff !important;
            border-radius: 30px;
        }
        };
        .van-hairline--top::after {
          border-top-width: 0 !important
        }
      }
  };
  .material-delete-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 20px 0 20px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .dialog-top {
            text-align: center
          };
          .dialog-center {
            text-align: center;
            line-height: 20px;
            padding: 20px 0;
            box-sizing: border-box;
            font-weight: bold;
            color: #101010;
            font-size: 16px
          }
        };
        .van-dialog__footer {
          padding: 10px 40px 20px 40px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            height: 40px;
            color: #3B9DF9;
            border: 1px solid #3B9DF9;
            border-radius: 8px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            height: 40px;
            background: #3B9DF9;
            color: #fff !important;
            border-radius: 8px;
        }
        };
        .van-hairline--top::after {
          border-top-width: 0 !important
        }
    }
  };
  .nav {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 10;
    left: 0;
    /deep/ .van-nav-bar {
        background: transparent;
        .van-nav-bar__left {
            .van-nav-bar__text {
                color: #fff !important;
                margin-left: 8px !important;
            }
        };
        .van-nav-bar__right {
            .van-nav-bar__text {
                font-weight: bold !important
            }
        }
        .van-icon {
            color: #fff !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
            color: #fff !important;
            font-size: 16px !important;
        }
    }
  };
  /deep/ .van-loading {
    z-index: 1000000
  };  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 0;
    .content-top-area {
      width: 100%;
      margin: 0 auto;
      height: 189px;
      position: absolute;
      top: 0;
      left: 0;
      > img {
        width: 100%;
        height: 100%
      }
    };
    .content-box {
        flex: 1;
        padding-bottom: 80px;
        box-sizing: border-box;
        margin-top: 50px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        position: relative;
        overflow: auto;
        background: #f7f7f7;
        z-index: 10;
        .problem-description-box {
            .problem-description-tit {
                font-size: 14px;
                font-weight: bold;
                color: #101010;
                height: 35px;
                line-height: 35px;
                padding-left: 10px;
                box-sizing: border-box; 
            };
            .problem-description-content {
              .task-type {
                padding: 0 10px 4px 10px;
                box-sizing: border-box;
                background: #fff;
                .problem-description-content-top {
                  height: 40px;
                  line-height: 40px;
                  >span {
                    &:first-child {
                      color: red
                    };
                    &:last-child {
                      font-size: 14px;
                      color: #9E9E9A
                    }
                  }
                };
                .problem-description-content-bottom {
                  display: flex;
                  align-items: center;
                  flex-wrap: wrap;
                  >span {
                    font-size: 14px;
                    color: #101010;
                    border-radius: 7px;
                    background-color: rgba(0, 0, 0, 0.05);
                    text-align: center;
                    padding: 10px 20px;
                    box-sizing: border-box;
                    margin-right: 20px;
                    margin-bottom: 10px
                  };
                  .taskTypeStyle {
                    background: #41a4ff !important;
                    color: #fff !important
                  }
                }
              };
              .goal-department {
                height: 40px;
                background: #fff;
                padding: 0 10px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                .goal-department-left {
                  >span {
                    &:first-child {
                      color: red
                    };
                    &:last-child {
                      color: #9E9E9A;
                      font-size: 14px
                    }
                  }
                };
                .goal-department-right {
                  flex: 1;
                  display: flex;
                  width: 0;
                  align-items: center;
                  padding-left: 6px;
                  box-sizing: border-box;
                   >span {
                    &:first-child {
                      flex: 1;
                      color: #101010;
                      font-size: 14px;
                      text-align: right;
                      .no-wrap()
                    };
                    &:last-child {
                      font-size: 14px
                    }
                  }
                }
              };
              .goal-room {
                 .goal-department-left {
                  >span {
                    &:first-child {
                      margin-left: 10px;
                      color: #9E9E9A !important;
                      font-size: 14px
                    }
                  }
                }
              };
              .list-line-image {
                display: flex;
                flex-direction: column;
                background: #fff;
                margin-top: 10px;
                padding-bottom: 10px;
                box-sizing: border-box;
                >div {
                  &:first-child {
                    font-size: 14px;
                    color: #9E9E9A; 
                    height: 40px;
                    line-height: 40px;
                    padding-left: 14px;
                    box-sizing: border-box;
                    >span {
                      &:first-child {
                        color: red !important
                      }
                    }
                  }
                };
                .image-list {
                  width: 100%;
                  flex-wrap: wrap;
                  display: flex;
                  padding: 0 10px;
                  box-sizing: border-box;
                  >div {
                      width: 23.5%;
                      height: 70px;
                      vertical-align: top;
                      margin-right: 2%;
                      margin-top: 2%;
                      position: relative;
                      &:nth-child(1) {
                          margin-top: 0;
                      };
                      &:nth-child(2) {
                          margin-top: 0;
                      };
                      &:nth-child(3) {
                          margin-top: 0;
                      };
                      &:nth-child(4) {
                          margin-top: 0;
                      };
                      &:nth-child(4n+4) {
                          margin-right: 0;
                      };
                      .icon-box {
                          position: absolute;
                          top: 2px;
                          right: 2px;
                          /deep/ .van-icon {
                            font-weight: bold;
                          }  
                      };
                      img {
                          width: 100%;
                          height: 100%
                      };
                      &:last-child {
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          background: #f2f2f2;
                          /deep/ .van-icon{
                              position: relative;
                              top: 0;
                              right: 0;
                          }
                      }
                  }
                }
              };
              .issue-content {
                background: #fff;
                padding: 14px;
                margin-top: 10px;
                box-sizing: border-box;
                display: flex;
                justify-content: space-between;
                .issue-left {
                  font-size: 14px;
                  margin-left: 10px;
                  color: #9E9E9A
                };
                .issue-right {
                  padding-left: 10px;
                  box-sizing: border-box;
                  text-align: right;
                  font-size: 14px;
                  color: #101010;
                  flex: 1;
                  line-height: 18px;
                  /deep/ .van-cell {
                    background: #F9F9F9
                  }
                }
            }  
          }
        };
        .maintenance-record-box {
          .maintenance-record-tit {
            font-size: 14px;
            font-weight: bold;
            color: #101010;
            height: 35px;
            line-height: 35px;
            padding-left: 10px;
            box-sizing: border-box; 
          };
          .maintenance-record-content {
            .maintenance-man {
              height: 40px;
              background: #fff;
              padding: 0 10px;
              box-sizing: border-box;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 10px;
              .maintenance-man-left {
                >span {
                  &:first-child {
                    color: red
                  };
                  &:last-child {
                    color: #9E9E9A;
                    font-size: 14px
                  }
                }
              };
              .maintenance-man-right {
                flex: 1;
                display: flex;
                width: 0;
                align-items: center;
                padding-left: 6px;
                box-sizing: border-box;
                >span {
                  &:first-child {
                    flex: 1;
                    color: #101010;
                    font-size: 14px;
                    text-align: right;
                    .no-wrap()
                  }
                }
              }
            };
            .participation-man {
              height: 40px;
              background: #fff;
              padding: 0 10px;
              box-sizing: border-box;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 10px;
              .participation-man-left {
                padding-left: 10px;
                box-sizing: border;
                >span {
                  &:first-child {
                    color: #9E9E9A;
                    font-size: 14px
                  }
                }
              };
              .participation-man-right {
                flex: 1;
                display: flex;
                width: 0;
                align-items: center;
                padding-left: 6px;
                box-sizing: border-box;
                >span {
                  &:first-child {
                    flex: 1;
                    color: #101010;
                    font-size: 14px;
                    text-align: right;
                    .no-wrap()
                  };
                  &:last-child {
                    font-size: 14px
                  }
                }
              }
            };
            .list-line-image {
              display: flex;
              flex-direction: column;
              background: #fff;
              margin-top: 10px;
              padding-bottom: 10px;
              box-sizing: border-box;
              >div {
                &:first-child {
                  font-size: 14px;
                  color: #9E9E9A; 
                  height: 40px;
                  line-height: 40px;
                  padding-left: 14px;
                  box-sizing: border-box;
                  >span {
                    &:first-child {
                      color: red !important
                    }
                  }
                }
              };
              .image-list {
                width: 100%;
                flex-wrap: wrap;
                display: flex;
                padding: 0 10px;
                box-sizing: border-box;
                >div {
                    width: 23.5%;
                    height: 70px;
                    vertical-align: top;
                    margin-right: 2%;
                    margin-top: 2%;
                    position: relative;
                    &:nth-child(1) {
                        margin-top: 0;
                    };
                    &:nth-child(2) {
                        margin-top: 0;
                    };
                    &:nth-child(3) {
                        margin-top: 0;
                    };
                    &:nth-child(4) {
                        margin-top: 0;
                    };
                    &:nth-child(4n+4) {
                        margin-right: 0;
                    };
                    .icon-box {
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        /deep/ .van-icon {
                          font-weight: bold;
                        }  
                    };
                    img {
                        width: 100%;
                        height: 100%
                    };
                    &:last-child {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: #f2f2f2;
                        /deep/ .van-icon{
                            position: relative;
                            top: 0;
                            right: 0;
                        }
                    }
                  }
                }
            }
          }
        };
        .consumable-management-area {
            width: 100%;
            padding: 8px 10px;
            box-sizing: border-box;
            background: #fff;
            font-size: 14px;
            margin-top: 10px;
            .circulation-area {
             
            > p {
              height: 50px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              background: #F8F8F8;
              margin-bottom: 4px;
              &:last-child {
                margin-bottom:0
              };
              > span {
                height: 50px;
                line-height: 50px;
                font-size: 16px;
                display: inline-block;
                text-align: center;
                &:first-child {
                  width: 10%
                };
                &:nth-child(2) {
                  text-align: left;
                  flex: 1;
                  .no-wrap();
                  /deep/ .van-cell {
                    .van-cell__value--alone {
                      .van-field__control {
                        text-align: center
                      }
                    }
                  }
                };
                &:nth-child(3) {
                  margin-right: 4px;
                  /deep/ .van-stepper {
                    .van-stepper__minus {
                      color: #3B9DF9;
                      border-left: 1px solid #b5b5b5;
                      border-top: 1px solid #b5b5b5;
                      border-bottom: 1px solid #b5b5b5;
                      &:before {
                        height: 3px
                      }
                    };
                    .van-stepper__input {
                      border: 1px solid #b5b5b5;
                      width: 45px;
                      margin: 0 !important
                    };
                    .van-stepper__plus {
                      color: #3B9DF9;
                      border-right: 1px solid #b5b5b5;
                      border-top: 1px solid #b5b5b5;
                      border-bottom: 1px solid #b5b5b5;
                      &:before {
                        height: 3px
                      };
                      &:after {
                        width: 3px
                      }
                    }
                  }
                };
                &:last-child {
                  display: inline-block;
                  font-size: 22px;
                  color: @color-theme;
                  /deep/ .van-icon {
                    top: 2px
                  }
                }
              }
            }
          };
          .circulation-area-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            line-height: 30px;
            margin-bottom: 8px;
            >span {
              font-size: 14px;
              display: inline-block;
              &:first-child {
                color: #101010;
                font-weight: bold;
              };
              &:last-child {
                width: 55px;
                height: 23px;
                border-radius: 4px;
                text-align: center;
                line-height: 23px;
                background: #3B9DF9;
                color: #fff;
              }
            }
          }
        };
        .operation-box {
          width: 80%;
          height: 80px;
          display: flex;
          position: fixed;
          bottom: 0;
          left: 10%;
          align-items: center;
          justify-content: space-between;
          >span {
            width: 44%;
            display: inline-block;
            height: 45px;
            font-size: 18px;
            line-height: 45px;
            background: #fff;
            text-align: center;
            border-radius: 30px;
            &:nth-child(1) {
              color: #fff;
              background: linear-gradient(to right, #6cd2f8, #2390fe);
              box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            };
            &:nth-child(2) {
              color: #1864FF;
              box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            };
            &:last-child {
              color: #1864FF;
              box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1)
            }
          }
        }
    }
  }
}
</style>