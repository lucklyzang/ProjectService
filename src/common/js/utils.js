import moment from 'moment'
/**
 * 格式化当前时间
*/
export const formatTime = (formatType) => {
  return moment(new Date().getTime()).format(formatType)
}

/*
 * 存储localStorage
 * @param{String} name key值
 * @param{String} content value值
*/
export const setStore = (name, content) => {
  if (!name) return;
  if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }
  window.localStorage.setItem(name, content);
}

/*
 * 获取localStorage
 * @param{String} name key值
*/
export const getStore = name => {
  if (!name) return;
  return window.localStorage.getItem(name);
}

/*
 * 删除localStorage
 * @param{String} name key值
*/
export const removeStore = name => {
  if (!name) return;
  window.localStorage.removeItem(name);
}

/** 
 * 存储当前历史记录点,实现控制手机物理返回键的按钮事件
*/
export const pushHistory = () => {
  let state = {
    title: '',
    url: ''
  }
  window.history.pushState(state, state.title, state.url)
}

/** 
 * 判断设备的操作系统环境
*/
export const IsPC = () => {
  let flag;
　let system = {
　　win: false,
　　mac: false,
　　xll: false,
　　ipad: false
  };
　//检测平台
　let p = navigator.platform;
  　　system.win = p.indexOf("Win") == 0;
  　　system.mac = p.indexOf("Mac") == 0;
  　　system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
  　　system.ipad = (navigator.userAgent.match(/iPad/i) != null) ? true : false;
　if (system.win || system.mac || system.xll || system.ipad) {
    flag = true
　} else {
    flag = false
　}
  return flag
}

/*
 * 扫码枪绑定方法
 * @param{Function} callback 回调函数
*/
export const scanCode = (callback) => {
  var code = '';
  var lastTime, nextTime;
  var lastCode, nextCode;
  var that = this;
  window.document.onkeypress = function(event) {
    if (window.event) { // IE
        nextCode = event.key;
    } else if (event.which) { // Netscape/Firefox/Opera
        nextCode = event.which
    }
    if (event.which === 13) {
      if (code.length < 3) {// 手动输入的时间不会让code的长度大于2，所以这里只会对扫码枪有
          return
      }
      // code = decodeURIComponent(code);
      console.log('扫码结束: ' + code);
      callback(code);
      //TODO
      code = '';
      lastCode = '';
      lastTime = '';
      return
    }
    nextTime = new Date().getTime();
    if (!lastTime && !lastCode) {
      console.log('扫码开始。。。');
      code += event.key;
    }

    if (lastCode && lastTime && nextTime - lastTime > 500) { // 当扫码前有keypress事件时,防止首字缺失
      console.log('防止首字缺失。。。');
      code = event.key
    } else if (lastCode && lastTime) {
      console.log('扫码中。。。');
      code += event.key
    }
    lastCode = nextCode;
    lastTime = nextTime;
  }
}

/*
 * 验证输入重量是否合法正则
*/
export const testWeight = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/

/*
 * 扫码后从字典中取值
 * @param{Object} data 字典数据
 * @param{String} key key值
*/
export const Dictionary = (data, key) => {
  return data[key] ? data[key] : undefined
}

/*
 * 判断数据是否为JSON类型
 * @param{Object} data
*/

export const judgeDataType = (data) => {
  var flag;
  if (typeof(data) == "object" && Object.prototype.toString.call(data) == "[object Object]" && !data.length) {
    flag = true
  } else {
    flag = false
  }
  return flag
}

/*
 * 判断数组对象中每项某个key对应value是否相同
 * @param{Array} data
 * @param{String} key 
*/

export const judgeKeyEquail = (data,key) => {
  var flag = true;
  if (!(Object.prototype.toString.call(data) === '[object Array]')) {
    return
  };
  if (data.length > 0) {
    for (var i=1, len = data.length; i< len; i++) {
      var assignItem = data[0][key];
      if (data[i][key] !== assignItem) {
        flag = false;
        break
      }
    }
  } else {
    flag = true
  }
  return flag
}

/*
 * 合并医废类型、重量、医废收集时间
 * @param{Array} typeArr 医废类型
 * @param{Array} weightArr 医废重量
 * @param{Array} timeArr 收集时间
*/

export const dealMedicalWaste = (typeArr, weightArr, timeArr) => {
  const typeTarget = [];
  const weightTarget = [];
  const timeTarget = [];
  let index = 0;
  const indexMap = {};

  for (let i = 0, len = typeArr.length; i < len; i += 1) {
    const type = typeArr[i];
    let curTypeIndex = -1;
    if (type in indexMap) {
      curTypeIndex = indexMap[type]
    } else {
      curTypeIndex = indexMap[type] = index++;
      typeTarget[curTypeIndex] = type;
      weightTarget[curTypeIndex] = 0;
      timeTarget[curTypeIndex] = null
    };
    weightTarget[curTypeIndex] = weightTarget[curTypeIndex] + weightArr[i];
    timeTarget[curTypeIndex] = timeArr[i]
  };
  return [typeTarget, weightTarget, timeTarget]
}

/* 
  * 合并医废类型、重量
  * @param{Array} wasteType 医废类型
  * @param{Array} wasteWeight 医废重量
*/
export const dealMedicalWast = (wasteType,wasteWeight) => {
  let map = {};
  wasteType.forEach((value, index) => {
    Object.prototype.hasOwnProperty.call(map, value) || (map[value] = 0);
    map[value] += Number(wasteWeight[index]);
  });
  return map
}

/* 
  * 数组去重
  * @param{Array} currentArr
*/
export const checkEmptyArray = (currentArr) => {
  var arr = [];
  currentArr.map(function(val, index) {
    //过滤规则为，不为空串、不为null、不为undefined，也可自行修改
    if (val !== "" && val != undefined) {
      arr.push(val);
    }
  });
  return arr;
}

/* 
  * Base64编码转换图片
  * @param{String} dataurl base编码字符串
  * @param{String} filename 文件名称
*/
export const base64ImgtoFile = (dataurl, filename = 'file') => {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let suffix = mime.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime
  })
}

/* 
  * 引用类型数据深度克隆
  * @param{Array || Object} obj
*/
export const deepClone = (obj) => {
  let newObj=Array.isArray(obj)?[]:{}
  if(obj&&typeof obj ==="object"){
    for(let key in obj){
      if(obj.hasOwnProperty(key)){
        newObj[key]=(obj && typeof obj[key]==='object')?deepClone(obj[key]):obj[key];
      }
    }
  }
  return newObj
}

/* 
  * 根据标本id查询标本名称
  * @param{Array} sampleArray 标本信息对象数组
  * @param{String} sampleId 标本ID值
*/
export const querySampleName = (sampleArray,sampleId) => {
  if (!Array.isArray(sampleArray)) {return};
  let targetSmple = sampleArray.filter((item) => {
    return item.value == sampleId
  });
  return targetSmple[0].text
}

/* 
  * 数组去重方法
  * @param{Array} targetArray
*/
export const repeArray = (targetArray) => {
  if (!Array.isArray(targetArray)) {return};
  var result = [],
  len = targetArray.length;
  targetArray.forEach(function(v, i ,targetArray){  //这里利用map，filter方法也可以实现
    var bool = targetArray.indexOf(v,i+1);  //从传入参数的下一个索引值开始寻找是否存在重复
    if(bool === -1){
      result.push(v);
    }
    });
  return result;
}

/* 
  * 数组去重方法(重复2的对象)
  * @param{Array} obj
*/
export const deteleObject = (obj) => {
  var uniques = [];
  var stringify = {};
  for (var i = 0; i < obj.length; i++) {
      var keys = Object.keys(obj[i]);
      keys.sort(function(a, b) {
          return (Number(a) - Number(b));
      });
      var str = '';
      for (var j = 0; j < keys.length; j++) {
          str += JSON.stringify(keys[j]);
          str += JSON.stringify(obj[i][keys[j]]);
      }
      if (!stringify.hasOwnProperty(str)) {
          uniques.push(obj[i]);
          stringify[str] = true;
      }
  }
  uniques = uniques;
  return uniques;
}

/* 
  * 去除包裹的大括号
  * @param{String} str
*/
export const removeBlock = (str) => {
  if (str) {
    let reg = /^\{/gi;
    let reg2 = /\}$/gi;
    str = str.replace(reg,"");
    str = str.replace(reg2,"");
    return str;
  } else {
    return str;
  }
}

/* 
  * 生成UUID
*/
export const UUID = () => {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

/* 
  * 去除两个数组的相同值
  * @param{Array} a
  * @param{Array} b
*/
export const arrayDiff = (a, b) => { 
  for(let i=0; i<b.length; i++) { 
    for(let j=0; j<a.length; j++) { 
      if(a[j] == b[i]){ 
        a.splice(j,1); 
        j=j-1; 
      } 
    } 
  } 
  return a; 
}

/* 
  * 压缩图片
  * @param{String} originSite base64字符串
  * @param{Function} callback 压缩成功后的回调函数
*/
export const compressImg = (originSite,callback) => {
  let image = new Image(); //新建一个img标签（还没嵌入DOM节点)
  image.src = originSite;
  image.onload = function() {
    let canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
    let x = image.width/500;  //压缩倍数
    if (image.width > 500) {
      var imageWidth = image.width / x;   //压缩后图片的大小
      var imageHeight = image.height / x;
    } else {
      var imageWidth = image.width / 1;   //不进行压缩大小
      var imageHeight = image.height / 1;
    };
    let data = '';
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    context.drawImage(image, 0, 0, imageWidth, imageHeight);
    data = canvas.toDataURL('image/jpeg');
    callback(data)
  }
}

/* 
  * 压缩图片
  * @param{String} img 图片对象
*/
export const compress = (image,Orientation) => {
  // let canvas = document.createElement("canvas");
  // let ctx = canvas.getContext('2d');
  // //创建canvas
  // let tCanvas = document.createElement("canvas");
  // let tctx = tCanvas.getContext("2d");
  // let initSize = img.src.length;
  // let width = img.width;
  // let height = img.height;
  // //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
  // let ratio;
  // if ((ratio = width * height / 4000000) > 1) {
  //   console.log("大于400万像素")
  //   ratio = Math.sqrt(ratio);
  //   width /= ratio;
  //   height /= ratio
  // } else {
  //   ratio = 1;
  // };
  // canvas.width = width;
  // canvas.height = height;
  // //铺底色
  // ctx.fillStyle = "#fff";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // //如果图片像素大于100万则使用canvas绘制
  // let count;
  // if ((count = width * height / 1000000) > 1) {
  //   count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
  //   //计算每块canvas的宽和高
  //   let nw = ~~(width / count);
  //   let nh = ~~(height / count);
  //   tCanvas.width = nw;
  //   tCanvas.height = nh;
  //   for (let i = 0; i < count; i++) {
  //     for (let j = 0; j < count; j++) {
  //         tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
  //         ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
  //     }
  //   }
  // } else {
  //   ctx.drawImage(img, 0, 0, width, height);
  // };
  // //进行最小压缩
  // let ndata = canvas.toDataURL('image/jpeg', 0.3);
  // tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
  // return ndata
    let canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
    let x = image.width/500;  //压缩倍数
    if (image.width > 500) {
      var imageWidth = image.width / x;   //压缩后图片的大小
      var imageHeight = image.height / x;
    } else {
      var imageWidth = image.width / 1;   //不进行压缩大小
      var imageHeight = image.height / 1;
    };
    let data = '';
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    context.drawImage(image, 0, 0, imageWidth, imageHeight);
    data = canvas.toDataURL('image/jpeg');
    return data
}

/* 
  * 将数组中符合条件的元素移到最前面
  * @param{Array} arr
  * @param{String} key 
*/
export const changeArrIndex = (arr,key) => {
  let deleteItem = [];
  for (let i = 0; i < arr.length; i++) {
		if (arr[i]['text'] === key) {
      deleteItem = arr.splice(i, 1);
      arr.unshift(deleteItem[0]);
			break;
		}
	};
  return arr
}

/*
 * 判断时间是否超时
 * @param{String} startTime YYYY-mm-dd HH:MM:ss 开始时间 
 * @param{Number} interVal minute 计划用时
 * @return {Boolean} 返回true或false
*/
export const judgeOverTime = (startTime,interVal) => {
  let isOverTime = false
  let startMillisecond = new Date(startTime).getTime();
  let audio = new Audio();
  audio.preloadc = "auto";
  process.env.NODE_ENV == 'development' ? audio.src = "/static/audios/task-info-voice.wav" : audio.src = "/transWeb/static/audios/task-info-voice.wav";
  let interValModule = setInterval(() => {
    let realMillisecond = new Date().getTime();
    if (realMillisecond - startMillisecond >= interVal*60*1000) {
      isOverTime = true;
      // 播放预警提示
      audio.play();
      clearInterval(interValModule)
    }
  },1000);
  return isOverTime
}

/*
 * 判断时间大小
 * @param{String} t1 HH:MM 时间1 
 * @param{String} t2 HH:MM 时间2
 * @return {Boolean} 返回true或false
*/

export const compareDateTime = (t1,t2) => {
  let date = new Date();
  let a = t1.split(":");
  let b = t2.split(":");
  return date.setHours(a[0],a[1]) <= date.setHours(b[0],b[1]);
}

/*
 * 
 *  清空所有LocalStorage
 * 
 * 
*/

export const removeAllLocalStorage = () => {
  removeStore('currentTitle');
  // removeStore('userName');
  // removeStore('userPassword');
  removeStore('userInfo');
  removeStore('isLogin');
  removeStore('userType');
  removeStore('newTaskList');
  removeStore('completPhotoInfo'),
  removeStore('isFillMaterialList');
  removeStore('isDepartmentServiceVerifySweepCode'),
  removeStore('isCurrentDepartmentServiceVerifySweepCode'),
  removeStore('isCompleteDepartmentServiceOfficeInfo'),
  removeStore('isCompleteDepartmentServiceCheckedItemList'),
  removeStore('energyRecordList'),
  removeStore('isCurrentDeviceCopyServiceVerifySweepCode'),
  removeStore('isCompleteDeviceEnergyRecordServiceOfficeInfo')
}

/*
 * 
 *  任务优先级转换
 * @param{Number} index
 * 
*/

export const priorityTransfer = (index) => {
  switch(index) {
    case 1 :
      return '正常'
      break;
    case 2 :
      return '重要'
      break;
    case 3 :
      return '紧急'
      break;
    case 4 :
      return '紧急重要'
      break;
    default:
      return '无'
  }
}

