<template>
	<div class="vue-dropdown">
		<div class="cur-name" @click="curNameClickEvent">
            <span :class="{'spanStyle': current.indexOf('请选择')!=-1}">{{current}}</span>
            <van-icon :name="isShow ? 'arrow-down':'arrow-up'" size="16" />
        </div>
		<div class="list-and-search" :class="isShow?'on':''">
			<div class="search-module clearfix" v-show="isNeedSearch">
				<input class="search-text" @input='search' :value="searchValue" :placeholder="placeholder" />
                <van-icon name="search" size="20" />
			</div>
			<ul class="list-module">
				<li v-for ="(item,index) in datalist" @click="clickItem(item,index)" :key="index" 
				:class="{'liStyle': !multiple ? (item.value == currentFullValue['value']) && currentFullValue['value'] != null : item['selected'],
					'liSelectItemStyle': item.text.indexOf('请选择')!=-1
					}
				">
					<span class="list-item-text">{{ item.text }}</span>
					<span v-show="item.text.indexOf('请选择')==-1 && isShowTaskCompleteMessage">(</span>
					<span v-show="item.text.indexOf('请选择')==-1 && isShowTaskCompleteMessage">{{ `${item.ongoing}` }}</span>
					<span v-show="item.text.indexOf('请选择')==-1 && isShowTaskCompleteMessage">{{ `/ ${item.complete} /` }}</span>
					<span v-show="item.text.indexOf('请选择')==-1 && isShowTaskCompleteMessage">{{ `${item.complete + item.ongoing}` }}</span>
					<span v-show="item.text.indexOf('请选择')==-1 && isShowTaskCompleteMessage">)</span>
				</li>
			</ul>
			<div class="tip-nodata" v-show="searchValue.length && !datalist.length">暂无数据!</div>
			<!-- <div class="operation-btn" v-if="multiple">
				<span @click="isShow = false">取消</span>
				<span @click="sureEvent">确定</span>
			</div> -->
		</div>
	</div>
</template>
 
<script>
 export default {
  name: 'SelectSearch',
  data(){
		return {
			searchValue: '',
			current: '',
			currentFullValue: null,
			datalist:[],
			selectedItem: [],
			isShow:false
		}
  },
  props:{
	  	// 是否多选
		multiple: {
			type: Boolean,
			default: false
		},
		curData: String | Number | null,	// 当前选中数据
		itemData:Array,	// 所有选项数据
		isNeedSearch:{	// 是否需要搜索
			type: Boolean,
			default: true
		},
		isShowTaskCompleteMessage:{	// 是否显示选项后面任务完成情况(列表为运送员)
			type: Boolean,
			default: false
		},
		placeholder:{	// 输入框提示文本
			type: String,
			default: '搜索' 
		},
  },

  watch: {
    curData: {
        handler: function(newVal, oldVal) {
		   //单选
		   if (!this.multiple) {
			 if (newVal == null || !isNaN(newVal)) {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal})[0]['text'] : '';
		   	 	this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal})[0] : null
			 } else {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal['value']})[0]['text'] : '';
		   	 	this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal['value']})[0] : null
			 }
		   } else {
			    if (newVal == null) {
					this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal})[0]['text'] : '';
				} else {
					let temporaryArray = [];
					this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true });
					for (let it of this.datalist) {
						if (it['selected']) {
							temporaryArray.push(it['text'])
						}
					};
					this.current = newVal.length > 0 ? temporaryArray.join(',') : this.itemData[0]['text']
				}
		   }
        },
        deep: true,
		immediate: true
    },
	itemData: {
        handler: function(newVal, oldVal) {
           this.datalist = newVal;
        },
        deep: true,
		immediate: true
    },
	selectedItem: {
        handler: function(newVal, oldVal) {
           if (this.multiple) {
			   if (this.selectedItem.length == 0) {
				   this.current = this.itemData[0]['text']
			   }
		   }
        },
        deep: true,
		immediate: true
    }
  },
  
  created(){
		this.datalist = this.itemData;
		//单选
		if (!this.multiple) {
			if (this.curData == null || !isNaN(this.curData )) {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData})[0]['text'] : '';
				this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData})[0] : null
			} else {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData['value']})[0]['text'] : '';
				this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData['value']})[0] : null
			}
		} else {
			if (this.curData == null) {
					this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData})[0]['text'] : '';
				} else {
					let temporaryArray = [];
					this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true });
					for (let it of this.itemData) {
						if (it['selected']) {
							temporaryArray.push(it['text'])
						}
					};
					this.current = this.curData.length > 0 ? temporaryArray.join(',') : this.itemData[0]['text']
				}
		};
		//点击组件以外的地方，收起
		document.addEventListener('click', (e) => {
			if (!this.$el.contains(e.target)){
				this.isShow = false;
				if (this.multiple) {
					this.$emit('change',this.selectedItem)
				}
			}
		}, false)
  },
  methods:{
        curNameClickEvent () {
            this.isShow = !this.isShow;
            if (this.isShow) {
                this.searchValue = '';
                this.datalist = this.itemData;
				if (this.multiple) {
					if (this.current != null && this.current != this.itemData[0]['text']) {
						let temporaryArray = this.current.split(',');
						this.datalist.forEach((item) => {
							if (temporaryArray.indexOf(item.text) != -1) {
								item.selected = true
							}
						})
					}
				}
            } else {
				if (this.multiple) {
					this.$emit('change',this.selectedItem)
				}
			};
			if (!this.current || this.current == this.itemData[0]['text']) {
				this.datalist.forEach(element => {
					if (element['value']) {
						element['selected'] = false
					}
				})
			}
        },

		search(e){
			this.searchValue = e.target.value;
			//单选
			this.datalist = this.itemData.filter((item)=>{
				return item.text.indexOf(this.searchValue) != -1
			});
			this.itemData.forEach(element => {
				if (element['value']) {
					element['selected'] = false
				}
			})
		},
        
		clickItem(item,index){
			// 单选
			if (!this.multiple) {
				this.current = this.datalist.filter((innerItem) => { return innerItem.value == item.value})[0]['text'];
				this.currentFullValue = this.datalist.filter((innerItem) => { return innerItem.value == item.value})[0];
				this.isShow = false;
				this.$emit('change',item)
			} else {
				if (item['value'] == null) { return };
				this.datalist[index]['selected'] = !this.datalist[index]['selected'];
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true });
				this.$emit('change',this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text'])
				};
				this.current = temporaryArray.join(',')
			}
		},

		// 确定事件
		sureEvent () {
			this.$emit('change',this.selectedItem);
			this.isShow = false;
			console.log('多选',)
		},

		//供父组件调用的清除选择框值的方法
		clearSelectValue () {
			// 单选
			if (!this.multiple) {
				this.current = this.itemData[0]['text'];
				this.currentFullValue = this.datalist[0];
				this.$emit('change',{text:this.itemData[0]['text'],value: null})
			} else {
				this.datalist.forEach((element) => { 
					if (element['value']) {
						element['selected'] = false
					}
				});
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true });
				this.$emit('change',this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text'])
				};
				this.current = temporaryArray.join(',')
			};
			this.datalist = this.itemData
		},

		//供父组件调用的全选的方法
		selectAllValue () {
			if (this.multiple) {
				this.datalist.forEach(element => { 
					if (element['value']) {
						element['selected'] = true
					}
				});
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true });
				this.$emit('change',this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text'])
				};
				this.current = temporaryArray.join(',')
			}
		}
	}
}
</script>
 
<style scoped lang="less">
    @import "~@/common/stylus/variable.less";
    @import "~@/common/stylus/mixin.less";
    @import "~@/common/stylus/modifyUi.less";
	.vue-dropdown {
		width: 100%;
		border-radius:3px; 
		border: 1px solid #ccc;
        background: #fff;
		cursor: pointer;
        box-sizing: border-box;
		user-select:none;
		-webkit-user-select:none; 
		position: relative;
		&._self-show {
			display: block!important;
		}
		.search-module {
			position: relative;
			border-bottom: 1px solid #ccc;
            box-sizing: border-box;
			.search-text {
				width: 100%;
				height: 30px;
				padding: 0 10px 0 30px;
				box-shadow: none;
				outline: none;
                box-sizing: border-box;
				border: none;
			};
			::-webkit-input-placeholder { /* WebKit browsers */ color: #dadada; } :-moz-placeholder { /* Mozilla Firefox 4 to 18 */ color: #dadada; } ::-moz-placeholder { /* Mozilla Firefox 19+ */ color: #dadada; } :-ms-input-placeholder { /* Internet Explorer 10+ */ color: #dadada; }
			/deep/ .van-icon {
				position: absolute;
				top: 50%;
				left: 6px;
                transform: translateY(-50%);
			}
		}
		input::-webkit-input-placeholder{
			font-size: 14px;
		}
		.list-module {
		 max-height: 150px;
		 overflow: scroll;
			li {
                word-break: break-all;
                line-height: 20px;
				// &._self-hide {
				// 	display: none;
				// }
				// padding: 5px 8px;
				// box-sizing: border-box;
				// &:hover {
				// 	cursor:pointer;
				// 	color: #fff;
				// 	background: #00a0e9;
				// };
				>span {
					&:nth-child(1) {
						margin-right: 10px
					};
					&:nth-child(2) {
						color: #101010 !important
					};
					&:nth-child(3) {
						color: #E86F50 !important
					};
					&:nth-child(4) {
						color: #289E8E !important
					};
					&:nth-child(5) {
						color: #174E97 !important
					};
					&:nth-child(6) {
						color: #101010 !important
					}
				}
			};
			.liStyle {
				color: #3B9DF9
			};
			.liSelectItemStyle {
				color: #dadada !important
			}
		}
	}
	.list-and-search{
		display: none;
		z-index: 100;
		background: #fff;
		border: 1px solid #ccc;
		position: absolute;
        box-sizing: border-box;
		width: 100%;
		&.on{
			display: block
		};
		.operation-btn {
		  height: 60px;
          display: flex;
          width: 90%;
          margin: 0 auto;
          align-items: center;
          justify-content: center;
          >span {
              width: 40%;
              display: inline-block;
              height: 35px;
              font-size: 14px;
              line-height: 35px;
              background: #fff;
              text-align: center;
              border-radius: 6px;
              &:nth-child(1) {
                  color: #ccc;
                  margin-right: 40px;
				  box-sizing: border-box;
				  border: 1px solid #ccc
              };
              &:last-child {
                  color: #fff;
				  background: #2390fe
              }
          }
		}
	}
	.cur-name{
		height: 32px;
		line-height: 32px;
		padding: 0 10px;
		position: relative;
		color: #777;
        display: flex;
        >span {
            flex: 1;
            padding-right: 8px;
            box-sizing: border-box;
            .no-wrap()
        };
		.spanStyle {
			color: #dadada !important
		};
        /deep/ .van-icon {
            position: relative;
        };
        /deep/ .van-icon::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%)
        };
		// &:after{
		// 	position: absolute;
		// 	right: 9px;
		// 	top: 13px;
		// 	content: " ";
		// 	width: 0;
		// 	height: 0;
		// 	border-right: 6px solid transparent;
		// 	border-top: 6px solid #7b7b7b;
		// 	border-left: 6px solid transparent;
		// 	border-bottom: 6px solid transparent;
		// }
		// &.show{
		// 	&:after{
		// 		right: 9px;
		// 		top: 6px;
		// 		border-right: 6px solid transparent;
		// 		border-bottom: 6px solid #7b7b7b;
		// 		border-left: 6px solid transparent;
		// 		border-top: 6px solid transparent;
		// 	}
		// }
	}
	.tip-nodata {
		font-size: 14px;
		padding: 10px;
	}
</style>