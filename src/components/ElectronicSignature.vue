<template>
  <section class="signature">
    <div class="signatureBox">
      <div class="canvasBox" ref="boardBox" :currentSinnatureData="signNatureData">
        <canvas ref="board" 
          @touchstart='touchStart' 
          @touchmove='touchMove' 
          @touchend='touchEnd' 
          @mousedown="mouseDown" 
          @mousemove="mouseMove"
          @mouseup="mouseUp"
        >
        </canvas>
        <!-- <div class="btnBox">
          <div @click="overwrite">重写</div>
          <div @click="commitSure">确认签名</div>
        </div>    -->
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
    mounted() {
      let board = this.$refs.board;  // 获取DOM
      board.width = this.$refs.boardBox.offsetWidth; // 设置画布宽
      board.height = this.$refs.boardBox.offsetHeight;  // 设置画布高
      this.ctx = board.getContext('2d');  // 二维绘图
      this.ctx.strokeStyle = '#000';  // 颜色
      this.ctx.lineWidth = 2; // 线条宽度
      this.changeCurrentElectronicSignature({DtMsg: this.$refs.board.toDataURL("image/png")});
      this.changeOriginalSignature(this.$refs.board.toDataURL("image/png"));
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

    //mobile

    // 触摸(开始)
      touchStart (e) {
        let x = e.touches[0].clientX - e.target.offsetLeft,
          y = e.touches[0].clientY - e.target.offsetTop;  // 获取触摸点在画板（canvas）的坐标
        this.point.x = x;
        this.point.y = y;
        this.ctx.beginPath();
        this.ctx.moveTo(this.point.x, this.point.y);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
        this.moving = true;
      },

      // 滑动中...
      touchMove (e) {
        if(this.moving) {
          let x = e.touches[0].clientX - e.target.offsetLeft,
            y = e.touches[0].clientY - e.target.offsetTop;  // 获取触摸点在画板（canvas）的坐标
          this.ctx.beginPath();
          this.ctx.moveTo(this.point.x, this.point.y);  // 把路径移动到画布中的指定点，不创建线条(起始点)
          this.ctx.lineTo(x, y); // 添加一个新点，然后创建从该点到画布中最后指定点的线条，不创建线条
          this.ctx.stroke(); // 绘制
          this.ctx.closePath();
          this.point.x = x, this.point.y = y;  // 重置点坐标为上一个坐标
        }
      },
      // 滑动结束
      touchEnd (e) {
        if(this.moving) {
          let x = e.touches[0].clientX - e.target.offsetLeft,
          y = e.touches[0].clientY - e.target.offsetTop;
          this.ctx.beginPath();
          this.ctx.moveTo(this.point.x, this.point.y);
          this.ctx.lineTo(x, y);
          this.ctx.stroke();
          this.ctx.closePath();  // 停止绘制
          this.moving = false;  // 关闭绘制开关
        }
      },

      //pc
      mouseDown(ev) {
        ev = ev || event
        ev.preventDefault()
        if (1) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          }
          this.startX = obj.x
          this.startY = obj.y
          this.ctx.beginPath()
          this.ctx.moveTo(this.startX, this.startY)
          this.ctx.lineTo(obj.x, obj.y)
          this.ctx.stroke()
          this.ctx.closePath()
          this.points.push(obj)
          this.isDown = true
        }
      },
      mouseMove(ev) {
        ev = ev || event
        ev.preventDefault()
        if (this.isDown) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          }
          this.moveY = obj.y
          this.moveX = obj.x
          this.ctx.beginPath()
          this.ctx.moveTo(this.startX, this.startY)
          this.ctx.lineTo(obj.x, obj.y)
          this.ctx.stroke()
          this.ctx.closePath()
          this.startY = obj.y
          this.startX = obj.x
          this.points.push(obj)
        }
      },
      mouseUp(ev) {
        ev = ev || event
        ev.preventDefault()
        if (1) {
          let obj = {
            x: ev.offsetX,
            y: ev.offsetY
          }
          this.ctx.beginPath()
          this.ctx.moveTo(this.startX, this.startY)
          this.ctx.lineTo(obj.x, obj.y)
          this.ctx.stroke()
          this.ctx.closePath()
          this.points.push(obj)
          this.points.push({x: -1, y: -1})
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
  canvas {
    height: 100%;
    width: 100%;
    background: #fff
  }
  .btnBox {
    padding: 10px;
    text-align: center;
  }
  .btnBox 
  > div {
    display: inline-block;
    border-radius: 4px;
    height: 30px;
    line-height: 30px;
    width: 80px;
    font-size: 13px;
    color: #fff;
    &:first-child {
      background: orange
    };
    &:last-child {
      background: #71b900
    }
  }
</style>