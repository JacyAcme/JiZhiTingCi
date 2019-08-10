import { createActions } from 'redux-actions';


export const CHANGE_BGTHEME = 'CHANGE_BGTHEME'                      //改变背景主题
export const CHANGE_FONT_SIZE = 'CHANGE_FONT_SIZE'                      //改变字号
export const TOGGLE_KEY_WORDS = 'TOGGLE_KEY_WORDS'                      //控制显示关键词
export const CHANGE_USER_ANSWER_MAP = 'CHANGE_USER_ANSWER_MAP'                //改变用户答案


//驼峰式命名，不可以更改(与变量名必须对应)
export const {changeBgtheme, changeFontSize, toggleKeyWords, changeUserAnswerMap} = createActions({
    //改变主题
    [CHANGE_BGTHEME]: (index)=>{
        return {themeIndex:index}
    },
    //改变字号
   [CHANGE_FONT_SIZE]: (fontRem)=>{
        return {fontRem}
   },
   [TOGGLE_KEY_WORDS]: ()=>{
       return {}
   },
   [CHANGE_USER_ANSWER_MAP]: (userAnswerMap)=>{
        return {userAnswerMap}
   }
    
});
