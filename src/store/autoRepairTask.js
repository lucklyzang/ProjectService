import { getDefaultAutoRepairTaskState } from '@/common/js/resetStore'
export default {
    state: getDefaultAutoRepairTaskState(),

    getters: {
        createAutoRepairTaskMessage: (state) => {
            return state.createAutoRepairTaskMessage
        },
        submitAutoRepairTaskMessage: (state) => {
            return state.submitAutoRepairTaskMessage
        }
    },

    mutations: {
        // 保存创建自主报修任务信息
        changeCreateAutoRepairTaskMessage (state, playLoad) {
            state.createAutoRepairTaskMessage = playLoad
        },

        // 保存提交自主报修任务信息
        changeSubmitAutoRepairTaskMessage (state, playLoad) {
            state.submitAutoRepairTaskMessage = playLoad
        },

        //重置自主报修任务状态
        resetAutoRepairTaskState(state) {
            Object.assign(state, getDefaultAutoRepairTaskState())
        }
    },

    actions: {
        resetAutoRepairTaskStore({ commit }) {
            commit('resetAutoRepairTaskState')
        }
    }
}