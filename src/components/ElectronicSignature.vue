<template>
  <section class="signature">
    <div class="signatureBox">
      <div class="canvasBox" ref="boardBox" :currentSinnatureData="signNatureData">
        <canvas ref="board" 
          @touchstart="touchStart" 
          @touchmove="touchMove" 
          @touchend="touchEnd" 
          @mousedown="mouseDown" 
          @mousemove="mouseMove"
          @mouseup="mouseUp"
        >
        </canvas>
      </div>
    </div>
  </section> 
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { base64ImgtoFile } from '@/common/js/utils'
  export default {
    name: 'ElectronicSignature',
    data() {
      return {
        ctx: null,
        point: {
          x: 0,
          y: 0
        },
        moving: false,// 是否正在绘制中且移动
        stageInfo:'',
        signNatureData:'',
        imgUrl:'',
        client: {},
        points: [],
        canvasTxt: null,
        startX: 0,
        startY: 0,
        moveY: 0,
        moveX: 0,
        endY: 0,
        endX: 0,
        w: null,
        h: null,
        isDown: false
      }
    },
    
    props: {
      color: {
        type: String,
        default: '#000'
      },
      lineWidth: {
        type: Number,
        default: 2
      }
    },

    mounted() {
      this.initCanvas()
    },

     computed:{
      ...mapGetters([
        'currentElectronicSignature',
        'originalSignature'
      ]),
    },

    methods: {
      ...mapMutations([
        'changeCurrentElectronicSignature',
        'changeOriginalSignature'
      ]),

    // canvas初始化配置
    initCanvas () {
      let board = this.$refs.board;  // 获取canvas的DOM
      board.width = this.$refs.boardBox.offsetWidth; // 设置画布宽
      board.height = this.$refs.boardBox.offsetHeight;  // 设置画布高
      this.ctx = board.getContext('2d');  // 二维绘图
      this.stageInfo = board.getBoundingClientRect();
      this.ctx.strokeStyle = this.color;  // 颜色
      this.ctx.lineWidth = this.lineWidth; // 线条宽度
      this.changeCurrentElectronicSignature({DtMsg: this.$refs.board.toDataURL("image/png")});
      this.changeOriginalSignature(this.$refs.board.toDataURL("image/png"));
    },

    // 绘制签名公共方法封装
    // @param { ctx } canvas二维对象
    // @param { startX } 起点横坐标
    // @param { startY } 起点纵坐标
    // @param { originX } 触摸点的横坐标
    // @param { originY } 触摸点的纵坐标
    // @param { obj } 触摸点坐标集合
    fillCircle (ctx, startX, startY, originX, originY,obj) {
      // 开始一条路径或重置当前路径
      ctx.beginPath();
      // 把路径移动到画布中的指定点，不创建线条(起始点)
      ctx.moveTo(startX, startY);
      // 添加一个新点，然后创建从该点到画布中最后指定点的线条，不创建线条
      ctx.lineTo(originX, originY);
      // 创建从当前点到开始点的路径
      ctx.closePath();
      // 绘制
      ctx.stroke();
      this.points.push(obj);
    },

    //mobile

    // 触摸(开始)
      touchStart (ev) {
        ev = ev || event;
        ev.preventDefault();
        if (ev.touches.length == 1) {
          // 获取触摸点在画板（canvas）的坐标
          let obj = {
            x: ev.targetTouches[0].clientX - ev.target.offsetLeft,
            y: ev.targetTouches[0].clientY - ev.target.offsetTop,
          };
          this.startX = obj.x;
          this.startY = obj.y;
          this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
          this.moving = true
        }
      },

      // 滑动中...
      touchMove (ev) {
        if(this.moving) {
          ev = ev || event;
          ev.preventDefault();
          if (ev.touches.length == 1) {
            // 获取触摸点在画板（canvas）的坐标
            let obj = {
              x: ev.targetTouches[0].clientX - this.stageInfo.left,
              y: ev.targetTouches[0].clientY - this.stageInfo.top,
            };
            this.moveX = obj.x;
            this.moveY = obj.y;
            this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
            // 重置点坐标为上一个坐标
            this.startY = obj.y
            this.startX = obj.x
            this.moving = true;
          }
        }
      },

      // 滑动结束
      touchEnd (ev) {
        if(this.moving) {
         ev = ev || event;
         ev.preventDefault();
          if (ev.touches.length == 1) {
            let obj = {
              x: ev.targetTouches[0].clientX - this.stageInfo.left,
              y: ev.targetTouches[0].clientY - this.stageInfo.top
            };
            this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
            this.points.push(obj);
            // 关闭绘制开关
            this.moving = false
          }
        }
      },

      //pc

      mouseDown(ev) {
        ev = ev || event
        ev.preventDefault();
        if (1) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          };
          this.startX = obj.x;
          this.startY = obj.y;
          this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
          this.isDown = true
        }
      },

      mouseMove(ev) {
        ev = ev || event;
        ev.preventDefault();
        if (this.isDown) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          };
          this.moveY = obj.y;
          this.moveX = obj.x;
          this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
          this.startY = obj.y;
          this.startX = obj.x
        }
      },

      mouseUp(ev) {
        ev = ev || event;
        ev.preventDefault();
        if (1) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          };
          this.fillCircle(this.ctx,this.startX, this.startY, obj.x, obj.y, obj);
          this.points.push(obj);
          this.points.push({x: -1, y: -1});
          this.isDown = false
        }
      },

      //重写
      overwrite() {
        this.ctx.clearRect(0, 0, this.$refs.board.width, this.$refs.board.height);
        this.changeCurrentElectronicSignature({DtMsg: null});
        this.changeOriginalSignature(this.$refs.board.toDataURL("image/png"));
        this.points = [];
      },

      //确认签名
      commitSure() {
        if (this.originalSignature ==  this.$refs.board.toDataURL("image/png")) {
          this.$dialog.alert({
            message: '请签名',
            closeOnPopstate: false
          }).then(() => {
          });
          return
        };
        this.imgUrl = this.$refs.board.toDataURL();
        this.signNatureData = this.$refs.board.toDataURL("image/png");
        this.changeCurrentElectronicSignature({DtMsg:this.$refs.board.toDataURL("image/png")});
        var imgFile = base64ImgtoFile(this.$refs.board.toDataURL());
        this.changeOriginalSignature(null)
      }
    }
  }
</script>
<style lang='less' scoped>
  .signature {
    height: 100%;
    .signatureBox {
      width: 96%;
      height: 100%;
      margin:0 auto;
      box-sizing: border-box;
      overflow: hidden;
      background: #fff;
      z-index: 100;
      display: flex;
      flex-direction: column;
      border: 1px solid #cacaca
    }
  };
  .canvasBox {
    box-sizing: border-box;
    flex: 1
  }
  .btnBox {
    padding: 10px;
    text-align: center;
  }
</style>