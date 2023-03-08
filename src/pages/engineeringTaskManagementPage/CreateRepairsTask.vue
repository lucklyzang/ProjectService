<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <!-- 右侧菜单 -->
    <van-popup v-model="rightMenuShow" position="right" ref="vanPopup" :style="{ width: '60%', height: '100%' }">
        <div class="top-icon">
            <img :src="switchHiddenPng" alt="切换隐藏" @click="switchHiddenEvent">
        </div>
        <div class="center-content">
            <div class="function-list" :class="{'functionListStyle': functionListIndex == index}" v-for="(item, index) in taskList" :key="index" @click="taskRouterSkip(item.tit,index)">
                {{ item.tit }}
            </div>
        </div>
        <div class="signout-box" @click="signOutEvent">
            下班签退
        </div>
    </van-popup>
    <!-- 目的建筑 -->
    <div class="transport-rice-box" v-if="showStructure">
      <ScrollSelection :columns="structureOption" title="目的建筑" @sure="structureSureEvent" @cancel="structureCancelEvent" @close="structureCloseEvent" />
    </div>
    <!-- 目的科室 -->
    <div class="transport-rice-box" v-if="showGoalDepartment">
      <ScrollSelection :columns="goalDepartmentOption" title="目的科室" @sure="goalDepartmentSureEvent" @cancel="goalDepartmentCancelEvent" @close="goalDepartmentCloseEvent" :isShowSearch="true" />
    </div>
    <!-- 目的房间 -->
    <div class="transport-rice-box" v-if="showGoalSpaces">
      <BottomSelect :columns="goalSpacesOption" title="目的房间" :currentSelectData="currentGoalSpaces" @sure="goalSpacesSureEvent" @cancel="goalSpacesCancelEvent" @close="goalSpacesCloseEvent" />
    </div>
    <!-- 任务类型 -->
    <div class="transport-rice-box" v-if="showTaskType">
      <ScrollSelection :columns="taskTypeOption" title="任务类型" @sure="taskTypeSureEvent" @cancel="taskTypeCancelEvent" @close="taskTypeCloseEvent" />
    </div>
    <!-- 维修员 -->
    <div class="transport-rice-box" v-if="showTransporter">
      <ScrollSelection :columns="transporterOption" title="维修员" @sure="transporterSureEvent" @cancel="transporterCancelEvent" @close="transporterCloseEvent" />
    </div>
    <!-- 使用工具 -->
    <div class="transport-rice-box" v-if="showUseTool">
      <BottomSelect :columns="useToolOption" title="工具" :currentSelectData="currentUseTool"  @sure="useToolSureEvent" @cancel="useToolCancelEvent" @close="useToolCloseEvent" />
    </div>
     <!-- 参与人 -->
    <div class="transport-rice-box" v-if="showParticipant">
      <BottomSelect :columns="participantOption" title="参与人" :currentSelectData="currentParticipant" @sure="participantSureEvent" @cancel="participantCancelEvent" @close="participantCloseEvent" />
    </div>
    <div class="nav">
       <van-nav-bar
        title="创建维保任务"
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
            <img :src="switchShowPng" alt="切换显示" @click="onClickRight">
        </template>
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
      <div class="content-box">
        <div class="message-box">
          <div class="message-one">
            <div class="message-one-left">
              优先级
            </div>
            <div class="message-one-right">
              <van-radio-group v-model="priorityRadioValue" direction="horizontal">
                <van-radio name="1" checked-color="#289E8E">正常</van-radio>
                <van-radio name="2" checked-color="#E8CB51">紧急</van-radio>
                <van-radio name="3" checked-color="#F2A15F">重要</van-radio>
                <van-radio name="4" checked-color="#E86F50">紧急重要</van-radio>
              </van-radio-group>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>任务类型</span>
            </div>
            <div class="select-box-right" @click="showTaskType = true">
              <span>{{ currentTaskType }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>目的建筑</span>
            </div>
            <div class="select-box-right" @click="showStructure = true">
              <span>{{ currentStructure }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>目的科室</span>
            </div>
            <div class="select-box-right" @click="goalDepartmentClickEvent">
              <span>{{ currentGoalDepartment }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>目的房间</span>
            </div>
            <div class="select-box-right" @click="goalSpacesClickEvent">
              <span>{{ disposeTaskPresent(currentGoalSpaces) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="task-describe transport-type problem-overview">
            <div class="transport-type-left">
              <span>问题概述</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="problemOverview"
                rows="1"
                autosize
                type="textarea"
                placeholder="请输入问题简要概述"
              />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>维修员</span>
            </div>
            <div class="select-box-right" @click="showTransporter = true">
              <span>{{ currentTransporter }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>参与人</span>
            </div>
            <div class="select-box-right" @click="showParticipant = true">
              <span>{{ disposeTaskPresent(currentParticipant) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>使用工具</span>
            </div>
            <div class="select-box-right" @click="showUseTool = true">
              <span>{{ disposeTaskPresent(currentUseTool) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
           <div class="message-one is-me">
            <div class="message-one-left">
              我方解决
            </div>
            <div class="message-one-right">
              <van-radio-group v-model="isMeRadioValue" direction="horizontal">
                <van-radio name="1" checked-color="#3B9DF9">是</van-radio>
                <van-radio name="0" checked-color="#3B9DF9">否</van-radio>
              </van-radio-group>
            </div>
          </div>
          <div class="task-describe transport-type">
            <div class="transport-type-left">
              <span>任务描述</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="taskDescribe"
                rows="3"
                autosize
                type="textarea"
                placeholder="请输入任务描述"
              />
            </div>
          </div>
          <div class="consumable-management-area">
            <div class="circulation-area-title">
              <span>耗材管理</span>
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
        </div>
        <div class="btn-box">
          <span class="operate-one" @click="sureEvent">确认</span>
          <span class="operate-two" @click="temporaryStorageEvent">暂存</span>
          <span class="operate-three" @click="cancelEvent">取消</span>
        </div>
      </div>
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
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import {userSignOut} from '@/api/login.js'
import { createRepairsTask, getTransporter, querySpace, queryDepartment, queryRepairsTaskTool, queryStructure, queryRepairsTaskMaterial, getRepairsTaskType} from '@/api/taskScheduling.js'
import { setStore,removeAllLocalStorage } from '@/common/js/utils'
import _ from 'lodash'
import ScrollSelection from "@/components/ScrollSelection";
import BottomSelect from "@/components/BottomSelect";
export default {
  name: "CreateRepairsTask",
  components: {
    ScrollSelection,
    BottomSelect
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      materialShow: false,
      deleteInfoPng: require('@/common/images/home/delete-info.png'),
      materialDeleteShow: false,
      deleteMaterialIndex: '',
      loadingShow: false,
      deleteMaterial: '',
      searchValue: '',
      loadingText: '加载中...',
      problemOverview: '',
      taskDescribe: '',
      transportNumberValue: '',
      totalPage: '',
      pageSize: 6,
      currentPage: 1,
      inventoryMsgList: [],
      echoInventoryMsgList: [],
      temporaryInventoryMsgList: [],
      consumableMsgList: [],
      storeId: '',
      systemId: '',

      useToolOption: [],
      showUseTool: false,
      currentUseTool: [],

      participantOption: [],
      showParticipant: false,
      currentParticipant: [],

      goalDepartmentOption: [],
      showGoalDepartment: false,
      currentGoalDepartment: '请选择',

      goalSpacesOption: [],
      showGoalSpaces: false,
      currentGoalSpaces: [],

      taskTypeOption: [],
      showTaskType: false,
      currentTaskType: '请选择',

      structureOption: [],
      showStructure: false,
      currentStructure: '请选择',

      transporterOption: [],
      showTransporter: false,
      currentTransporter: '请选择',
      moveInfo: {
        startX: ''
      },
      priorityRadioValue: '1',
      isMeRadioValue: '1',
      functionListIndex: 0,
      overlayShow: false,
      rightMenuShow: false,
      xflSelectShow: false,
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      switchShowPng: require("@/common/images/home/switch-show.png"),
      switchHiddenPng: require("@/common/images/home/switch-hidden.png"),
      anxiousSignPng: require("@/common/images/home/anxious-sign.png"),
      taskList: [
        {tit:'调度管理'},
        {tit:'报修任务'},
        {tit:'区域巡检'}
      ]
    }
  },

  mounted() {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        that.commonIsTemporaryStorageMethods();
        pushHistory();
        that.$router.push({path: '/engineeringTaskManagement'})
      })
    };
    // this.registerSlideEvent();
    this.parallelFunction();
    //判断是否回显暂存的数据
    if (JSON.stringify(this.temporaryStorageCreateRepairsTaskMessage) != '{}' && this.temporaryStorageCreateRepairsTaskMessage['isTemporaryStorage']) {
      this.echoTemporaryStorageMessage()
    }
  },

  watch: {
  },

  computed: {
    ...mapGetters(["userInfo","schedulingTaskDetails","operateBtnClickRecord","transportantTaskMessage","templateType","temporaryStorageCreateRepairsTaskMessage"]),
    proId () {
      return this.userInfo.extendData.proId
    },
    userName () {
      return this.userInfo.userName
    },
    proName () {
      return this.userInfo.extendData.proName
    },
    workerId () {
      return this.userInfo.extendData.userId
    }
  },

  methods: {
    ...mapMutations(["changeTitleTxt","changeCatchComponent","changeOverDueWay","changeOperateBtnClickRecord","changetransportTypeMessage","changeTemporaryStorageCreateRepairsTaskMessage"]),

    onClickLeft() {
      this.commonIsTemporaryStorageMethods();
      this.$router.push({ path: "/engineeringTaskManagement"})
    },

    // 回显暂存的信息
    async echoTemporaryStorageMessage () {
      let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
      this.priorityRadioValue = casuallyTemporaryStorageCreateRepairsTaskMessage['priorityRadioValue'];
      this.currentTaskType = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskType'];
      this.currentStructure = casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructure'];
      this.currentGoalDepartment = casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartment'];
      this.currentGoalSpaces = casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalSpaces'];
      this.problemOverview = casuallyTemporaryStorageCreateRepairsTaskMessage['problemOverview'];
      this.currentTransporter = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporter'];
      this.currentParticipant = casuallyTemporaryStorageCreateRepairsTaskMessage['currentParticipant'];
      this.currentUseTool = casuallyTemporaryStorageCreateRepairsTaskMessage['currentUseTool'];
      this.isMeRadioValue = casuallyTemporaryStorageCreateRepairsTaskMessage['isMeRadioValue'];
      this.taskDescribe = casuallyTemporaryStorageCreateRepairsTaskMessage['taskDescribe'];
      this.consumableMsgList = casuallyTemporaryStorageCreateRepairsTaskMessage['consumableMsgList']
    },

    // 公共修改是否暂存的方法
    commonIsTemporaryStorageMethods () {
      let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
      casuallyTemporaryStorageCreateRepairsTaskMessage['isTemporaryStorage'] = false;
      this.changeTemporaryStorageCreateRepairsTaskMessage(casuallyTemporaryStorageCreateRepairsTaskMessage)
    },

    // 处理维修任务参与者
    disposeTaskPresent (item) {
      if (item.length == 0) { return '请选择'};
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.text)
      };
      return temporaryArray.join('、')
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

    // 格式化时间
    getNowFormatDate(currentDate) {
      let currentdate;
      let strDate = currentDate.getDate();
      let seperator1 = "-";
      let seperator2 = ":";
      let month = currentDate.getMonth() + 1;
      let hour = currentDate.getHours();
      let minutes = currentDate.getMinutes();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      };
      if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
      };
      if (minutes >= 0 && minutes <= 9) {
        minutes = "0" + minutes;
      };
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      };
      currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + hour + seperator2 + minutes
      return currentdate
    },

    // 根据建筑查询科室信息
    getDepartmentByStructureId (structureId,flag,isInitial) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.goalDepartmentOption = [];
      queryDepartment(this.proId,structureId)
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.goalDepartmentOption.push({
                text: res.data.data[i].departmentName,
                value: res.data.data[i].id,
                id: i
              })
            };
            if (isInitial) {
              if (this.currentGoalDepartment != '请选择') {
                this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],false)
              }
            }  
          };
          if (flag) {
            this.showGoalDepartment = true
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

    // 根据科室查询空间间信息
    getSpacesByDepartmentId (depId,flag) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.goalSpacesOption = [];
      querySpace(this.proId,depId)
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.goalSpacesOption.push({
                text: res.data.data[i].spaceName,
                value: res.data.data[i].id,
                selected: false
              })
            }
          };
          if (flag) {this.showGoalSpaces = true}
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
            this.structureOption = [];
            this.participantOption = [];
            this.taskTypeOption = [];
            this.transporterOption = [];
            this.useToolOption = [];
            let [item1,item2,item3,item4,item5] = res;
            if (item1) {
              // 任务类型
              for (let i = 0, len = item1.length; i < len; i++) {
                this.taskTypeOption.push({
                  text: item1[i].typeName,
                  value: item1[i].id,
                  id: i
                })
              }
            };
            if (item2) {
              // 目的建筑
              for (let i = 0, len = item2.length; i < len; i++) {
                this.structureOption.push({
                  text: item2[i].structName,
                  value: item2[i].id,
                  id: i
                })
              };
              if (this.currentStructure != '请选择') {
                this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,true)
              }
            };
            if (item3) {
              // 运送员
              for (let i = 0, len = item3.length; i < len; i++) {
                this.transporterOption.push({
                  text: item3[i].workerName,
                  value: item3[i]['id'],
                  id: i
                });
                this.participantOption.push({
                  text: item3[i].workerName,
                  value: item3[i]['id'],
                  selected: false
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
            // if (item4) {
            //   //任务类型
            //   // 有暂存的话,则回显该暂存信息
            //   if (this.temporaryStorageCreateRepairsTaskMessage['isTemporaryStorage']) {
            //   }
            // }
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


    // 注册滑动事件  
    registerSlideEvent () {
      this.$refs.wrapper.addEventListener('touchstart',this.touchstartHandle,false);
      this.$refs.wrapper.addEventListener('touchmove',this.touchmoveHandle,false)
    },

    // 滑动开始
    touchstartHandle() {
        //判断是否在滑动区域内滑动
        let e = e || window.event;
        if (e.targetTouches.length == 1) {
            this.moveInfo.startX = parseInt(e.targetTouches[0].clientX)
        }    
    },

    // 滑动中
    touchmoveHandle() {
      // 添加耗材框弹出时,禁止左右滑动
      if (this.materialShow) { return};
        let e = e || window.event;
        if (e.targetTouches.length == 1) {
        // 滑动距离
        let moveX = parseInt((e.targetTouches[0].clientX - this.moveInfo.startX));
        //左滑(根据左右滑动来控制右侧菜单的显示与隐藏,滑动距离大于10才判定为滑动)
        if (moveX < -50) {
          if(this.rightMenuShow) {return};
          this.rightMenuShow = true
        } else if (moveX > 50) {
          if(!this.rightMenuShow) {return};
          this.rightMenuShow = false
        }
      }        
    },

    // 使用工具下拉选择框确认事件
    useToolSureEvent (val) {
      if (val.length > 0) {
        this.currentUseTool =  val
      } else {
        this.currentUseTool = []
      };
      this.showUseTool = false
    },

    // 使用工具下拉选择框取消事件
    useToolCancelEvent () {
      this.showUseTool = false
    },

    // 使用工具下拉选择框关闭事件
    useToolCloseEvent () {
      this.showUseTool = false
    },

    // 参与人下拉选择框确认事件
    participantSureEvent (val) {
      if (val.length > 0) {
        this.currentParticipant =  val
      } else {
        this.currentParticipant = []
      };
      this.showParticipant = false
    },

    // 参与人下拉选择框取消事件
    participantCancelEvent () {
      this.showParticipant = false
    },

    // 参与人下拉选择框关闭事件
    participantCloseEvent () {
      this.showParticipant = false
    },

    // 任务类型下拉选择框确认事件
    taskTypeSureEvent (val) {
      console.log(val);
      if (val) {
        this.currentTaskType =  val
      } else {
        this.currentTaskType = '请选择'
      };
      this.showTaskType = false
    },

    // 任务类型下拉选择框取消事件
    structureCancelEvent () {
      this.showTaskType = false
    },

    // 任务类型下拉选择框关闭事件
    structureCloseEvent () {
      this.showTaskType = false
    },

    // 目的建筑下拉选择框确认事件
    structureSureEvent (val) {
      if (val) {
        this.currentStructure =  val;
        this.currentGoalDepartment = '请选择';
        this.currentGoalSpaces = [];
        this.goalSpacesOption = [];
        this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,false)
      } else {
        this.currentStructure = '请选择'
      };
      this.showStructure = false
    },

    // 目的建筑下拉选择框取消事件
    structureCancelEvent () {
      this.showStructure = false
    },

    // 目的建筑下拉选择框关闭事件
    structureCloseEvent () {
      this.showStructure = false
    },

    // 目的科室下拉选择框确认事件
    goalDepartmentSureEvent (val) {
      if (val) {
        this.currentGoalDepartment =  val;
        this.currentGoalSpaces = [];
        this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],false)
      } else {
        this.currentGoalDepartment = '请选择'
      };
      this.showGoalDepartment = false
    },

    // 目的科室列点击事件
    goalDepartmentClickEvent () {
      if (this.currentStructure == '请选择') {
        this.$toast('请选择建筑')
      } else {
        this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],true,false)
      }
    },

    // 目的科室下拉选择框取消事件
    goalDepartmentCancelEvent () {
      this.showGoalDepartment = false
    },

    // 目的科室下拉选择框关闭事件
    goalDepartmentCloseEvent () {
      this.showGoalDepartment = false
    },

    // 目的房间下拉选择框关闭事件
    goalSpacesCloseEvent () {
      this.showGoalSpaces = false
    },
    
    // 目的房间列点击事件
    goalSpacesClickEvent () {
      if (this.currentGoalDepartment == '请选择') {
        this.$toast('请选择科室')
      } else {
        this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],true)
      }
    },

    // 目的房间下拉选择框确认事件
    goalSpacesSureEvent (val) {
      if (val.length > 0) {
        this.currentGoalSpaces =  val;
      } else {
        this.currentGoalSpaces = []
      };
      this.showGoalSpaces = false
    },

    // 目的房间下拉选择框取消事件
    goalSpacesCancelEvent () {
      this.showGoalSpaces = false
    },


    // 运送员下拉选择框确认事件
    transporterSureEvent (val) {
      if (val) {
        this.currentTransporter =  val
      } else {
        this.currentTransporter = '请选择'
      };
      this.showTransporter = false
    },

    // 运送员下拉选择框取消事件
    transporterCancelEvent () {
      this.showTransporter = false
    },

    // 运送员下拉选择框关闭事件
    transporterCloseEvent () {
      this.showTransporter = false
    },

    // 切换显示右侧菜单事件
    onClickRight () {
      this.rightMenuShow = true
    },

    // 切换隐藏右侧菜单事件
    switchHiddenEvent () {
      this.rightMenuShow = false
    },

    // 右侧菜单任务列表点击事件
    taskRouterSkip (name, index) {
        this.functionListIndex = index;
        if (name === '报修任务') {
          this.resetBtnClickStatus();
          this.$router.push({path: 'repairsWorkOrder'});
          this.changeTitleTxt({tit:'报修工单'});
          setStore('currentTitle','报修工单')
        } else if (name === '区域巡检') {
          this.resetBtnClickStatus();
          this.$router.push({path: 'departmentService'});
          this.changeTitleTxt({tit:'区域巡检'});
          setStore('currentTitle','区域巡检')
        } else if (name === '调度管理') {
        }
      },


      // 根据维修员名称获取运送员id
      getCurrentTransporterIdByName(text) {
        return this.transporterOption.filter((item) => {return item['text'] == text })[0]['value']
      },

      // 下班签退事件
      signOutEvent () {
          this.$dialog.alert({
            message: '确定签退?',
            closeOnPopstate: true,
            showCancelButton: true
          }).then(() => {
            this.userLoginOut(this.proId, this.userInfo.userName)
          })
          .catch(() => {
          })
      },

      // 用户签退
      userLoginOut (proId,workerId) {
        this.changeOverDueWay(true);
        setStore('storeOverDueWay',true);
        userSignOut(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            removeAllLocalStorage();
            this.changeCatchComponent([]);
            this.$router.push({path:'/'})
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
            this.changeOverDueWay(false);
            setStore('storeOverDueWay',false);
          }
        }).
        catch((err) => {
          this.changeOverDueWay(false);
          setStore('storeOverDueWay',false);
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      },

    // 确认事件(创建维保任务)
    sureEvent () {
      // 任务类型不能为空
      if (this.currentTaskType == '请选择') {
        this.$toast('任务类型不能为空');
        return
      };
      // 创建维修任务
      let temporaryMessage = {
        typeId: this.taskTypeOption.filter((item) => { return item['text'] == this.currentTaskType})[0]['value'], // 任务类型
        taskDesc: this.problemOverview, // 问题描述
        destinationId: '', // 目的地id
        depId: '', // 出发地id
        select: '',
        isMe: this.isMe, // 是否我方解决 0-否，1-是
        priority: this.priorityRadioValue,
        taskRemark: this.taskDescribe, //任务描述
        proId: this.proId,
        proName: this.proName,
        createId: this.workerId,
        createName: this.userName,
        createType: 0, // 创建类型 0-调度员 2-医务人员 3-巡检人员
        workerId: this.currentTransporter == '请选择' ? '' : this.getCurrentTransporterIdByName(this.currentTransporter),
        workerName: this.currentTransporter == '请选择' ? '' : this.currentTransporter,
        spaces: [], //空间信息
        present: [], //参与者
        tools: [],  //使用工具
        depName: `${this.currentStructure == '请选择' ? '' : this.currentStructure}/${this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment}/${this.currentGoalSpaces.length > 0 ? this.disposeTaskPresent(this.currentGoalSpaces) : ''}`, //出发地名称
        typeName: this.currentTaskType, // 类型名称
        materials: []        // 需要的物料
      };
      //处理拼接的地点信息
      temporaryMessage['depName'] = temporaryMessage['depName'].replace('//','/');
      // 拼接参与者数据
      if (this.currentParticipant.length > 0) {
        for (let item of this.currentParticipant) {
          temporaryMessage['present'].push({
            id: item.value ? item.value : item.id,
            name: item.text ? item.text : item.name
          })
        }
      };
      // 拼接使用工具数据
      if (this.currentUseTool.length > 0) {
        for (let item of this.currentUseTool) {
          temporaryMessage['tools'].push({
            id: item.value ? item.value : item.id,
            name: item.text ? item.text : item.name
          })
        }
      };
      // 拼接空间信息
      if (this.currentGoalSpaces.length > 0) {
        for (let item of this.currentGoalSpaces) {
          temporaryMessage['spaces'].push({
            id: item.value ? item.value : item.id,
            name: item.text ? item.text : item.name
          })
        }
      };
      // 拼接使用耗材数据
      if (this.consumableMsgList.length > 0) {
        for (let item of this.consumableMsgList) {
          if (item.number > 0) {
            temporaryMessage['materials'].push({
              mateNumber: item['mateNumber'],
              storeId: item['storeId'],
              number: item['number'],
              mateName: item['mateName'],
              mateId: item['mateId'],
              proId: this.proId,
              proName: this.proName,
              systemId: item['systemId'],
              unit: item['unit'],
              model: item['model']
            })
          }  
        }
      };
      this.postGenerateRepairsTask(temporaryMessage)
    },

    // 生成维修任务
    postGenerateRepairsTask (data) {
      this.loadingText = '创建中...';
      this.loadingShow = true;
      this.overlayShow = true;
      createRepairsTask(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$toast(`${res.data.msg}`);
          this.commonIsTemporaryStorageMethods();
          this.$router.push({path:'/engineeringTaskManagement'});
          this.changeTitleTxt({tit:'工程维保任务管理'});
          setStore('currentTitle','工程维保任务管理');
        } else {
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
      let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
      casuallyTemporaryStorageCreateRepairsTaskMessage['priorityRadioValue'] = this.priorityRadioValue;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskType'] = this.currentTaskType;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructure'] = this.currentStructure;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartment'] = this.currentGoalDepartment;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalSpaces'] = this.currentGoalSpaces;
      casuallyTemporaryStorageCreateRepairsTaskMessage['problemOverview'] = this.problemOverview;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporter'] = this.currentTransporter;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentParticipant'] = this.currentParticipant;
      casuallyTemporaryStorageCreateRepairsTaskMessage['currentUseTool'] = this.currentUseTool;
      casuallyTemporaryStorageCreateRepairsTaskMessage['isMeRadioValue'] = this.isMeRadioValue;
      casuallyTemporaryStorageCreateRepairsTaskMessage['taskDescribe'] = this.taskDescribe;
      casuallyTemporaryStorageCreateRepairsTaskMessage['consumableMsgList'] = this.consumableMsgList;
      casuallyTemporaryStorageCreateRepairsTaskMessage['isTemporaryStorage'] = true;
      this.changeTemporaryStorageCreateRepairsTaskMessage(casuallyTemporaryStorageCreateRepairsTaskMessage);
      this.$toast('暂存成功');
      this.$router.push({path: '/engineeringTaskManagement'})
    },

    // 取消事件
    cancelEvent () {
      this.commonIsTemporaryStorageMethods();
      this.$router.push({ path: "/engineeringTaskManagement"})
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
  /deep/ .van-popup--right {
    padding: 20px 0 80px 0;
    box-sizing: border-box;
    .top-icon {
        padding-left: 10px;
        box-sizing: border-box
    };
    .center-content {
        margin-top: 20px;
        .function-list {
            width: 153px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            margin: 0 auto;
            border: 1px solid #3B9DF9;
            box-sizing: border-box;
            font-size: 16px;
            color: #3B9DF9;
            border-radius: 8px;
            margin-bottom: 20px
        };
        .functionListStyle {
            color: #fff !important;
            border: none !important;
            background: #3B9DF9 !important
        }
    };
    .signout-box {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 153px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #E86F50;
        font-size: 16px;
        color: #fff;
        border-radius: 8px
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
        margin-top: 50px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        background: #f7f7f7;
        z-index: 10;
        .message-box {
          flex: 1;
          width: 100%;
          overflow: scroll;
          .message-one {
            width: 100%;
            padding: 10px 6px 10px 16px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .message-one-left {
              width: 20%;
              color: #101010
            };
            .message-one-right {
              flex: 1;
              /deep/ .van-radio-group {
                justify-content: space-between;
                .van-radio--horizontal {
                  margin-right: 0 !important;
                  &:nth-child(1) {
                    .van-radio__label {
                      color: #289E8E !important
                    }
                  };
                  &:nth-child(2) {
                    .van-radio__label {
                      color: #E8CB51 !important
                    }
                  };
                  &:nth-child(3) {
                    .van-radio__label {
                      color: #F2A15F !important
                    }
                  };
                  &:nth-child(4) {
                    .van-radio__label {
                      color: #E86F50 !important
                    }
                  }
                }
              }
            }
          };
          .is-me {
            .message-one-left {
              color: #9E9E9A !important
            };
             .message-one-right {
              flex: 1;
              /deep/ .van-radio-group {
                justify-content: flex-end;
                .van-radio--horizontal {
                  &:nth-child(1) {
                    margin-right: 20px !important;
                    .van-radio__label {
                      color: #101010 !important
                    }
                  };
                  &:nth-child(2) {
                    .van-radio__label {
                      color: #101010 !important
                    }
                  };
                }
              }
            }
          };
          .select-box {
            width: 100%;
            padding: 8px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .select-box-left {
              padding-right: 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                };
              }
            };
            .select-box-right {
              flex: 1;
              justify-content: flex-end;
              align-items: center;
              display: flex;
              width: 0;
              >span {
                color: #101010;
                text-align: right;
                flex: 1;
                .no-wrap()
              }
            }
          };
          .end-select-box {
            .select-box-left {
              padding: 0 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                };
              }
            };
          };
          .problem-overview {
            align-items: center
          };
          .transport-type {
            width: 100%;
            padding: 10px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .transport-type-left {
              padding: 0 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: #9E9E9A
                }
              }
            };
            .transport-type-right {
              flex: 1;
              width: 0;
              display: flex;
              flex-wrap: wrap;
              .transport-type-list {
                display: inline-block;
                font-size: 13px;
                color: #9E9E9A;
                background: #F9F9F9;
                text-align: center;
                border-radius: 10px;
                margin-right: 10px;
                margin-bottom: 10px;
                line-height: 20px;
                padding: 6px 10px;
                box-sizing: border-box
              };
              .transportTypeListStyle {
                color: #fff !important;
                background: #3B9DF9 !important
              }
            }
          };
          .transport-type {
            .transport-type-right {
              /deep/ .van-cell {
                padding: 4px 6px !important;
                background: #F9F9F9
              }
            }
          };
          .consumable-management-area {
            width: 100%;
            padding: 8px 20px;
            box-sizing: border-box;
            background: #fff;
            font-size: 14px;
            margin-top: 6px;
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
                color: #101010
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
          }
        };
        .btn-box {
          width: 90%;
          margin: 0 auto;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          >span {
            width: 40%;
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
              margin-right: 30px
            };
            &:nth-child(2) {
              color: #1864FF;
              box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
              margin-right: 30px
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