import request from '@/utils/request'

// 查询运送类型
export function queryTransportType(data) {
  return request({
    url: 'taskType/queryAll',
    method: 'get',
    params: data
  })
};

// 查询运送类型分类
export function queryTransportTypeClass(data) {
  return request({
    url: 'taskTypeClass/queryAll',
    method: 'get',
    params: data
  })
};

// 查询目的地(科室)
export function queryAllDestination(proId) {
  return request({
    url: `department/dict/${proId}`,
    method: 'get'
  })
};
// 查询转运工具
export function queryTransportTools(data) {
  return request({
    url: 'tool/queryAll',
    method: 'get',
    params: data
  })
};
//查询设备信息
export function quereDeviceMessage(data) {
  return request({
    url: 'device/queryOne',
    method: 'get',
    params: data
  })
};
// 生成调度任务
export function generateDispatchTask(data) {
  return request({
    url: 'task/add',
    method: 'post',
    data
  })
};
// 收藏调度任务(经常发起)
export function collectDispatchTask() {
  return request({
    url: '',
    method: 'get'
  })
};
// 调度任务催单
export function taskReminder(proId,taskId) {
  return request({
    url: `task/reminder/${proId}/${taskId}`,
    method: 'get'
  })
};