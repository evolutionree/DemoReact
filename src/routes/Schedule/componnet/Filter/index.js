/**
 * Created by 0291 on 2017/12/25.
 */
import React, { Component } from 'react';
import { Switch, Icon } from 'antd';
import CheckBox from './CheckBox';
import Styles from './index.less';


class Filter extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.hideList, false);
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {
    document.removeEventListener('click', this.hideList, false);
  }

  hideList = (e) => {
    this.setState({
      visible: false
    });
  }

  toggleVisible(e) {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      visible: !this.state.visible
    });
  }

  switchChange(e) {

  }

  render() {
    return (
      <div className={Styles.filterWrap}>
        <div className={Styles.Header}>
          <span onClick={this.toggleVisible.bind(this)}>
            <Icon type="filter" /><span>筛选</span>
          </span>
          <span className={Styles.sperate}>|</span><span>返回今天</span>
        </div>
        <div style={{ display: this.state.visible ? 'block' : 'none' }} className={Styles.Panel} onClick={(e) => {
          e.nativeEvent.stopImmediatePropagation();
        }}>
          <div>筛选分类</div>
          <ul className={Styles.checkBoxWrap}>
            <li>
              <CheckBox checked /><span>拜访客户</span>
            </li>
            <li>
              <CheckBox theme="orange" /><span>会议</span>
            </li>
            <li>
              <CheckBox theme="purple" /><span>其他</span>
            </li>
          </ul>
          <ul className={Styles.switButtonWrap}>
            <li>
              <span>显示任务</span><Switch size="small" defaultChecked onChange={this.switchChange.bind(this)} />
            </li>
            <li>
              <span>显示已完成任务</span><Switch size="small" defaultChecked onChange={this.switchChange.bind(this)} />
            </li>
          </ul>
        </div>
      </div>
    );
  }
}


export default Filter;
