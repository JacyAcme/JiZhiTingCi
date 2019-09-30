import React, {Component} from 'react';
import {Platform, StyleSheet, View, TouchableOpacity, TextInput} from 'react-native';
import {Header,Button} from 'react-native-elements'

import AliIcon from '../../component/AliIcon';
import gstyles from "../../style";


export default class NicknamePage extends React.Component {
    constructor(props){
        super(props);
        this.state={
            nickname:this.props.navigation.getParam('nickname')
        }
    }

    componentDidMount(){
    }

    _changeNickname = (nickname)=>{
        this.setState({nickname})
    }
    _modifyNickname = ()=>{
        const modifyNickname = this.props.navigation.getParam('modifyNickname')
        modifyNickname(this.state.nickname)
    }
    render(){
        return(
            <View style={[{flex:1},gstyles.c_start]}>
                {/* 头部 */}
                <Header
                    statusBarProps={{ barStyle: 'dark-content' }}
                    barStyle='dark-content' // or directly
                    leftComponent={
                        <AliIcon name='fanhui' size={26} color={gstyles.black} onPress={()=>{
                            this.props.navigation.goBack();
                        }} /> }

                    centerComponent={{ text: '修改昵称', style: gstyles.lg_black_bold}}
                    containerStyle={{
                        backgroundColor: gstyles.mainColor,
                        justifyContent: 'space-around',
                    }}
                />

                <View style={[gstyles.c_start, styles.content]}>
                    <TextInput
                        maxLength={12}
                        style={[styles.inputStyle,gstyles.lg_black]}
                        value={this.state.nickname}
                        onChangeText={this._changeNickname}
                    />
                    <Button
                        disabled={(this.state.password === null || this.state.password === '')}
                        title="确认修改"
                        titleStyle={gstyles.lg_black}
                        buttonStyle={styles.buttonStyle}
                        containerStyle={{width:'100%', marginTop:25}}
                        onPress={this._modifyNickname}
                    />
                </View>

            </View>
        );
    }
}



const styles = StyleSheet.create({
    content:{
        width:'80%',
        marginTop:25,
    },
    inputStyle: {
        height:gstyles.mdHeight,
        width:'100%',
        borderBottomColor:"#DFDFDF",
        borderBottomWidth:StyleSheet.hairlineWidth
    },
    buttonStyle:{
        height:gstyles.mdHeight,
        backgroundColor:'#FFE957',
        borderRadius:8
    }
})