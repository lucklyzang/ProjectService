webpackJsonp([4],{gh9j:function(t,e,i){"use strict";var n=i("4YfN"),s=i.n(n),r=i("SJI6"),o=i("fdFc"),a={name:"ElectronicSignature",data:function(){return{ctx:null,point:{x:0,y:0},moving:!1,stageInfo:"",signNatureData:"",imgUrl:"",client:{},points:[],canvasTxt:null,startX:0,startY:0,moveY:0,moveX:0,endY:0,endX:0,w:null,h:null,isDown:!1}},mounted:function(){var t=this.$refs.board;t.width=this.$refs.boardBox.offsetWidth,t.height=this.$refs.boardBox.offsetHeight,this.ctx=t.getContext("2d"),this.ctx.strokeStyle="#000",this.ctx.lineWidth=2,this.changeCurrentElectronicSignature({DtMsg:this.$refs.board.toDataURL("image/png")}),this.changeOriginalSignature(this.$refs.board.toDataURL("image/png"))},computed:s()({},Object(r.mapGetters)(["currentElectronicSignature","originalSignature"])),methods:s()({},Object(r.mapMutations)(["changeCurrentElectronicSignature","changeOriginalSignature"]),{touchStart:function(t){var e=t.touches[0].clientX-t.target.offsetLeft,i=t.touches[0].clientY-t.target.offsetTop;this.point.x=e,this.point.y=i,this.ctx.beginPath(),this.ctx.moveTo(this.point.x,this.point.y),this.ctx.lineTo(e,i),this.ctx.stroke(),this.ctx.closePath(),this.moving=!0},touchMove:function(t){if(this.moving){var e=t.touches[0].clientX-t.target.offsetLeft,i=t.touches[0].clientY-t.target.offsetTop;this.ctx.beginPath(),this.ctx.moveTo(this.point.x,this.point.y),this.ctx.lineTo(e,i),this.ctx.stroke(),this.ctx.closePath(),this.point.x=e,this.point.y=i}},touchEnd:function(t){if(this.moving){var e=t.touches[0].clientX-t.target.offsetLeft,i=t.touches[0].clientY-t.target.offsetTop;this.ctx.beginPath(),this.ctx.moveTo(this.point.x,this.point.y),this.ctx.lineTo(e,i),this.ctx.stroke(),this.ctx.closePath(),this.moving=!1}},mouseDown:function(t){(t=t||event).preventDefault();var e={x:t.offsetX,y:t.offsetY};this.startX=e.x,this.startY=e.y,this.ctx.beginPath(),this.ctx.moveTo(this.startX,this.startY),this.ctx.lineTo(e.x,e.y),this.ctx.stroke(),this.ctx.closePath(),this.points.push(e),this.isDown=!0},mouseMove:function(t){if((t=t||event).preventDefault(),this.isDown){var e={x:t.offsetX,y:t.offsetY};this.moveY=e.y,this.moveX=e.x,this.ctx.beginPath(),this.ctx.moveTo(this.startX,this.startY),this.ctx.lineTo(e.x,e.y),this.ctx.stroke(),this.ctx.closePath(),this.startY=e.y,this.startX=e.x,this.points.push(e)}},mouseUp:function(t){(t=t||event).preventDefault();var e={x:t.offsetX,y:t.offsetY};this.ctx.beginPath(),this.ctx.moveTo(this.startX,this.startY),this.ctx.lineTo(e.x,e.y),this.ctx.stroke(),this.ctx.closePath(),this.points.push(e),this.points.push({x:-1,y:-1}),this.isDown=!1},overwrite:function(){this.ctx.clearRect(0,0,this.$refs.board.width,this.$refs.board.height),this.changeCurrentElectronicSignature({DtMsg:null}),this.changeOriginalSignature(this.$refs.board.toDataURL("image/png")),this.points=[]},commitSure:function(){if(this.originalSignature!=this.$refs.board.toDataURL("image/png")){this.imgUrl=this.$refs.board.toDataURL(),this.signNatureData=this.$refs.board.toDataURL("image/png"),this.changeCurrentElectronicSignature({DtMsg:this.$refs.board.toDataURL("image/png")});Object(o.c)(this.$refs.board.toDataURL());this.changeOriginalSignature(null)}else this.$dialog.alert({message:"请签名",closeOnPopstate:!1}).then(function(){})}})},c={render:function(){var t=this.$createElement,e=this._self._c||t;return e("section",{staticClass:"signature"},[e("div",{staticClass:"signatureBox"},[e("div",{ref:"boardBox",staticClass:"canvasBox",attrs:{currentSinnatureData:this.signNatureData}},[e("canvas",{ref:"board",on:{touchstart:this.touchStart,touchmove:this.touchMove,touchend:this.touchEnd,mousedown:this.mouseDown,mousemove:this.mouseMove,mouseup:this.mouseUp}})])])])},staticRenderFns:[]};var h=i("C7Lr")(a,c,!1,function(t){i("yUW5")},"data-v-25d0e4d1",null);e.a=h.exports},tF8U:function(t,e){},wRpK:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("4YfN"),s=i.n(n),r=i("0eBz"),o=i("0DTB"),a=i("gh9j"),c=(i("sqAx"),i("NxGh")),h=(i("IcnI"),i("yl8L")),u=i("SJI6"),f=i("fdFc"),l=i("EKaR"),d={name:"DepartmentServiceSignature",components:{HeaderTop:r.a,FooterBottom:o.a,VanFieldSelectPicker:h.a,ElectronicSignature:a.a,Loading:c.a},data:function(){return{showLoadingHint:!1,loadinText:"",overlayShow:!1,currentDepartmentId:""}},mounted:function(){var t=this;this.$refs.contentTop.style.zIndex=100,Object(f.b)()||(pushHistory(),this.gotoURL(function(){t.$router.push({path:"departmentWorkOrderDeatils"}),t.changeTitleTxt({tit:"工单详情"}),Object(f.k)("currentTitle","工单详情")})),this.isSingleDepartmentSignature&&this.echoCurrentDepartmentId()},watch:{},computed:s()({},Object(u.mapGetters)(["navTopTitle","currentElectronicSignature","userInfo","originalSignature","departmentServiceMsg","completeDepartmentServiceOfficeInfo","isSingleDepartmentSignature","departmentServiceOfficeId","isCurrentDepartmentServiceVerifySweepCode"]),{userName:function(){return this.userInfo.userName},userTypeId:function(){return this.userInfo.extendData.user_type_id},proId:function(){return this.userInfo.extendData.proId},proName:function(){return this.userInfo.extendData.proName},workerId:function(){return this.userInfo.extendData.userId},name:function(){return this.userInfo.name},taskId:function(){return this.departmentServiceMsg.id}}),methods:s()({},Object(u.mapMutations)(["changeTitleTxt","changeCompleteDepartmentServiceOfficeInfo"]),{backTo:function(){this.$router.push({path:"departmentWorkOrderDeatils"}),this.changeTitleTxt({tit:"工单详情"}),Object(f.k)("currentTitle","工单详情")},echoCurrentDepartmentId:function(){var t=this;try{if(0==this.isCurrentDepartmentServiceVerifySweepCode.length)return;var e=this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter(function(e){return e.taskId==t.taskId})[0]);if(-1==e)return;this.currentDepartmentId=this.isCurrentDepartmentServiceVerifySweepCode[e].number}catch(t){this.$toast(""+t)}},sure:function(){var t=this;this.$refs.mychild.commitSure(),this.currentElectronicSignature!=this.originalSignature&&this.currentElectronicSignature&&(this.$refs.contentTop.style.zIndex=0,this.loadinText="上传中,请稍等···",this.showLoadingHint=!0,this.overlayShow=!0,this.isSingleDepartmentSignature?Object(l.A)({proId:this.proId,taskId:this.taskId,depId:this.currentDepartmentId,depNo:this.departmentServiceOfficeId,imgSign:this.currentElectronicSignature}).then(function(e){t.showLoadingHint=!1,t.overlayShow=!1,e&&200==e.data.code?(t.$toast(""+e.data.data),t.backTo()):t.$toast(""+e.data.msg)}).catch(function(e){t.$dialog.alert({message:""+e.message,closeOnPopstate:!0}).then(function(){}),t.showLoadingHint=!1,t.overlayShow=!1}):Object(l.y)({taskId:this.taskId,imgType:0,imgOrsign:this.currentElectronicSignature}).then(function(e){t.showLoadingHint=!1,t.overlayShow=!1,e&&200==e.data.code?t.updateTaskComplete(t.proId,t.taskId):t.$toast(""+e.data.msg)}).catch(function(e){t.$dialog.alert({message:""+e.message,closeOnPopstate:!0}).then(function(){}),t.showLoadingHint=!1,t.overlayShow=!1}))},updateTaskComplete:function(t,e){var i=this;Object(l.C)(t,e).then(function(t){if(t&&200==t.data.code){i.$toast("该任务已完成");var e=i.completeDepartmentServiceOfficeInfo.filter(function(t){return t.taskId!==i.taskId});i.changeCompleteDepartmentServiceOfficeInfo(e),Object(f.k)("isCompleteDepartmentServiceOfficeInfo",{sweepCodeInfo:e}),i.$router.push({path:"departmentService"}),i.changeTitleTxt({tit:"科室巡检"}),Object(f.k)("currentTitle","科室巡检")}else i.$toast(""+t.data.msg)}).catch(function(t){i.$dialog.alert({message:""+t.message,closeOnPopstate:!0}).then(function(){})})},rewrite:function(){this.$refs.mychild.overwrite()},cancel:function(){this.$refs.mychild.overwrite(),this.$router.push({path:"departmentWorkOrderDeatils"}),this.changeTitleTxt({tit:"工单详情"}),Object(f.k)("currentTitle","工单详情")}})},g={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"content-wrapper"},[i("van-overlay",{attrs:{show:t.overlayShow}}),t._v(" "),i("div",{staticClass:"worker-show"},[i("HeaderTop",{attrs:{title:t.navTopTitle}},[i("van-icon",{attrs:{slot:"left",name:"arrow-left"},on:{click:t.backTo},slot:"left"})],1),t._v(" "),i("div",{staticClass:"loading"},[i("loading",{attrs:{isShow:t.showLoadingHint,textContent:t.loadinText,textColor:"#2895ea"}})],1),t._v(" "),i("div",{ref:"contentTop",staticClass:"content-top"},[i("ElectronicSignature",{ref:"mychild"})],1),t._v(" "),i("div",{staticClass:"content-bottom"},[i("span",{on:{click:t.sure}},[t._v("确认")]),t._v(" "),i("span",{on:{click:t.rewrite}},[t._v("重写")]),t._v(" "),i("span",{on:{click:t.cancel}},[t._v("取消")])])],1)],1)},staticRenderFns:[]};var p=i("C7Lr")(d,g,!1,function(t){i("tF8U")},"data-v-3479867e",null);e.default=p.exports},yUW5:function(t,e){}});