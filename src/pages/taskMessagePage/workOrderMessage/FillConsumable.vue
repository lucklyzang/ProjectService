<template>
  <div class="content-wrapper">
    <div class="worker-show">
      <!-- 顶部导航栏 -->
      <HeaderTop :title="navTopTitle">
        <van-icon name="arrow-left" slot="left" @click="backTo"></van-icon>
      </HeaderTop>
      <!-- 内容部分 -->
      <van-empty description="物料为空" v-show="materialShow"/>
      <div class="content-top" v-show="materialContentShow">
        <div class="circulation-area-title">
          <span></span>
          <span>耗材名称</span>
          <span>单位</span>
          <span>数量</span>
        </div>
        <div class="circulation-area">
          <p v-for="(item,index) in consumableMsgList" :key="`${item}-${index}`">
            <span>{{index+1}}</span>
             <span>
              {{item.mateName}}-{{item.model}}
            </span>
            <span>
              {{item.unit ? item.unit : '无'}}
            </span>
            <span>
              <van-stepper theme="round" @change="stepperEvent" v-model="item.number" min="0"/>
              <!-- <span>
                <van-icon name="delete" @click="deleteEvent(item,index)" />
              </span> -->
            </span>
          </p>
        </div>
      </div>
      <div class="content-bottom">
        <p class="back-home"  @click="addConsumable">添加物资</p>
        <p class="quit-account" @click="sure">确认</p>
      </div>
    </div>
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
</template>
<script>
  import HeaderTop from '@/components/HeaderTop'
  import FooterBottom from '@/components/FooterBottom'
  import NoData from '@/components/NoData'
  import Loading from '@/components/Loading'
  import store from '@/store'
  import VanFieldSelectPicker from '@/components/VanFieldSelectPicker'
  import { mapGetters, mapMutations } from 'vuex'
  import {queryMaterialById,queryAllMaterial,saveMate,completeRepairsTask} from '@/api/worker.js'
  import { formatTime, setStore, getStore, removeStore, IsPC, changeArrIndex, removeAllLocalStorage, repeArray } from '@/common/js/utils'
  export default {
    name: 'FillConsumable',
    components:{
      HeaderTop,
      FooterBottom,
      VanFieldSelectPicker
    },
    data() {
      return {
        toolShow: false,
        materialShow: false,
        materialContentShow: false,
        searchValue: '',
        consumableMsgList: [],
        inventoryMsgList: [],
        temporaryInventoryMsgList: [],
        storeId: '',
        systemId: ''
      }
    },

    mounted() {
      // 控制设备物理返回按键测试
      if (!IsPC()) {
        pushHistory();
        this.gotoURL(() => {
          pushHistory();
          this.$router.push({path: 'workOrderDetails'});
          this.changeTitleTxt({tit:'工单详情'});
          setStore('currentTitle','工单详情')
        })
      };
      this.queryStoreId({proId: this.proId,state: 0});
      this.getMaterialById(this.taskId)
    },

    watch: {
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
        'completeRoomList',
        'isCompleteRepairsWorkOrderPhotoList'
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
        'changeCompleteRoomList',
        'changeIsCompletePhotoList'
      ]),

      //返回上一页
      backTo () {
        this.$router.push({path: 'workOrderDetails'});
        this.changeTitleTxt({tit:'工单详情'});
        setStore('currentTitle','工单详情')
      },

      //查询任务关联的物料信息
      getMaterialById (taskId) {
        queryMaterialById(taskId)
        .then((res) => {
          if(res && res.data.code == 200) {
            if (res.data.data.length > 0) {
              this.materialShow = false;
              this.materialContentShow = true;
              this.consumableMsgList = [];
              this.consumableMsgList = res.data.data;
            } else {
              this.materialShow = true;
              this.materialContentShow = false
            }
          } else {
            this.materialShow = true;
            this.materialContentShow = false;
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            })
          }
        })
        .catch((err) => {
          this.materialShow = true;
          this.materialContentShow = false;
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          })
        })
      },

      //查询storeId与systemId
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
                item['checked'] = false;
                // 添加过的物料不允许再次添加
                let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
                isExist.length > 0 ? item['disabled'] = true : item['disabled'] = false
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

      // 添加确认
      toolSure () {
        let count = this.inventoryMsgList.some((item)=> {return item.checked == true});
        if (!count) {
          this.$toast('至少要选择一种耗材')
        } else {
          this.materialShow = false;
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
              storeId: this.storeId,
              systemId: this.systemId
            })
          };
        }
      },

      // 删除事件
      deleteEvent(item,index) {
        this.consumableMsgList.splice(index,1)
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

      // 添加取消
      toolCancel () {

      },

      // 确认
      sure () {
        let mateMsg = {
          proId: this.proId,
          id: this.taskId,
          materials: []
        };
        // let temporaryConsumableMsgList = this.consumableMsgList.filter((item) => {return item.number > 0});
        // if (temporaryConsumableMsgList.length == 0) {
        //   this.$toast('添加的耗材数量不能为0');
        //   return
        // };
        for (let item of this.consumableMsgList) {
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
        };
        saveMate(mateMsg).then((res) => {
          if (res && res.data.code == 200) {
            if (res.data.data.length == 0) {
              this.$toast(`${res.data.msg}`);
            } else {
              // 提示库存不足的物料名称及型号
              let msgArray = [],
                  msg = '';
              res.data.data.forEach((el) => {
                msgArray.push(`${el.mateName}-${el.model}`)
              });
              msg = msgArray.join(',');
              this.$dialog.alert({
                message: `${msg},库存不足`,
                closeOnPopstate: false
              }).then(() => {
              })
            };
            this.backTo() 
          } else {
            this.$toast(`${res.data.msg}`)
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

      // 存储已完成检修的房间信息
      storageCompletedRoom (departmentNo) {
        let temporaryOfficeList = [];
        let temporaryDepartmentId = [];
        temporaryOfficeList = deepClone(this.completeRoomList);
        if (this.completeRoomList.length > 0 ) {
          let temporaryIndex = this.completeRoomList.indexOf(this.completeRoomList.filter((item) => {return item.taskId == this.taskId})[0]);
          if (temporaryIndex != -1) {
            temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
            temporaryDepartmentId.push(departmentNo);
            temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
          } else {
            temporaryDepartmentId.push(departmentNo);
            temporaryOfficeList.push(
              {
                officeList: repeArray(temporaryDepartmentId),
                taskId: this.taskId
              }
            )
          };
        } else {
          temporaryDepartmentId.push(departmentNo);
          temporaryOfficeList.push(
            {
              officeList: repeArray(temporaryDepartmentId),
              taskId: this.taskId
            }
          )
        };
        this.changeCompleteRoomList(temporaryOfficeList);
        setStore('completeRoomList', {"sweepCodeInfo": temporaryOfficeList})
      }
    }
  }
</script>
<style lang='less' scoped>
  @import "~@/common/stylus/variable.less";
  @import "~@/common/stylus/mixin.less";
  @import "~@/common/stylus/modifyUi.less";
  .content-wrapper {
    /deep/ .van-dialog {
      top: 50%;
      .van-dialog__content {
        margin-bottom: 6px;
        /*height: 500px;*/
        margin: 10px 0;
        .tool-name-list {
          width: 94%;
          height: 100%;
          overflow: auto;
          margin: 0 auto;
          padding: 0;
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
            max-height: 300px;
            padding: 6px;
            overflow: auto;
            box-sizing: border-box;
            border-top: 1px solid #b2b2b2;
            border-bottom: 1px solid #b2b2b2;
            .circulation-area-content {
              position: relative;
              height: 40px;
              background: #fff;
              > span {
                height: 40px;
                line-height: 40px;
                font-size: 16px;
                display: inline-block;
                &:first-child {
                  width: 55%
                };
                &:nth-child(2) {
                  width: 20%;
                }
                &:last-child {
                  position: absolute;
                  top: 12px;
                  right: 0
                }
              }
            }
            .circulation-area-title {
              position: relative;
              font-size: 0;
              span {
                height: 40px;
                line-height: 40px;
                display: inline-block;
                width: 20%;
                font-size: 16px;
                &:first-child {
                  width: 55%
                };
                &:nth-child(2) {
                  width: 20%;
                }
                &:last-child {
                  position: absolute;
                  text-align: right;
                  right: 0
                }
              }
            }
          }
        }
      }
    };
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
      left: 13%;
      width: 100%;
      height: 100px;
      text-align: center;
    };
    .worker-show {
      .content-wrapper();
      overflow: auto;
      /deep/ .van-empty {
        flex: 1;
      };
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
          > span {
            height: 50px;
            line-height: 50px;
            width: 40%;
            font-size: 16px;
            display: inline-block;
            text-align: center;
            &:first-child {
              width: 10%
            };
            &:nth-child(2) {
              text-align: center;
              /deep/ .van-cell {
                .van-cell__value--alone {
                  .van-field__control {
                    text-align: center
                  }
                }
              }
            };
            &:nth-child(3) {
              width: 10%;
              /deep/ .van-cell {
                padding: 0
              }
            }
            &:last-child {
              position: absolute;
              top:0;
              right: 0;
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
      };
      .circulation-area-title {
        height: 10%;
        position: relative;
        font-size: 0;
          span {
            display: inline-block;
            text-align: left;
            width: 40%;
            font-size: 16px;
            line-height: 56px;
            &:first-child {
              width: 10%;
              text-align: center
            };
            &:nth-child(2) {
              text-align: center
            };
            &:nth-child(3) {
              width: 10%
            };
            &:last-child {
              text-align: center
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
