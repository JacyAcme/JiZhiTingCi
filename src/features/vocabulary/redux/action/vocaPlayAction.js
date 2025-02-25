

import { createActions } from 'redux-actions';


export const LOAD_TASK = 'LOAD_TASK';                           //加载任务           
export const UPDATE_PLAY_TASK = 'UPDATE_PLAY_TASK'              //修改播放任务
export const CHANGE_SHOW_WORD_INFOS = 'CHANGE_SHOW_WORD_INFOS'  //改变要显示的单词信息数组         

export const CHANGE_PLAY_TIMER = 'CHANGE_PLAY_TIMER';             //暂停播放
export const CHANGE_CUR_INDEX = 'CHANGE_CUR_INDEX';               // 更新当前单词
export const CHANGE_TEST_TIMES = 'CHANGE_TEST_TIMES'              //修改testTimes 测试遍数
export const CHANGE_INTERVAL = 'CHANGE_INTERVAL';                 //控制时间间隔
export const TOGGLE_WORD = 'TOGGLE_WORD';             //控制英文单词显示
export const TOGGLE_TRAN = 'TOGGLE_TRAN';             //控制中文释义显示
export const GET_BGS = 'GET_BGS'                      //获取所有播放背景
export const CHANGE_BG = 'CHANGE_BG';                 //改变背景
export const SHOW_BLUR = 'SHOW_BLUR'                  //是否显示模糊效果
export const CHANGE_THEME = 'CHANGE_THEME'            //改变主题

export const PASS_WORD = 'PASS_WORD';                 //Pass单词
export const CHANGE_NORMAL_TYPE = 'CHANGE_NORMAL_TYPE' //修改normal播放模式的类型
export const CHANGE_HOW_PLAY = 'CHANGE_HOW_PLAY'        //修改播放方式


//修改 playTaskList和playGroupList
export const CHANGE_PLAY_LIST = 'CHANGE_PLAY_LIST'


//切换播放列表下标
export const CHANGE_PLAY_LIST_INDEX = 'CHANGE_PLAY_LIST_INDEX'
export const CHANGE_PLAY_LIST_INDEX_START = 'CHANGE_PLAY_LIST_INDEX_START'
export const CHANGE_PLAY_LIST_INDEX_SUCCEED = 'CHANGE_PLAY_LIST_INDEX_SUCCEED'


export const CLEAR_PLAY = 'CLEAR_PLAY'                 //清空任务


const fn = (payload) => {
  return payload
}

// 驼峰式命名，不可以更改(与变量名必须对应)
export const { loadTask, updatePlayTask, changeShowWordInfos, changePlayTimer,
  changeCurIndex, changeTestTimes, changeInterval, toggleWord, toggleTran,
  changeBg, showBlur, changeTheme, passWord, changeNormalType, changeHowPlay,
  changePlayList, changePlayListIndex, clearPlay } = createActions({

    //加载任务  
    [LOAD_TASK]: (task, showWordInfos) => {
      return { task, showWordInfos };
    },
    //更新任务
    [UPDATE_PLAY_TASK]: (task, showWordInfos) => {
      return { task, showWordInfos };
    },
    //改变需要显示的单词信息数组
    [CHANGE_SHOW_WORD_INFOS]: (showWordInfos) => {
      return { showWordInfos }
    },
    //暂停、播放
    [CHANGE_PLAY_TIMER]: (autoPlayTimer) => {
      return { autoPlayTimer };
    },
    //更新当前单词
    [CHANGE_CUR_INDEX]: fn,
    //更新测试次数
    [CHANGE_TEST_TIMES]: (testTimes) => {
      return { testTimes }
    },
    //改变播放间隔
    [CHANGE_INTERVAL]: (interval) => {
      return { interval };
    },
    //是否显示单词
    [TOGGLE_WORD]: (showWord = null) => {
      return { showWord }
    },
    //是否显示翻译
    [TOGGLE_TRAN]: (showTran = null) => {
      return { showTran }
    },
    // 获取所有背景图
    [GET_BGS]: fn,
    //改变背景
    [CHANGE_BG]: (bgPath) => {
      return { bgPath }
    },
    //是否显示模糊效果
    [SHOW_BLUR]: (showBlur) => {
      return { showBlur }
    },
    //改变主题
    [CHANGE_THEME]: (themeId) => {
      return { themeId };
    },
    //pass单词
    [PASS_WORD]: fn,
    //改变normalType
    [CHANGE_NORMAL_TYPE]: (normalType) => {
      return { normalType }
    },
    //改变播放方式
    [CHANGE_HOW_PLAY]: (howPlay) => {
      return { howPlay }
    },
    // 修改播放列表
    [CHANGE_PLAY_LIST]: fn,
    //修改播放列表播放下标
    [CHANGE_PLAY_LIST_INDEX]: fn,
    // 清空
    [CLEAR_PLAY]: () => {
      return {}
    }

  });

