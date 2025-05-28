<template>
  <div class="loading-hint">
   <div>双向数据绑定:{{ value666 }}</div>
   <div><button @click="addValue">点击++</button></div>
  </div>
</template>

<script>
export default {
  name: 'TestComponent',
  props: {
    value666 : {
      type: Number,
      default: 0
    }
  },
  model: {
    prop: 'value666',
    event: 'updateValue666'
  },
  data () {
    return {
    };
  },
  components: {},

  computed: {},

  mounted () {
  },

  methods: {
    addValue () {
      this.$emit('updateValue666',this.value666+1)
    }
  }
}

</script>
<style lang='less' scoped>
@import "../common/stylus/variable.less";
@import "../common/stylus/modifyUi.less";
@import "../common/stylus/mixin.less";
.loading-hint {
  .init-height();
}
</style>