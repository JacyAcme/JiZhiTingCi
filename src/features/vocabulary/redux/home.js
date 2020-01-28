
import * as ha from './action/homeAction'
import * as vga from './action/vocaGroupAction'
import _util from "../../../common/util";
import * as Constant from "../common/constant";
import { LOGOUT, CHANGE_CONFIG_REVIEW_PLAY_TIMES } from '../../mine/redux/action/mineAction'
import VocaTaskDao from "../service/VocaTaskDao";

const defaultState = {
    //任务数组
    tasks: [],
    //状态
    isLoadPending: false,
    //上传同步的状态
    isUploading: false,
    //上传同步失败
    isUploadFail: false,


}

export const home = (state = defaultState, action) => {
    switch (action.type) {
        //加载任务
        case ha.LOAD_TASKS_START:
            return { ...state, isLoadPending: true }
        case ha.LOAD_TASKS_SUCCEED:

            return {
                ...state, tasks: action.payload.tasks,
                isLoadPending: false,
                isUploadFail: false,

            };
        //更新任务
        case ha.UPDATE_TASK:
            const task = action.payload.task
            const tasks = state.tasks.map((item, i) => {
                if (item.taskOrder === task.taskOrder && item.status === task.status) { //要更新的
                    return task
                } else {
                    return item
                }
            })

            console.log('----redudx: after update tasks-----------')
            // console.log(tasks)
            // //保存至本地
            return { ...state, tasks }
        //上传单词任务
        case ha.SYNC_TASK_START:
            return { ...state, isUploading: true }
        case ha.SYNC_TASK_SUCCEED:
            console.log('--------同步任务成功的 tasks:------------------')
            // console.log(state.tasks)
            return { ...state, isUploading: false, isUploadFail: false }
        case ha.SYNC_TASK_FAIL:
            console.log('--------同步任务失败的 tasks: -------------')
            // console.log(state.tasks)
            return { ...state, isUploading: false, isUploadFail: true }
        case ha.UPDATE_SCORE:
            const { id, taskOrder, score } = action.payload.userArticle
            VocaTaskDao.getInstance().modifyArticle(action.payload.userArticle)
            const newTasks = state.tasks.map((task, i) => {
                if (task.taskType === Constant.TASK_ARTICLE_TYPE && task.id === id) {
                    task.score = score
                } else if (task.taskType === Constant.TASK_VOCA_TYPE && task.taskOrder === taskOrder) {
                    const articles = JSON.parse(task.articles)
                    for (let art of articles) {
                        if (art.id === id) {  //同一篇文章
                            art.score = score
                        }
                    }
                    task.articles = JSON.stringify(articles)
                }
                return task
            })
            return { ...state, tasks: newTasks }
        // 上传生词本数据
        case vga.SYNC_GROUP_START:
            console.log('------开始同步生词本-------')
            return { ...state, isUploading: true }
        case vga.SYNC_GROUP_SUCCEED:
            console.log('--------同步生词本成功: -------------')
            return { ...state, isUploading: false, isUploadFail: false }
        case vga.SYNC_GROUP_FAIL:
            console.log('--------同步生词本失败: -------------')
            return { ...state, isUploading: false, isUploadFail: true }
        // 修改配置的复习轮播遍数
        case CHANGE_CONFIG_REVIEW_PLAY_TIMES:
            const newTasks2 = state.tasks.map((task, index) => {
                if (task.taskType === Constant.TASK_VOCA_TYPE) {
                    if (task.status !== Constant.STATUS_0 && task.progress === Constant.IN_REVIEW_PLAY) {
                        //复习轮播任务
                        let leftTimes = task.leftTimes >= action.payload.configReviewPlayTimes ?
                            action.payload.configReviewPlayTimes : task.leftTimes
                        return {
                            ...task,
                            curIndex: 0,
                            leftTimes,
                        }

                    } else {
                        //新学任务 or 复习非轮播任务
                        return task
                    }
                } else {
                    return task
                }
            })
            return { ...state, tasks: newTasks2 }
        // 退出登录
        case LOGOUT:
            return defaultState
        default:
            return state
    }
}
