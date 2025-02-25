import React, { Component } from "react";
import { StyleSheet, StatusBar, View, Text, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import * as Progress from 'react-native-progress'
import { Header } from 'react-native-elements'
import { connect } from 'react-redux'

import * as homeAction from './redux/action/homeAction'
import AliIcon from '../../component/AliIcon'
import gstyles from '../../style'
import VocaCard from "./component/VocaCard";
import VocaTaskDao from './service/VocaTaskDao'

import _util from '../../common/util'
import * as Constant from './common/constant'
import AudioService from '../../common/AudioService'
import LookWordBoard from "./component/LookWordBoard";
import { COMMAND_MODIFY_TASK } from "../../common/constant";
import VocaDao from "./service/VocaDao";
import VocaUtil from "./common/vocaUtil";
const Dimensions = require('Dimensions');
const { width, height } = Dimensions.get('window');


const styles = StyleSheet.create({
    nextBtn: {
        width: 60,
        height: 60,
        backgroundColor: '#FFE957',
        borderRadius: 50,
        elevation: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center'
    }
});

class LearnCardPage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            task: {
                curIndex: 0,
                taskWords: []
            },
            showWordInfos: [],
            showNext: true,
            refresh: false
        }
        this.audioService = AudioService.getInstance()
        this.taskDao = VocaTaskDao.getInstance()

        //检查本地时间
        _util.checkLocalTime()
    }

    componentDidMount() {
        //监听物理返回键
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this._goBack()
            return true
        })
        this._init()
    }

    componentWillUnmount() {
        this.backHandler && this.backHandler.remove('hardwareBackPress');
    }

    _init = () => {
        const { getParam } = this.props.navigation
        let task = getParam('task')
        if (!task) {
            const taskOrder = getParam('taskOrder')
            task = this.taskDao.getTaskByOrder(taskOrder)
        }
        showWordInfos = VocaDao.getInstance().getShowWordInfos(task.taskWords)

        this.setState({ task, showWordInfos })
    }

    _nextWord = () => {
        //停止播放音频
        this.audioService.releaseSound()
        //跳到下一个单词
        let task = this.state.task
        if (task.curIndex < task.wordCount - 1) {
            this.setState({ task: { ...task, curIndex: task.curIndex + 1 } })
        } else {
            const finalTask = { ...task, curIndex: 0, progress: Constant.IN_LEARN_TEST_1 }
            const routeName = this.props.navigation.getParam('nextRouteName')
            //更新任务
            this.props.updateTask({ task: finalTask })
            //完成卡片学习
            VocaUtil.goPageWithoutStack(this.props.navigation, routeName, {
                task: finalTask,
                showWordInfos: this.state.showWordInfos,
                nextRouteName: (this.props.bookType === Constant.TYPE_VOCA_BOOK_PHRASE) ? 'TestTranVoca' : 'TestSenVoca'
            })
            this.audioService.releaseSound()
        }
    }


    _goBack = () => {
        //更新、上传task
        const newTask = { ...this.state.task }
        this.props.updateTask({ task: newTask })
        this.props.syncTask({ command: COMMAND_MODIFY_TASK, data: newTask })

        VocaUtil.goPageWithoutStack(this.props.navigation, 'Home')
        this.audioService.releaseSound()

    }



    render() {
        const { getParam } = this.props.navigation
        const { showWordInfos, task } = this.state
        let { wordCount, curIndex } = task
        if (!wordCount) {
            wordCount = 100
        }
        return (
            <View style={{ flex: 1 }}>
                {/* 头部 */}
                <Header
                    statusBarProps={{ barStyle: 'dark-content' }}
                    barStyle="dark-content" // or directly
                    leftComponent={//返回
                        <AliIcon name='fanhui' size={26} color='#555' onPress={this._goBack} />}

                    centerComponent={
                        <View style={gstyles.r_center}>
                            <Progress.Bar progress={(curIndex + 1) / wordCount} height={10} width={width - 120} color='#FFE957' unfilledColor='#EFEFEF' borderWidth={0} >
                                <Text style={{ fontSize: 10, position: 'absolute', left: (width - 120) / 2, top: -2, }}>{`${curIndex + 1}/${wordCount}`}</Text>
                            </Progress.Bar>
                        </View>
                    }
                    rightComponent={
                        <AliIcon name='chazhao' size={22} color='#555' style={{ marginRight: 10 }} onPress={() => {
                            this.props.navigation.navigate('VocaSearch');
                        }} />
                    }
                    containerStyle={{
                        backgroundColor: '#FCFCFC00',
                        borderBottomColor: '#FCFCFC00',
                    }}
                />

                {showWordInfos.length > 0 && curIndex < task.wordCount &&
                    <VocaCard
                        navigation={this.props.navigation}
                        wordInfo={showWordInfos[curIndex]}
                        showAll={getParam('showAll', true)}
                        playWord={getParam('playWord', true)}
                        playSentence={this.props.configAutoPlaySen}
                        lookWord={this.wordBoard.lookWord}
                    />
                }
                {this.state.showNext &&
                    <View style={styles.nextBtn}
                        onStartShouldSetResponder={e => true}
                        onResponderGrant={e => this._nextWord()}
                    >
                        <Text style={gstyles.md_black}>Next</Text>
                    </View>
                }

                <LookWordBoard
                    ref={ref => this.wordBoard = ref}
                    navigation={this.props.navigation}
                    onStateChange={(isOpen) => this.setState({ showNext: !isOpen })}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    configAutoPlaySen: state.mine.configAutoPlaySen,
    home: state.home,
    bookType: state.plan.plan.bookType,
})

const mapDispatchToProps = {
    updateTask: homeAction.updateTask,
    syncTask: homeAction.syncTask,
}


export default connect(mapStateToProps, mapDispatchToProps)(LearnCardPage)