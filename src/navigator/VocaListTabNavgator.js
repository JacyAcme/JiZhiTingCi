import React, {Component} from 'react';
import {Platform, StatusBar, ScrollView, StyleSheet,Text, View} from 'react-native';
import { createAppContainer, createMaterialTopTabNavigator, Button } from 'react-navigation';


import WrongListPage from '../page/vocabulary/WrongListPage';
import PassListPage from '../page/vocabulary/PassListPage';
import LearnedListPage from '../page/vocabulary/LearnedListPage';
import NewListPage from '../page/vocabulary/NewListPage';

const Dimensions = require('Dimensions');
let {width, height} = Dimensions.get('window');



export default createAppContainer(createMaterialTopTabNavigator(
  {
    '错词':{
        screen:WrongListPage
    },
    'Pass':{
        screen:PassListPage
    },
    '已学':{
        screen:LearnedListPage
    },
    '未学':{
        screen:NewListPage
    },

  },
  {
    
    initialRouteName: '错词',
    tabBarOptions: {
      activeTintColor:'#1890FF',
      inactiveTintColor:'#101010',
      pressColor:'#CBE4FD',
      style:{
        height:40,
        backgroundColor:'#FDFDFD',
        elevation: 0,
      },
      labelStyle: {fontSize:16,margin:0},
      indicatorStyle: {width:width/4-40, marginLeft:20, backgroundColor:'#1890FF'},

    },
   
  }
));



