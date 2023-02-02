<template>
  <div>
    <div
      v-if="show"
      class="picker"
    >
      <section class="picker-main" ref="pickerMain" :class="{'picker-box-activate': show,'picker-box-inertia': !show}">
        <h3 ref="chooseBox">
          {{ title }}
          <van-icon name="cross" size="25" @click="close" />
        </h3>
        <div class="search-box" v-show="isShowSearch" ref="searchBox">
            <van-search
                v-model="searchValue"
                show-action
                placeholder="请输入关键词进行搜索"
            >
            <template #action>
                <div @click="onSearch">搜索</div>
            </template>
            </van-search>
        </div>
        <ul ref="ul">
          <li
            v-for="(item, index) in list"
            :key="index"
            :class="{'active':active == item.id}"
            :ref="'li'+item.id"
          >{{item.text}}</li>
        </ul>
        <div class="button-box" ref="buttonBox">
            <span @click="resetEvent" v-show="isShowReset">重置</span>
            <span @click="cancel" v-show="!isShowReset">取消</span>
            <span @click="sure">确认</span>
        </div>
        <van-empty description="暂无数据" v-show="list.length == 0" />
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScrollSelection',
  props:{
    // 顶部标题
    title: {
      type: String,
      default: '请选择'
    },
    // 滚动展示的数据 格式[{id: '',text:''}]
    columns: {
      type: Array,
      default: []
    },
    // 是否显示搜索框
    isShowSearch: {
      type: Boolean,
      default: false
    },
    // 是否显示重置按钮
    isShowReset: {
      type: Boolean,
      default: false
    }
  }, 
  data() {
    return {
      isClickSearch: false,
      searchValue: '',
      cacheList: '',
      list: [],
      show: false,
      active: null,
      city: "",
      listOffsetTop: [],
      timer: null
    };
  },

   watch: {
      columns: {
        handler: function(newVal, oldVal) {
          // 点击搜索时不进行监听
          if (!this.isClickSearch) {
            this.list = this.columns;
            this.cacheList = this.list;  
            this.showPicker()
          }
        },
        deep: true
    },
  },

  mounted () {
    this.list = this.columns;
    this.cacheList = this.list;  
    this.showPicker()
  },

  methods: {

    // 搜索事件
    onSearch(val) {
      this.isClickSearch = true;
      this.list = this.cacheList.filter((item) => { return item.text.indexOf(this.searchValue) != -1});
      this.list.map((item,index) => { item.id = index });
      this.showPicker()
    },

    // 重置事件
    resetEvent () {
        this.searchValue = '';
        this.list = this.cacheList;
        this.list.map((item,index) => { item.id = index });
        this.showPicker()
    },

    // 初始化事件
    showPicker() {
      this.show = true;
      this.active = null;
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.getOffsetTop();
        this.computeActive();
        this.list = this.cacheList.filter((item) => { return item.text.indexOf(this.searchValue) != -1});
        this.list.map((item,index) => { item.id = index })
      }, 50)
    },

    // 确认事件
    sure() {
      this.list.map((item, index) => {
        item.id == this.active ? (this.city = item.text) : null
      });
      this.$emit('sure',this.city);
      // 没有搜索结果时点确认
      if (this.list.length == 0) {
        this.$emit('sure',null)
      };
      this.show = false
    },

    // 关闭事件
    close () {
      this.$emit('close',this.city);
      this.show = false
    },

    // 取消事件
    cancel() {
      this.$emit('cancel',this.city);
      this.show = false
    },

    getOffsetTop() {
      this.listOffsetTop = [];
      this.list.map((item, index) => {
        let liTop = this.$refs["li" + item.id];
        this.listOffsetTop.push(liTop[0].offsetTop - liTop[0]['offsetHeight']);
        console.log('偏移数据',this.listOffsetTop)
      });
    },

    computeActive() {
      let scroll = this.$refs.ul;
      let buttonBoxHeight = this.$refs.buttonBox.offsetHeight;
      let searchBoxHeight = this.$refs.searchBox.offsetHeight;
      let chooseBoxHeight = this.$refs.chooseBox.offsetHeight;
      scroll.addEventListener("scroll", () => {
        this.listOffsetTop.map((item, index) => {
         let currentTop = '';
         if (this.isShowSearch) {
            currentTop = scroll.scrollTop + buttonBoxHeight + searchBoxHeight + chooseBoxHeight + 20
         } else {
            currentTop = scroll.scrollTop + buttonBoxHeight + chooseBoxHeight + 20
         };
        item <= currentTop ? (this.active = index) : null
        })
      })
    }
  }
};
</script>
<style lang="less" scoped>
.picker {
  background-color: rgba(0,0,0,.7);
  max-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  .picker-main {
    width: 100%;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 20px 10px;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    background-color: #fff;
    /deep/ .van-empty {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        .van-empty__description {
            padding: 0 
        }
    };
    h3 {
      display: flex;
      justify-content: space-around;
      font-size: 18px;
      line-height: 40px;
      color: #101010;
      height: 40px;
      position: relative;
      /deep/ .van-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 0
      }
    };
    .search-box {
        /deep/ .van-search  {
            .van-search__content  {
                border-radius: 20px
            };
            .van-search__action {
              color: #3B9DF9;
              font-size: 14px
            }
        }
    };
    ul {
      max-height: 200px;
      padding: 100px 0;
      box-sizing: border-box;
      margin: 0;
      overflow: auto;
      background-color: #fff;
      li {
        list-style: none;
        color: #101010;
        font-size: 18px;
        line-height: 40px;
        text-align: center;
        height: 40px;
        background-color: #fff;
      }
    };
    .button-box {
        height: 60px;
        display: flex;
        width: 100%;
        margin: 0 auto;
        align-items: center;
        justify-content: center;
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
                color: #1864FF;
                box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
                margin-right: 40px
            };
            &:nth-child(2) {
                color: #1864FF;
                box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
                margin-right: 40px
            };
            &:last-child {
                color: #fff;
                background: linear-gradient(to right, #6cd2f8, #2390fe);
                box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            }
        }
    }
  };
  // 渐出动画
  .picker-box-activate {
    transition: 0.6s all;
    transform: translateY(0%);
    opacity: 1;
    visibility: visible
  };
  // 渐入动画
  .picker-box-inertia {
    transition: 0.6s all;
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden
  }
};  
.active {
  background-color: #f3f3f3 !important;
  color: #3B9DF9 !important
}
</style>