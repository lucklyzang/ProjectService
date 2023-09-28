
// 自主任务模块store的初始值
export function getDefaultAutoRepairTaskState() {
    return {
        createAutoRepairTaskMessage: {}, //创建自主报修任务信息(暂存)
        submitAutoRepairTaskMessage: {} //提交自主报修任务信息
    }
}