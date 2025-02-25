import { Easing, Animated } from 'react-native'
import { createStackNavigator } from 'react-navigation';
import StackViewStyleInterpolator from 'react-navigation-stack/src/views/StackView/StackViewStyleInterpolator';


import HomePage from '../features/vocabulary/HomePage';
import VocaSearchPage from '../features/vocabulary/VocaSearchPage';
import VocaPlayPage from '../features/vocabulary/VocaPlayPage';
import VocaLibTabPage from '../features/vocabulary/VocaLibTabPage';
import VocaLibPayPage from '../features/vocabulary/VocaLibPayPage';
import VocaListTabPage from '../features/vocabulary/VocaListTabPage';
import VocaGroupPage from '../features/vocabulary/VocaGroupPage'
import GroupVocaPage from '../features/vocabulary/GroupVocaPage';
import StatisticsPage from '../features/vocabulary/StatisticsPage';
import HistoryBooksPage from '../features/vocabulary/HistoryBooksPage';
import LearnCardPage from '../features/vocabulary/LearnCardPage';
import ArticleManagePage from '../features/vocabulary/ArticleManagePage'

import TestVocaTranPage from '../features/vocabulary/TestVocaTranPage';
import TestTranVocaPage from '../features/vocabulary/TestTranVocaPage'
import TestSenVocaPage from '../features/vocabulary/TestSenVocaPage';
import TestPronTranPage from '../features/vocabulary/TestPronTranPage'
import BgSelectorPage from '../features/vocabulary/BgSelectorPage'
import VocaDetailPage from '../features/vocabulary/VocaDetailPage'

//文章模块
import AnalysisPage from '../features/reading/AnalysisPage'
import ArticleTabPage from '../features/reading/ArticleTabPage'


//我的模块
import AuthLoadingPage from '../features/mine/AuthLoadingPage'
import AccountPage from '../features/mine/AccountPage'
import PasswordPage from '../features/mine/PasswordPage'
import NicknamePage from '../features/mine/NicknamePage'
import DownloadManagePage from '../features/mine/DownloadManagePage'
import MessagePage from '../features/mine/MessagePage'
import MessageDetailPage from '../features/mine/MessageDetailPage'



import VocaPlanPage from '../features/vocabulary/VocaPlanPage';
import AboutPage from '../features/mine/AboutPage';
import DictPage from '../features/vocabulary/DictPage';
import PhonePage from '../features/mine/PhonePage';
import SettingPage from '../features/mine/SettingPage';
import H5Page from '../features/mine/H5Page';



const VocaHomeStackNav = createStackNavigator({
  // 首页
  Home: {
    screen: HomePage,
  },
  // 查词页面
  VocaSearch: {
    screen: VocaSearchPage,
  },
  // 计划页面
  VocaPlan: {
    screen: VocaPlanPage
  },
  // 词库页面
  VocaLibTab: {
    screen: VocaLibTabPage,
  },
  // 词库支付页面
  VocaLibPay: {
    screen: VocaLibPayPage,
  },
  // 单词列表
  VocaListTab: {
    screen: VocaListTabPage,
  },
  // 生词本
  VocaGroup: {
    screen: VocaGroupPage,
  },

  // 学习统计
  Statistics: {
    screen: StatisticsPage,
  },
  HistoryBooks: {
    screen: HistoryBooksPage
  },
  // 单词轮播
  VocaPlay: {
    screen: VocaPlayPage,
    navigationOptions: ({
      navigation
    }) => ({
      gesturesEnabled: true,
    }),

  },
  // 卡片学习
  LearnCard: {
    screen: LearnCardPage,
  },

  // 生词本的生词页
  GroupVoca: {
    screen: GroupVocaPage,
  },

  //文章管理页
  ArticleManage: {
    screen: ArticleManagePage,
  },

  // 单词选中义测试
  TestVocaTran: {
    screen: TestVocaTranPage,
  },
  // 听音选中义测试
  TestPronTran: {
    screen: TestPronTranPage,
  },
  // 中义选单词测试
  TestTranVoca: {
    screen: TestTranVocaPage
  },
  // 例句选词测试
  TestSenVoca: {
    screen: TestSenVocaPage,
  },

  //背景选择页
  BgSelector: {
    screen: BgSelectorPage
  },

  //单词详情页
  VocaDetail: {
    screen: VocaDetailPage,
  },

  // 词典页面
  Dict: {
    screen: DictPage
  },
  //解析页面
  Analysis: {
    screen: AnalysisPage,
    navigationOptions: ({
      navigation
    }) => ({
      gesturesEnabled: true,
    }),
  },
  //文章tab页
  ArticleTab: {
    screen: ArticleTabPage,
  },


  //我的页面
  AuthLoading: {
    screen: AuthLoadingPage
  },
  Account: {
    screen: AccountPage
  },
  Password: {
    screen: PasswordPage
  },
  Nickname: {
    screen: NicknamePage
  },
  Phone: {
    screen: PhonePage
  },

  // 首页侧面板
  Message: {
    screen: MessagePage
  },
  MessageDetail: {
    screen: MessageDetailPage
  },
  DownloadManage: {
    screen: DownloadManagePage
  },
  About: {
    screen: AboutPage
  },
  Setting: {
    screen: SettingPage
  },

  Privacy: {
    screen: H5Page
  }

}, {
  initialRouteName: 'Home',
  headerMode: 'none',
  initialRouteParams: {
    // articleInfo:article2
    // mode:Constant.NORMAL_PLAY
  },

  //跳转动画
  transitionConfig: () => ({
    transitionSpec: {
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
    },
    screenInterpolator: sceneProps => {
      const {
        layout,
        position,
        scene
      } = sceneProps;
      const {
        index,
        route
      } = scene;
      const params = route.params || {};
      const transition = params.transition;
      if (transition) { //如果指定了过渡方式
        // StackViewStyleInterpolator.forFade()
        // StackViewStyleInterpolator.forHorizontal()
        // StackViewStyleInterpolator.forVertical()
        // StackViewStyleInterpolator.forFadeFromBottomAndroid()
        // StackViewStyleInterpolator.forFadeToBottomAndroid()
        return StackViewStyleInterpolator[transition](sceneProps)
      }

      const initWidth = layout.initWidth;
      const translateX = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [initWidth, 0, 0],
      });

      const opacity = position.interpolate({
        inputRange: [index - 1, index - 0.99, index],
        outputRange: [0, 1, 1],
      });

      return {
        opacity,
        transform: [{
          translateX
        }]
      };
    },
  }),
});



export default VocaHomeStackNav;