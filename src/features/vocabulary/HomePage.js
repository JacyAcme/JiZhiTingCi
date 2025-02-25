import React, { Component } from 'react';
import { Platform, StatusBar, AppState, BackHandler, Image, View, Text } from 'react-native';
import { connect } from 'react-redux'
import Drawer from 'react-native-drawer'
import { Button } from 'react-native-elements'
import SplashScreen from 'react-native-splash-screen';

import PushUtil from '../../modules/PushUtil'
import styles from './HomeStyle'
import HomeDrawerPanel from './component/HomeDrawerPanel'
import HomeHeader from './component/HomeHeader'
import Task from './component/Task'
import HomeFooter from './component/HomeFooter'
import * as HomeAction from './redux/action/homeAction'
import * as PlanAction from './redux/action/planAction'
import * as VocaPlayAction from './redux/action/vocaPlayAction'
import * as VocaGroupAction from './redux/action/vocaGroupAction'
import * as MineAction from '../mine/redux/action/mineAction'
import _util from '../../common/util'
import { BY_REAL_TASK, TASK_VOCA_TYPE } from "./common/constant";
import gstyles from '../../style';
import AliIcon from '../../component/AliIcon';
import ShareTemplate from '../../component/ShareTemplate';
import VocaTaskService from './service/VocaTaskService';

class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            appState: AppState.currentState
        }
        this.vtService = new VocaTaskService()
        console.disableYellowBox = true
    }

    componentDidMount() {
        // 监听物理返回键
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._onBackButtonPressAndroid)
        // 监听App状态
        AppState.addEventListener('change', this._handleAppStateChange);
        // 检查时间 
        _util.checkLocalTime().then((isTimeRight) => {
            if (isTimeRight) {
                // 初始化
                this._init()
                // 完成全部任务
                this._judgeFinishAllTasks()
            } else {
                const timeError = new Error()
                timeError.name = "TimeError"
                this.props.setErrorInLoadTask({
                    error: timeError
                })
            }
        })

    }
    componentWillUnmount() {
        this.backHandler && this.backHandler.remove('hardwareBackPress');
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _onBackButtonPressAndroid = () => {
        if (this.state.modalVisible === true) {
            this.props.app.commonModal.hide()
            this._closeDrawerPanel()
            return true
        } else {
            if (this.props.navigation.isFocused()) {
                if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                    //最近2秒内按过back键，可以退出应用。
                    return false;
                }
                this.lastBackPressed = Date.now();
                this.props.app.toast.show('再按一次退出应用', 1000);
                return true;
            }
        }
    }


    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            SplashScreen.hide()
            console.log('App 到前台')
        }
        if (this.state.appState.match(/active/) && nextAppState === 'background') {
            console.log('App 到后台')
        }
        this.setState({ appState: nextAppState });
    }


    _init = async () => {
        // 加载今日数据
        const { plan, leftDays, allLearnedDays, learnedTodayFlag } = this.props.plan
        const { lastLearnDate, taskCount, taskWordCount } = plan
        const today = _util.getDayTime(0)
        console.log('lastLearnDate : ' + lastLearnDate)
        console.log('today : ' + today)
        if (lastLearnDate && (today > (lastLearnDate + 1000) || IsLoginToHome)) {  //任务过期or登录进入
            // 设置登录进入首页变量=false
            if (IsLoginToHome) {
                IsLoginToHome = false
            }
            // 如果是任务播放，则清空VocaPlay
            if (this.props.vocaPlay.normalType === BY_REAL_TASK) {
                this.props.clearPlay()
            }
            // 1.获取今日任务
            this.props.loadTasks({
                lastLearnDate,
                taskCount,
                taskWordCount,
            })

            // 2.同步任务
            this.props.syncTask(null)
            // 3.同步：累计学习天数
            if (learnedTodayFlag !== today && leftDays >= 0) {
                console.log('同步天数')
                this.props.synAllLearnedDays({ allLearnedDays: allLearnedDays + 1 })
            }
        } else if (today === lastLearnDate) {
            if (this.props.home.errorInLoadTask) {
                this.props.setErrorInLoadTask({
                    error: null
                })
            }
        } else {
            const timeError = new Error()
            timeError.name = "TimeError"
            this.props.setErrorInLoadTask({
                error: timeError
            })
        }

        //监听极光推送
        this._listenPush()
    }
    /**极光推送 */
    _listenPush() {
        //通知回调
        PushUtil.addNotificationListener(result => {
            console.log("notificationListener:" + JSON.stringify(result))
            const { msgType } = result.extras
            console.log(result.extras)
            if (msgType === 'ArticleMessage') {
                //改变hasNewMessage
                this.props.changeHasNewMessage({
                    hasNewMessage: true
                })
            }
        });
    }

    _judgeFinishAllTasks = async () => {
        const judgeFinishAllTasks = this.props.navigation.getParam('judgeFinishAllTasks', false)
        console.log('完成任务后--judgeFinishAllTasks : ' + judgeFinishAllTasks)

        if (judgeFinishAllTasks) {
            //1.判断
            let isAllFinished = true
            for (let item of this.props.home.tasks) {
                //判断是否是单词任务
                const isVocaTask = (item.taskType === TASK_VOCA_TYPE)
                console.log(item.progress)
                if (isVocaTask && !item.progress.endsWith('_FINISH')) {
                    isAllFinished = false
                    break
                }
            }
            console.log('完成任务后--isAllFinished : ' + isAllFinished)
            if (isAllFinished) {
                //2.修改数据
                const { finishedBooksWordCount } = this.props.plan
                this.props.synFinishDays({
                    allLearnedCount: finishedBooksWordCount + this.vtService.countLearnedWords()
                })
                //加载打卡天数
                const signDays = await Storage.getAllDataForKey('finishDays')
                console.log('--signDays--')
                console.log(signDays)
                // 3.弹出分享页面
                this._share(true, signDays.length)
            }

        }

    }

    _closeDrawerPanel = () => {
        this._drawer.close()
        this.setState({ modalVisible: false })
    };
    _openDrawerPanel = () => {
        this._drawer.open()
        this.setState({ modalVisible: true })
    };

    _renderShareContentView = (signDaysCount) => {
        const learnedWordCount = this.vtService.countLearnedWords()
        return <View style={[gstyles.c_start, { width: '100%' }]}>
            <View style={[gstyles.c_center, styles.shareContent]}>
                <View style={[gstyles.r_center, styles.userAvatar]}>
                    <Image source={this.props.avatarSource} style={{ width: 40, height: 40, borderRadius: 100, }} />
                </View>
                <Text style={gstyles.md_black}>{this.props.user.nickname}</Text>
                <View style={[gstyles.r_between, { width: '100%', marginVertical: 8 }]}>
                    <View style={gstyles.c_start}>
                        <Text style={gstyles.xl_black}>{learnedWordCount}</Text>
                        <Text style={gstyles.sm_lightBlack}>学习单词/个</Text>
                    </View>
                    <View style={gstyles.c_start}>
                        <Text style={gstyles.xl_black}>{signDaysCount}</Text>
                        <Text style={gstyles.sm_lightBlack}>完成打卡/天</Text>
                    </View>
                </View>
            </View>
        </View>
    }

    _share = (showSeal, signDaysCount) => {
        const imgSource = require('../../image/share_bg.png')
        ShareTemplate.show({
            commonModal: this.props.app.commonModal,
            bgSource: imgSource,
            renderContentView: this._renderShareContentView(signDaysCount),
            showSeal
        })
    }


    render() {

        const { task } = this.props.vocaPlay
        const { leftDays } = this.props.plan
        const DrawerPanel = <HomeDrawerPanel navigation={this.props.navigation}
            plan={this.props.plan.plan} closeDrawer={this._closeDrawerPanel} />

        return (
            <Drawer
                ref={(ref) => this._drawer = ref}
                type="static"
                content={DrawerPanel}
                captureGestures={true}
                negotiatePan={true} //该属性保证右滑打开
                panOpenMask={0.4}
                panCloseMask={0.2}
                openDrawerOffset={0.2} // 20% gap on the right side of drawer
                tapToClose={true}
                styles={{
                    mainOverlay: { backgroundColor: '#AAA', opacity: 0 },
                }}
                tweenDuration={250}
                tweenHandler={(ratio) => {
                    return {
                        mainOverlay: { opacity: ratio * 0.6 }
                    }
                }
                }
            >
                <View style={styles.container} >
                    <StatusBar translucent={false} barStyle="dark-content" />
                    <View style={styles.statusBar} />
                    {/*顶部背景和任务列表 */}
                    <HomeHeader
                        navigation={this.props.navigation}
                        home={this.props.home}
                        plan={this.props.plan}
                        app={this.props.app}
                        avatarSource={this.props.avatarSource}
                        hasNewMessage={this.props.hasNewMessage}
                        openDrawer={this._openDrawerPanel}
                        syncTask={this.props.syncTask}
                        syncGroup={this.props.syncGroup}
                        synAllLearnedDays={this.props.synAllLearnedDays}
                        synFinishDays={this.props.synFinishDays}
                    >
                        {leftDays >= 0 &&
                            <Task
                                navigation={this.props.navigation}
                                home={this.props.home}
                                bookType={this.props.plan.plan.bookType}
                                autoPlayTimer={this.props.vocaPlay.autoPlayTimer}
                                updateTask={this.props.updateTask}
                                changePlayTimer={this.props.changePlayTimer}
                            />
                        }
                        {leftDays < 0 &&
                            <View style={[gstyles.c_center, styles.finishView]}>
                                <AliIcon name='yiwanchengzhang' size={100} color={gstyles.secColor} />
                                <Button
                                    title='分享一下'
                                    titleStyle={gstyles.lg_black}
                                    containerStyle={{ width: 120, height: 60, marginTop: 15 }}
                                    buttonStyle={{
                                        backgroundColor: gstyles.mainColor,
                                        borderRadius: 50,
                                    }}
                                    onPress={() => this._share(false)}
                                />
                            </View>
                        }
                    </HomeHeader>

                    {/* 底部播放控制 */}
                    <HomeFooter {...this.props} task={task} />
                </View>
            </Drawer>
        );
    }

}

const mapStateToProps = state => ({
    app: state.app,
    home: state.home,
    plan: state.plan,
    vocaPlay: state.vocaPlay,

    avatarSource: state.mine.avatarSource,
    user: state.mine.user,
    hasNewMessage: state.mine.hasNewMessage
})


const mapDispatchToProps = {
    loadTasks: HomeAction.loadTasks,
    syncTask: HomeAction.syncTask,
    updateTask: HomeAction.updateTask,
    setErrorInLoadTask: HomeAction.setErrorInLoadTask,

    changeLeftDays: PlanAction.changeLeftDays,
    synAllLearnedDays: PlanAction.synAllLearnedDays,
    synFinishDays: PlanAction.synFinishDays,

    changePlayTimer: VocaPlayAction.changePlayTimer,
    clearPlay: VocaPlayAction.clearPlay,
    changePlayListIndex: VocaPlayAction.changePlayListIndex,

    syncGroup: VocaGroupAction.syncGroup,
    changeHasNewMessage: MineAction.changeHasNewMessage,
}
export default connect(mapStateToProps, mapDispatchToProps)(HomePage)



