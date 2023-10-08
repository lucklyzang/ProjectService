import request from '@/utils/request'

// 扫码获取科室id
export function scanDepartment(depId) {
  return request({
    url: `bxTask/isOwn/scan/${depId}`,
    method: 'get'
  })
};

// 完成任务(不签字)
export function completeAutoRepairsTask(data) {
    return request({
      url: 'bxTask/isOwn/add',
      method: 'post',
      data
    })
  };
