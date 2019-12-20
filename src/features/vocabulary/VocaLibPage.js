import React, { Component } from "react";
import { View, Text, Image, FlatList } from 'react-native';
import { Header } from 'react-native-elements'
import Picker from 'react-native-picker';
import { connect } from 'react-redux';
import CardView from 'react-native-cardview'
import * as VocaLibAction from './redux/action/vocaLibAction'

import AliIcon from '../../component/AliIcon';
import styles from './VocaLibStyle'
import gstyles from "../../style";
import {CountDownLoader} from "../../component/Loader";
import _util from '../../common/util'

class VocaLibPage extends Component {

    constructor(props) {
        super(props)

        this.planTimer = null
        
    }

    componentDidMount() {
        //加载书籍
        this.props.loadVocaBooks()
    }

    componentWillUnmount() {
        if (this.planTimer) {
            clearTimeout(this.planTimer)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.home.isLoadPending === true && nextProps.home.isLoadPending === false) {
            this.props.navigation.goBack()
            return false
        } else {
            return true
        }
    }

    /**显示选择器 */
    _show = (el, index) => {
        let data = [
            ['新学10/复习50',      //10
                '新学14/复习70',
                '新学20/复习100',
                '新学26/复习130',
                '新学36/复习180',]
        ];
        let selectedValue = [15];
        Picker.init({
            pickerTextEllipsisLen: 10,
            pickerData: data,
            selectedValue: selectedValue,
            pickerCancelBtnText: '取消',
            pickerTitleText: el.name,
            pickerConfirmBtnText: '确定',
            pickerCancelBtnColor: [30, 30, 30, 1],
            pickerTitleColor: [30, 30, 30, 1],
            pickerConfirmBtnColor: [30, 30, 30, 1],
            pickerToolBarBg: [255, 233, 87, 1],
            onPickerConfirm: async (data) => {
                // console.log(data)
                const sum = parseInt(data[0].replace(/新学(\d+).+/, '$1'))
                let taskCount = null
                let taskWordCount = null
                if (sum <= 19) {
                    taskCount = 1 //1
                } else if (sum <= 34) {
                    taskCount = 2 //2
                } else if (sum <= 54) {
                    taskCount = 3 //3
                }
                taskWordCount = sum / taskCount
                console.log('制定计划，单词书编号为：' + el._id)
                console.log(taskCount, taskWordCount);
                //提交计划
                if (taskCount !== null && taskWordCount !== null) {
                    const isExacted = await _util.checkLocalTime()
                    if(isExacted){
                        this.props.changeVocaBook({
                            bookId: el._id,
                            totalWordCount: el.count,
                            taskCount: taskCount,
                            taskWordCount: taskWordCount,
                            lastLearnDate: this.props.home.lastLearnDate
                        })
                        //开始倒计时
                        this.refs.countDownLoader && this.refs.countDownLoader.countDown(7)
                    }
                } else {
                    console.error('VocaLibPage: 设置计划时，数据错误！')
                }
            },
            onPickerCancel: data => {
                console.log(data);
            },
            onPickerSelect: data => {
            }
        });
        Picker.show();
    }

    _renderBook = ({ item, index }) => {
        return <View style={[styles.c_center, styles.bookView]}
            onStartShouldSetResponder={(e) => true}
            onResponderGrant={(e) => this._show(item, index)}
        >
            <CardView
                cardElevation={5}
                cardMaxElevation={5}
                style={styles.imgCard}
            >
                <Image source={{ uri: item.coverUrl }} style={styles.img} />
            </CardView>
            <Text style={styles.bookname}>{item.name}</Text>
            <Text style={styles.noteText}>共<Text style={[styles.noteText, { color: '#F29F3F' }]}>{item.count}</Text>个单词</Text>
        </View>
    }

    

    _renderContent = () => {
        const { books, isLoadPending, loadingType } = this.props.vocaLib
        if (isLoadPending) {
            return <CountDownLoader ref="countDownLoader" />
        } else {
            return <FlatList
                data={books}
                renderItem={this._renderBook}
                keyExtractor={item => item._id}
                ItemSeparatorComponent={() => <View style={{ borderBottomWidth: 1, borderBottomColor: '#A8A8A8' }}></View>}
                // 水平布局的列的数量
                numColumns={2}
            />
        }
    }

    render() {
        const { plan } = this.props.vocaLib
        //数据
        return (
            <View style={{ flex: 1 }}>
                <Header
                    statusBarProps={{ barStyle: 'dark-content' }}
                    barStyle='dark-content' // or directly
                    leftComponent={
                        <AliIcon name='fanhui' size={26} color={gstyles.black} onPress={() => {
                            this.props.navigation.goBack();
                            Picker.hide()
                        }} />}

                    centerComponent={{ text: '词库', style: gstyles.lg_black_bold }}
                    containerStyle={{
                        backgroundColor: gstyles.mainColor,
                        justifyContent: 'space-around',
                    }}
                />

                {
                    this._renderContent()
                }
            </View>


        );
    }
}
const mapStateToProps = state => ({
    vocaLib: state.vocaLib,
    home: state.home
});

const mapDispatchToProps = {
    loadVocaBooks: VocaLibAction.loadVocaBooks,
    changeVocaBook: VocaLibAction.changeVocaBook
}


export default connect(mapStateToProps, mapDispatchToProps)(VocaLibPage);