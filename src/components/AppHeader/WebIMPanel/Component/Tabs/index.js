/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon, Tooltip } from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './index.less';

class Search extends Component {
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

  hideAddOperateList = (name) => {
    this.Timer = setTimeout(() => {
      this.setState({
        addOperateListVisible: false
      });
    }, 200);
  }

  render() {
    const addTab = _.find(this.props.model, item => item.name === 'add');
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
          <li>发起群聊</li>
          <li>群发通知</li>
        </ul>
      </div>
    );
  }
}

export default Search;
