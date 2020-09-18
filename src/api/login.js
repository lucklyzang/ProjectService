import request from '@/utils/request'

// 用户登录
export function logIn(data) {
  return request({
    url: 'login/login',
    method: 'post',
    data,
  })
};

// 用户签退
export function userSignOut(proId,workerId) {
  return request({
    url: `login/signOut/${proId}/${workerId}`,
    method: 'get'
  })
};

// 获取扫码数据字典
export function getDictionaryData (id) {
  return request({
    url: `dict/queryAll/${id}`,
    method: 'get'
  })
}

// 根据条件获取相关运送员信息
export function getWorkerMessage (data) {
  return request({
    url: 'worker/queryWorkersByState',
    method: 'get',
    params: data
  })
}

// 获取科室字典值ID
export function getdepartmentList (proId) {
  return request({
    url: `department/dict/${proId}`,
    method: 'get'
  })
}

// 获取科室字典值编号
export function getdepartmentListNo (proId) {
  return request({
    url: `department/dictNo/${proId}`,
    method: 'get'
  })
}

// 获取科室字典值
export function getDepartmentMsg (proId) {
  return request({
    url: `department/dict/${proId}`,
    method: 'get'
  })
}

// 注册channel
export function registerChannel (data) {
  return request({
    url: 'cloud/register',
    method: 'post',
    data
  })
}
