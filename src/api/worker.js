import request from '@/utils/request'

// 查询是否有新任务
export function getNewWork (proId,workerId) {
  return request({
    url: `baseData/getNew/${proId}/${workerId}`,
    method: 'get'
  })
}

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

// 保存物料信息 
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

/*
 * 
 *  科室巡检
 * 
 * 
*/

// 巡检任务列表查询
export function queryDepartmentServiceList (data) {
  return request({
    url: 'xjTask/xjTaskForApp',
    method: 'get',
    params: data
  })
};

// 查询单条巡检任务信息
export function queryOneDepartmentService(taskId) {
  return request({
    url: `xjTask/xjTaskByIdForApp/${taskId}`,
    method: 'get'
  })
};

// 校验科室
export function verifyDepartment(data) {
  return request({
    url: 'xjTask/verifySpacesXjTask',
    method: 'put',
    data
  })
};

// 根据科室查询检查项
export function queryExamineItems(data) {
  return request({
    url: 'xjDepItem/queryItems',
    method: 'get',
    params: data
  })
};

// 巡检问题上报
export function reportProblem(data) {
  return request({
    url: 'bxTask/reportProblem',
    method: 'post',
    data
  })
};

// 提交检查结果
export function postCheckResult(data) {
  return request({
    url: 'xjResult/submitXjDailyCheckResultForApp',
    method: 'post',
    data
  })
};

// 完成接口(更新任务状态为待签字)
export function updateDepartmentServiceTaskBeSigned(proId,taskId) {
  return request({
    url: `xjTask/updateToCompleteXjTask/${proId}/${taskId}`,
    method: 'put'
  })
};

// 提交签名信息
export function submitDepartMentServiceSignInfo(data) {
  return request({
    url: 'xjImage/submitSignInfoXjTask',
    method: 'post',
    data
  })
};

// 完成接口(更新任务状态为已完成)
export function updateDepartmentServiceTaskBeCompleted(proId,taskId) {
  return request({
    url: `xjTask/signToCompleteXjTask/${proId}/${taskId}`,
    method: 'put'
  })
};

// 查询巡检任务已选择的物料信息
export function queryDepartmentMaterial(taskId) {
  return request({
    url: `xjCheckMaterial/queryMaterial/${taskId}`,
    method: 'get'
  })
};

// 保存巡检任务物料
export function saveDepartmentMate(data) {
  return request({
    url: 'xjCheckMaterial/saveMate',
    method: 'post',
    data
  })
};

/*
 * 
 *  能耗抄录
 * 
 * 
*/

// 查询所有能耗抄录任务
export function queryAllEnergyTask(data) {
  return request({
    url: 'xjEnergyTask/queryAllTask',
    method: 'get',
    params: data
  })
};

// 获取能耗抄录任务
export function ensureEnergyTask(proId,taskId) {
  return request({
    url: `xjEnergyTask/ensure/${proId}/${taskId}`,
    method: 'put'
  })
};

// 查询单条能耗抄录任务
export function queryOneEnergyTask(taskId) {
  return request({
    url: `xjEnergyTask/queryOneTask/${taskId}`,
    method: 'get'
  })
};

// 校验科室
export function verifyEnergyTaskDepartment(data) {
  return request({
    url: 'xjEnergyTask/spacesVerify',
    method: 'put',
    data
  })
};

// 根据设备Id和科室查询设备信息
export function getDeviceMessage(data) {
  return request({
    url: 'xjDevice/getDevice',
    method: 'get',
    data
  })
};

// 保存抄表数据
export function submitMeterReadingData(data) {
  return request({
    url: 'xjCheckResult/submitResult',
    method: 'put',
    data
  })
};