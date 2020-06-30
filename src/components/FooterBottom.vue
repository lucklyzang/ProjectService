<template>
  <div class="footer">
      <div class="foot-item" v-for="item in itemFooter" :key="item" @click="itemClick(item.itemText, item.name)">
        <img :src="item.imgUrl" alt="">
        <p>{{item.itemText}}</p>
      </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'FooterBottom',
  data () {
    return {
      itemFooter: [
          { itemText: '首页', imgUrl: indexIcon, name: 'home'},{ itemText: '消息', imgUrl: messageIcon, name: ''},
          { itemText: '社区', imgUrl: communityIcon, name: ''},{ itemText: '我的', imgUrl: myIcon, name: 'MyInfo'},
        ]
    };
  },

  components: {},

  computed: {},

  mounted() {},

  methods: {
    ...mapMutations([
      'changeTitleTxt'
    ]),
    itemClick(text, name) {
      if (name) {
        if (text === '首页') {
          this.changeTitleTxt({tit: '医废监测'});
          this.$router.push({path: name});
        } else {
          this.$router.push({path: name});
          this.changeTitleTxt({tit: text})
        }
      }
    }
  }
}

</script>
<style lang='less' scoped>
@import "../common/stylus/variable.less";
@import "../common/stylus/mixin.less";
  .footer {
      width: 100%;
      height: 58px;
      display: flex;
      position: fixed;
      bottom: 0;
      background: @color-theme;
      flex-direction: row;
      flex-wrap: wrap;
      .foot-item {
        flex-direction: column;
        width: 25%;
        height: 58px;
        display: flex;
        align-items: center;
        font-size: 12px;
        justify-content: center;
        img {
          width: 20px;
          height: 20px
        }
        p {
          margin-top: 6px;
          font-size: 14px;
          color: #fff;
        } 
      }
  }  
</style>