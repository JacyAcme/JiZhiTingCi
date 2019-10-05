

import React, { Component } from 'react';
import { StyleSheet,Text, View,Image,TouchableOpacity} from 'react-native';
import {PropTypes} from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Constant from '../common/constant'
import VocaUtil from '../../vocabulary/common/vocaUtil'
import AliIcon from '../../../component/AliIcon'
import gstyles from '../../../style'
import {DETAIL_READ,MULTI_SELECT_READ ,FOUR_SELECT_READ ,EXTENSIVE_READ} from "../../reading/common/constant";

export default class TaskItem extends Component {
  static propTypes = {
    index: PropTypes.number,
    item: PropTypes.object,
    separator: PropTypes.any,
    progressNum: PropTypes.number,
    disable: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  
  //开始学习
  _startStudy = ()=>{
      if(this.props.disable){
        //提示先完成新学任务
        this.props.toastRef.show('需要您先完成新学任务哦')
      }else{
        //根据进度进行不同的跳转
        let {index, item } = this.props
        //如果是1复任务 且未点击
        if(item.status === Constant.STATUS_1 ){
          let task = null
          for(let t of this.props.home.tasks){
            if(t.taskOrder === item.taskOrder && t.status === Constant.STATUS_0){
              task = t
              break
            }
          }
          if(task && item.listenTimes < task.listenTimes){
            item = {...item, listenTimes:task.listenTimes, testTimes:task.testTimes}
            this.props.updateTask(item)
          }
        }
        switch(item.progress){
          case Constant.IN_LEARN_PLAY:
            this.props.navigation.navigate('VocaPlay',{task:item, mode:Constant.LEARN_PLAY, nextRouteName:'LearnCard'})
          break;
          case Constant.IN_LEARN_CARD:
            this.props.navigation.navigate('LearnCard',{task:item,
              showAll:false,
              playWord:true,      //自动播放单词
              playSentence:true,  //自动播放例句
              nextRouteName:'TestVocaTran'})
          break;
          case Constant.IN_LEARN_TEST_1:
            this.props.navigation.navigate('TestVocaTran',{task:item, isRetest:false, nextRouteName:'TestSenVoca'})
          break;
          case Constant.IN_LEARN_RETEST_1:
            this.props.navigation.navigate('TestVocaTran',{task:item,  isRetest:true, nextRouteName:'TestSenVoca'})
          break;
          case Constant.IN_LEARN_TEST_2:
            this.props.navigation.navigate('TestSenVoca',{task:item,  isRetest:false, nextRouteName:'Home'})
          break;
          case Constant.IN_LEARN_RETEST_2:
            this.props.navigation.navigate('TestSenVoca',{task:item,  isRetest:true, nextRouteName:'Home'})
          break;
          //复习
          case Constant.IN_REVIEW_PLAY:
            this.props.navigation.navigate('VocaPlay',{task:item, mode:Constant.REVIEW_PLAY,  nextRouteName:'TestVocaTran'})
          break;
          case Constant.IN_REVIEW_TEST:
            this.props.navigation.navigate('TestVocaTran',{task:item, isRetest:false, nextRouteName:'Home'})
          break;
          case Constant.IN_REVIEW_RETEST:
            this.props.navigation.navigate('TestVocaTran',{task:item, isRetest:true, nextRouteName:'Home'})
          break;

        }
      }
      
  }

  _renderRight = ()=>{
    const { item, progressNum } = this.props
    const hasScore = (item.score !== -1)
    const textStyle = hasScore?{fontSize:22,color:gstyles.emColor,marginRight:5,}:gstyles.md_gray
    let type = ''
    switch (item.type) {
      case DETAIL_READ:
        type = '仔细阅读'
        break
      case MULTI_SELECT_READ:
        type = '选词填空'
        break
      case FOUR_SELECT_READ:
        type = '四选一'
        break
      case EXTENSIVE_READ:
        type = '泛读'
        break
    }
    if(this.isVocaTask){
      if(progressNum === 100){
        return <View style={styles.playView}>
                <View style={[gstyles.r_center,styles.finishIcon]}>
                  <AliIcon name='wancheng' size={16} color={gstyles.black} />
                </View>
                <Text style={[{marginLeft:12,},gstyles.md_black]}>已完成</Text>
            </View>
      }else{
        return <View style={styles.playView}>
                <FontAwesome name="play-circle" size={24} color="#999"/>
                <Text style={[{marginLeft:12,}, gstyles.md_gray]}>待完成</Text>
            </View>
      }
    }else{
      return <View style={[{height:'100%'},gstyles.r_start]}>
        <Text style={textStyle}>{hasScore?item.score+'%':type}</Text>
      </View>
    }
   
  }

  _startRead = ()=>{
    this.props.navigation.navigate('ArticleTab',{articleInfo:this.props.item })
  }

  render() {
    this.isVocaTask = (this.props.item.taskType === Constant.TASK_VOCA_TYPE)
    const {index, item, progressNum, disable } = this.props
    //任务名
    let name = '', label = '', note = ''
    if(this.isVocaTask){
      name = VocaUtil.genTaskName(item.taskOrder)
      label = (item.status===Constant.STATUS_0?'新学':'复习')
      note = `共${item.wordCount}词，已完成${progressNum}%`
    }else{
      name = item.name
      label = '推荐'
      note = item.note
    }
    const disableView = disable?{
      backgroundColor:'#F4F4F4'
    }:null

    //点击透明度
    let activeOpacity = this.props.disable?0.8:0.5
    if(progressNum === 100){
      activeOpacity = 1
    }
    return (
      <TouchableOpacity 
      activeOpacity={activeOpacity}
      onPress={this.isVocaTask?this._startStudy:this._startRead}>
        <View style={[{paddingHorizontal:12}, disableView]}>
            <View style={[this.props.separator,styles.container]}>
              <View style={gstyles.r_start}>
                <View style={[gstyles.c_center, {marginRight:10}]}>
                  <Text style={gstyles.serialText}>{index<10?'0'+index:index}</Text>
                </View>
                <View stye={styles.nameView}>
                  <Text style={[gstyles.md_black,{fontWeight:'500'}]}>{name}</Text>
                  <View style={styles.noteView}>
                    <Text style={styles.labelText}>{label}</Text>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                </View>
              </View>
              {
                this._renderRight()
              }
            </View>
        </View>
        
      </TouchableOpacity>
    );
  }
}


const styles = StyleSheet.create({

  container: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingTop: 14,
    paddingBottom: 12,
  },
 
  nameView: {
    flex: 1
  },

  noteView:{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
  },
  noteText: {
    fontSize:12,
    lineHeight: 24,
    marginLeft:3,
  },
  labelText: {
    textAlign:'center',
    paddingTop:2,
    lineHeight: 8,
    paddingHorizontal: 2,
    fontSize:8,
    color:gstyles.black,
    backgroundColor: gstyles.mainColor,
    borderRadius: 3,
  },
  playView:{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
  },

  finishIcon:{
    width:22,
    height:22,
    backgroundColor:gstyles.mainColor,
    borderRadius:50,
  }
});

