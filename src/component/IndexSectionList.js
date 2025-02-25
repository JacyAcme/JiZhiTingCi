import React, {PureComponent} from 'react'
import {Text, View, StyleSheet} from 'react-native'
import {PropTypes} from 'prop-types';
const returnTrue = () => true;


export  default class IndexSectionList extends PureComponent {

    static propTypes = {
        //这边是需要显示的数据信息
        sections: PropTypes.array,
        //点击拖动选择时候的回调
        onSectionSelect: PropTypes.func,
        //手指抬起的时候的回调
        onSectionUp: PropTypes.func
    }

    constructor(props, context) {
        super(props, context);

        this.lastSelectedIndex = null;
        this.state = {text: '', isShow: false}
    }

    componentWillUnmount(){
    }


    render() {
        return (
            <View
                pointerEvents='box-none'
                style={styles.topView}>
                {this.state.isShow ?
                    <View style={styles.modelView}>
                        <View style={styles.viewShow}>
                            <Text style={styles.textShow}>{this.state.text}</Text>
                        </View>
                    </View> : null
                }
                <View
                    style={styles.container}
                    ref="view"
                    onStartShouldSetResponder={returnTrue}
                    onMoveShouldSetResponder={returnTrue}
                    onResponderGrant={this.detectAndScrollToSection}
                    onResponderMove={this.detectAndScrollToSection}
                    onResponderRelease={this.resetSection}>
                    {this._getSections()}
                </View>
            </View>
        )
    }

    _getSections = () => {
        let array = new Array();
        for (let i = 0; i < this.props.sections.length; i++) {
            array.push(
                <View
                    style={styles.sectionView}
                    pointerEvents="none"
                    key={i}
                    ref={'sectionItem' + i}>
                    <Text
                        style={styles.sectionItem}>{this.props.sections[i]}</Text>
                </View>)
        }
        return array;
    }

    onSectionSelect(section, index, fromTouch) {
        this.props.onSectionSelect && this.props.onSectionSelect(section, index);

        if (!fromTouch) {
            this.lastSelectedIndex = null;
        }
    }

    componentWillUnmount() {
        this.measureTimer && clearTimeout(this.measureTimer);
    }

    componentDidMount() {
        //它们的高度都是一样的，所以这边只需要测量一个就好了
        const sectionItem = this.refs.sectionItem0;

        this.measureTimer = setTimeout(() => {
            sectionItem.measure((x, y, width, height, pageX, pageY) => {
                this.measure = {
                    y: pageY,
                    height
                };
            })
        }, 0);
    }

    detectAndScrollToSection = (e) => {
        var ev = e.nativeEvent.touches[0];
        let targetY = ev.pageY;
        const {y, height} = this.measure;
        if (!y || targetY < y) {
            return;
        }
        let index = Math.floor((targetY - y) / height);
        index = Math.min(index, this.props.sections.length - 1);
        if (this.lastSelectedIndex !== index && index < this.props.sections.length) {
            this.lastSelectedIndex = index;
            this.onSectionSelect(this.props.sections[index], index, true);
            this.setState({text: this.props.sections[index], isShow: true});
        }
    }

    resetSection = () => {
        // 手指抬起来的时候需要变回去
        this.refs.view.setNativeProps({
            style: {
                backgroundColor: 'transparent'
            }
        })
        this.setState({isShow: false})
        this.lastSelectedIndex = null;
        this.props.onSectionUp && this.props.onSectionUp();
    }
}

const styles = StyleSheet.create({

    topView: {
        flex: 1,
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        left: 0
    },

    modelView: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        position: 'absolute',
        backgroundColor: 'transparent',
        right: 0,
        top: 0,
        bottom: 0,
        left: 0
    },

    viewShow: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#666',
        width: 80,
        height: 80,
        borderRadius: 3
    },

    textShow: {
        fontSize: 50,
        color: '#fff',
    },

    container: {
        position: 'absolute',
        backgroundColor: 'transparent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        
        right: 0,
        top: 0,
        bottom: 0,
        width: 15,
    },

    sectionView: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    sectionItem: {
        fontSize: 12,
        color:'#F29F3F'
    }
});