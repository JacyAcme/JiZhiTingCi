import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableNativeFeedback } from 'react-native';
import { connect } from 'react-redux'

import * as homeAction from './redux/action/homeAction'
import * as vocaPlayAction from './redux/action/vocaPlayAction'
import AliIcon from '../../component/AliIcon'
import TestPage from "./TestPage";
import * as Constant from './common/constant'
import vocaUtil from './common/vocaUtil'
import AudioService from '../../common/AudioService'
import * as PlanAction from "./redux/action/planAction";
import * as CConstant from "../../common/constant";

const styles = StyleSheet.create({

    content: {
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 1
    },
    phoneticView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordFont: {
        fontSize: 30,
        color: '#202020',
        fontWeight: '600'
    },
    wrongText: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: '#EC6760',
        fontSize: 16,
    }
});

class TestVocaTranPage extends Component {

    constructor(props) {
        super(props);
        console.disableYellowBox = true
    }

    _playAudio = (pronUrl) => {
        AudioService.getInstance().playSound({
            pDir: CConstant.VOCABULARY_DIR,
            fPath: pronUrl
        })
    }

    _renderContent = (taskWord, wordInfo) => {
        const word = wordInfo.word
        const pronUrl = wordInfo.pron_url
        const phonetic = wordInfo.phonetic
        const testWrongNum = taskWord.testWrongNum
        const pronTypeText = (this.props.mine.configVocaPronType === Constant.VOCA_PRON_TYPE_EN) ? '英' : '美'
        return <View style={styles.content}>
            <View style={{}}>
                <Text style={styles.wordFont}>{word}</Text>
            </View>
            {phonetic &&
                <View style={styles.phoneticView}>
                    <Text>{`${pronTypeText} ${phonetic}`}</Text>
                    <AliIcon name='shengyin' size={26} color='#555' style={{ marginLeft: 5 }} onPress={() => {
                        this._playAudio(pronUrl)
                    }} />
                </View>
            }
            <Text style={styles.wrongText}>{`答错${testWrongNum}次`}</Text>
        </View>
    }

    render() {
        return (
            <TestPage
                {...this.props}
                mode={this.props.navigation.getParam('mode')}
                type={Constant.WORD_TRAN}
                playAudio={this._playAudio}
                renderContent={this._renderContent}
                testTime={7}
            />
        )
    }
}



const mapStateToProps = state => ({
    home: state.home,
    vocaPlay: state.vocaPlay,
    mine: state.mine
})

const mapDispatchToProps = {
    updateTask: homeAction.updateTask,
    syncTask: homeAction.syncTask,
    changeLearnedWordCount: PlanAction.changeLearnedWordCount,
    updatePlayTask: vocaPlayAction.updatePlayTask,
    changeTestTimes: vocaPlayAction.changeTestTimes
}


export default connect(mapStateToProps, mapDispatchToProps)(TestVocaTranPage)