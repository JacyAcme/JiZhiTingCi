
import { combineReducers } from "redux";
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage';

import { appReducer } from './appReducer'
import { timingReducer } from "./timingReducer";
import { home } from '../features/vocabulary/redux/home'
import { plan } from '../features/vocabulary/redux/plan'
import { mine } from '../features/mine/redux/mine'
import { navReducer } from '../navigation/AppWithNavigationState'


const vocaPlay = require('../features/vocabulary/redux/vocaPlay');
const vocaList = require('../features/vocabulary/redux/vocaList')

const article = require("../features/reading/redux/article");

/** 实现某个reducer的某个状态不想要被持久化 */
const homeConfig = {
    key: 'home',
    storage: AsyncStorage,
    blacklist: ['isLoadPending', 'shouldUpload', 'isUploading']
};
const homeReducer = persistReducer(homeConfig, home)

const vocalibConfig = {
    key: 'plan',
    storage: AsyncStorage,
    blacklist: ['isLoadPending', 'books']
}
const planReducer = persistReducer(vocalibConfig, plan)

const mineConfig = {
    key: 'mine',
    storage: AsyncStorage,
}
const mineReducer = persistReducer(mineConfig, mine)


const reducers = combineReducers({
    app: appReducer,
    timing: timingReducer,
    mine: mineReducer,
    nav: navReducer,
    home: homeReducer,
    plan: planReducer,
    ...vocaPlay,
    ...vocaList,
    //文章模块
    ...article
});

export default reducers;