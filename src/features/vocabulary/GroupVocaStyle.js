
import { StyleSheet, StatusBar, } from 'react-native';
import gstyles from '../../style';

const Dimensions = require('Dimensions');
const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const ITEM_HEIGHT = 60; //item的高度
const HEADER_HEIGHT = 24;  //分组头部的高度
const SEPARATOR_HEIGHT = 1;  //分割线的高度

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: gstyles.bgLightGray
    },
    iconText: {
        width: 32,
        height: 32,
        backgroundColor: '#1890FF',
        textAlign: 'center',
        lineHeight: 32,
        borderRadius: 50,
    },
    headerView: {
        justifyContent: 'center',
        height: HEADER_HEIGHT,
        paddingLeft: 20,
        backgroundColor: '#EFEFEF'
    },
    headerText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: gstyles.secColor
    },

    itemView: {
        height: ITEM_HEIGHT,
        backgroundColor: gstyles.bgLightGray,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#EFEFEF',
    },
    checkBox: {
        margin: 0,
        padding: 0,
    },

});

export default styles