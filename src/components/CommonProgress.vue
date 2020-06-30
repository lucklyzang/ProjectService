<template>
  <div class="progress-wrapper" :style="wrappeStyle">
    <div class="inner-box" :style="innerBox"></div>
    <div class="inner-circle" :style="innerCircle"></div>
  </div>
</template>

<script>
export default {
  name: 'CommonProgress',
  data () {
    return {
    };
  },

  computed: {
    innerBox () {
      return  {
        background: `${this.innerColor}`,
        width: `${this.percentage}%`,
        height: `${this.innerHeight}`,
        borderRadius: '4px'
      };
    },
    wrappeStyle () {
      return {
        height: `${this.innerHeight}`,
        background: `${this.outerColor}`
      };
    },
    innerCircle () {
      return {
        background: `${this.innerColor}`,
        left: `${Number(this.percentage)-2}%`
      };
    }
  },
  props: {
    percentage: {
      type: String,
      default: '0'
    },
    outerColor: {
      type: String,
      default: '#e4e3e3'
    },
    innerColor: {
      type: String,
      default: '#38bdd0'
    },
    innerHeight: {
      type: String,
      default: '8px'
    }
  },

  components: {},

  mounted () {},

  methods: {}
}

</script>
<style lang='less' scoped>
  .progress-wrapper {
    position: relative;
    border-radius: 4px;
    width: 100%;
    .innerBox {
      position: absolute;
      top: 0;
      left: 0;
    }
    .inner-circle {
      position: absolute;
      left: 0;
      top: -3.5px;
      transform: scale(.5);
      transform-origin: 0% top;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }
  }
</style>