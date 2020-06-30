<template>
  <div>
    <van-field
      v-model="result"
      :id="getId('currentInput',result)"
      ref="currentField"
      v-bind="$attrs"
      @click="formHandle"
    />
    <van-popup v-model="show" position="bottom">
      <van-picker
        :columns="columns"
        show-toolbar
        :title="$attrs.label"
        @cancel="onCancle"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'VanFieldSelectPicker',
  model: {
    prop: "selectValue"
  },
  props: {
    columns: {
      type: Array
    },
    selectValue: {
      type: String
    }
  },

  data() {
    return {
      show: false,
      result: this.selectValue,
      soleSign: ''
    };
  },

  mounted () {
  },

  methods: {
    getId (idcommon, i) {
      return idcommon + i + this.soleSign;
    }
    ,
    onConfirm(value) {
      this.result = value;
      this.show = !this.show;
    },

    onCancle () {
      this.show = !this.show;
      let tObj = document.getElementById(this.getId('currentInput',this.result));
      let sPos = this.result.length;
      if (tObj.setSelectionRange){
          tObj.setSelectionRange(sPos, sPos);
          tObj.focus();
      } else if(tObj.createTextRange){
        var rng = tObj.createTextRange();
        rng.move('character', sPos);
        rng.select();
      }
    },

    // 表单点击事件
    formHandle () {
      this.soleSign = new Date().getTime();
      this.show = !this.show;
      if (this.columns.length == 0) {
        this.$refs['currentField'].blur();
        this.$dialog.alert({
          message: '暂无历史回显数据可供选择,请手动输入',
          closeOnPopstate: true
        }).then(() => {
          this.$refs['currentField'].focus()
        });
        this.show = false;
      } else {
        this.$refs['currentField'].blur();
      }
    }
  },
  watch: {
    selectValue: function(newVal) {
      this.result = newVal;
    },
    result(newVal) {
      this.$emit("input", newVal);
    }
  }
};
</script>
<style lang='less' scoped>