
<template>
  <div class="contain">
    <div class="posting-uploader">
      <div
        class="posting-uploader-item"
        v-for="(item, nn) in postData"
        :key="nn"
      >
        <img :src="item.content" alt="图片" class="imgPreview" />
        <van-icon
          name="close"
          src=""
          @click="delImg(nn)"
          class="delte"
        />
      </div>
      <van-uploader
        :after-read="onRead"
        :accept="'image/*'"
        v-show=" postData.length <= 2"
        result-type="text"
        v-on:oversize="oversize"
      >
        <img
          :src="defaultPersonPng"
          alt=""
          class="imgPreview"
        />
      </van-uploader>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AfterSaleImage',
  props: {
    UUIDStr: String,
    imageList: Array
  },
  data () {
    return {
      postData: [],
      defaultPersonPng: require('@/common/images/home/default-person.png'),
    }
  },
  mounted () {
    this.postData = this.imageList
  },
  watch: {
    imageList (value) {
      this.postData = value
    }
  },
  methods: {

    delImg (index) {
      // 删除指定下标的图片对象
      if (isNaN(index) || index >= this.postData.length) {
        return false
      }
      // let param = {
      //   id: this.postData[index].id
      // }
      this.$api.deleteFile(this.postData[index].id).then(res => {
        if (res.code === 0) {
          this.postData.splice(index, 1)
          this.$emit('imageListChange', this.postData)
        }
      })
      // let tmp = []
      // for (let i = 0, len = this.postData.length; i < len; i++) {
      //   if (this.postData[i] !== this.postData[index]) {
      //     tmp.push(this.postData[i])
      //   }
      // }
      // this.postData = tmp
    },
     oversize(){
        this.$toast("图片太大了");
    },
    onRead (file) {
      // console.log(file)
      // console.log(file.content.length)
      let formData = new FormData()
      formData.append('file', file.file)
      this.$api.fileUpload(formData, this.UUIDStr).then(res => {
        if (res.code === 0) {
          file.content = res.data.filePath
          file.businessId = res.data.businessId
          file.createDate = res.data.createDate
          file.id = res.data.id
          this.postData.push(file)
          this.$emit('imageListChange', this.postData)
        }else{
          this.$toast(res.msg);
        }
      })
    }

  }
}
</script>

<style scoped>
.contain {
  margin-top: 10px;
  padding-bottom: 10px;
  background-color: white;
  padding-top: 10px;
}

.image {
  width: 50px;
  height: 50px;
}
.uploader {
  display: flex;
  flex-direction: row;
}
.posting-uploader {
  display: flex;
  flex-direction: row;
  margin-left: 14px;
}

.posting-uploader-item {
  display: flex;
  flex-direction: row;
}
.imgPreview {
  width: 70px;
  height: 70px;
}
.delte {
  margin-left: -15px;
  width: 10px;
  height: 10px;
  margin-right: 20px;
}
.upload-img-5 {
  margin: 5px 0 90px 0;
}
.upload-img-1 {
  margin: 5px 0 15px 0;
}
</style>