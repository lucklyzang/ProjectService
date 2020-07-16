import request from '@/utils/request'

/*
 * 
 *  报修工单
 * 
 * 
*/

// 查询报修项目列表
export function queryRepairsProjectList(data) {
  return request({
    url: 'bxTask/queryTask',
    method: 'get',
    params: data
  })
};

//确认任务
export function sureRepairsTask(data) {
  return request({
    url: 'bxTask/confirm',
    method: 'put',
    data
  })
};

//完成任务(状态为待签字)
export function completeRepairsTask(data) {
  return request({
    url: 'bxTask/completeTask',
    method: 'put',
    data
  })
};

//完成任务(状态为已完成)
export function completeRepairsTaskFinal(data) {
  return request({
    url: 'bxTask/finishTask',
    method: 'put',
    data
  })
};

// 查询单条报修工单
export function queryOneRepairsProject(taskId) {
  return request({
    url: `bxTask/query/${taskId}`,
    method: 'get'
  })
};

// 查询任务关联的物料信息
export function queryMaterialById(taskId) {
  return request({
    url: `bxRepairTaskMaterial/queryMaterial/${taskId}`,
    method: 'get'
  })
};

// 查询所有的物料信息
export function queryAllMaterial(data) {
  return request({
    url: 'bxMaterial/queryAll',
    method: 'get',
    params: data
  })
};

// 退回接口
export function backRepairsTask(data) {
  return request({
    url: 'bxTask/undoTask',
    method: 'put',
    data
  })
};

// 查询退回原因
export function queryBackRepairsTaskReason(data) {
  return request({
    url: 'back/dict',
    method: 'get',
    params: data
  })
};

// 上传图片
export function uploadRepairsTaskPhoto(data) {
  return request({
    url: 'bxRepairTaskImage/batchSave',
    method: 'post',
    data
  })
};

// 查询任务下的图片信息 
export function queryRepairsTaskPhoto(data) {
  return request({
    url: 'bxRepairTaskImage/queryAll',
    method: 'get',
    params:data
  })
};

// 保存物流信息 
export function saveMate(data) {
  return request({
    url: 'bxTask/saveMate',
    method: 'post',
    data
  })
};

// 查询任务数量
export function queryTaskCount (proId,workerId) {
  return request({
    url: `baseData/taskCount/${proId}/${workerId}`,
    method: 'get'
  })
}