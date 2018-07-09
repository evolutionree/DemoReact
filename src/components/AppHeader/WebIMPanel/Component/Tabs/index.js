/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

class Tabs extends Component {
  static propTypes = {
    model: PropTypes.array
  };
  static defaultProps = {
    model: []
  };
  constructor(props) {
    super(props);
    this.state = {
      addOperateListVisible: false
    };
    this.Timer = null;
  }
  componentWillReceiveProps(nextProps) {

  }

  tabClick = (name) => {
    this.props.onClick && this.props.onClick(name);
  }

  showAddOperateList = (name) => {
    if (name === 'add') {
      clearInterval(this.Timer);
      this.setState({
        addOperateListVisible: true
      });
    }
  }

  hideAddOperateList = () => {
    this.Timer = setTimeout(() => {
      this.setState({
        addOperateListVisible: false
      });
    }, 200);
  }

  originGroup = () => {
    this.props.dispatch({
      type: 'webIM/showPanel',
      payload: {
        showPanel: 'OriginGroup'
      }
    });
  }

  batchSend = () => {

  }

  render() {
    // <li onClick={this.batchSend}>群发通知</li>
    return (
      <div className={styles.wrap}>
        <ul className={styles.tabsWrap}>
          {
            this.props.model.map((item, index) => {
              return (
                <Tooltip placement="bottom" title={item.tooltip} key={index} overlayClassName="webIMTooltip">
                  <li onClick={this.tabClick.bind(this, item.name)}
                      onMouseOver={this.showAddOperateList.bind(this, item.name)}
                      onMouseOut={this.hideAddOperateList.bind(this, item.name)}
                      className={classnames(styles[item.name], { [styles.active]: item.active })}></li>
                </Tooltip>
              );
            })
          }
        </ul>
        <ul className={classnames(styles.addWrap, { [styles.visible]: this.state.addOperateListVisible })} onMouseOver={this.showAddOperateList.bind(this, 'add')} onMouseOut={this.hideAddOperateList} >
          <li onClick={this.originGroup}>发起群聊</li>
        </ul>
      </div>
    );
  }
}

export default connect(state => {
    return {
      ...state.webIM
    };
},
  dispatch => {
    return {
      dispatch
    };
  })(Tabs);
